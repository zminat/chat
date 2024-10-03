import os
import time

from asgiref.sync import async_to_sync
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Max
from django.shortcuts import render
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from api.models import ChatRoom, Message
from api.serializers import UserSerializer, ChatRoomSerializer, MessageSerializer
from channels.layers import get_channel_layer

channel_layer = get_channel_layer()

def homepage(request):
    if request.user is None or request.user.is_anonymous:
        return render(request, 'index.html')

    user = request.user
    chat_rooms = ChatRoom.objects.filter(users=user).annotate(last_message_time=Max('messages__timestamp')).order_by('-last_message_time')

    selected_chat_room = chat_rooms.first()
    messages = Message.objects.filter(chat_room=selected_chat_room).select_related('sender') if selected_chat_room else []

    user_avatar = f'static/images/avatars/{user.id}.jpg'
    if not os.path.exists(user_avatar):
        user_avatar = 'static/images/avatars/default.jpg'

    messages_with_avatars = []
    for message in messages:
        sender_avatar = f'static/images/avatars/{message.sender.id}.jpg'
        if not os.path.exists(sender_avatar):
            sender_avatar = 'static/images/avatars/default.jpg'

        messages_with_avatars.append({
            'text': message.text,
            'sender': message.sender,
            'sender_id': message.sender.id,
            'avatar': sender_avatar
        })

    selected_chat_room_name = selected_chat_room if selected_chat_room else ""

    context = {
        'user': user,
        'chat_rooms': chat_rooms,
        'selected_chat_room': selected_chat_room_name,
        'messages': messages_with_avatars,
        'user_avatar': user_avatar
    }

    return render(request, 'chat.html', context)


class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({'message': 'Login successful'}, status=status.HTTP_200_OK)
        return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logout(request)
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


class SignupView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        password_check = request.data.get('password_check')
        if password != password_check:
            return Response({'message': "Passwords don't match"}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=username, password=password)
        login(request, user)
        return Response({'message': 'Login successful'}, status=status.HTTP_200_OK)


class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.exclude(id=request.user.id)
        serializer = UserSerializer(users, many=True)
        return Response({'message': 'Room created', 'users': serializer.data}, status=status.HTTP_200_OK)


class CreateChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        users = request.data.getlist('users')
        user_id = request.user.id
        users.append(user_id)

        selected_users = User.objects.filter(id__in=users)
        if selected_users.exists():
            possible_rooms = ChatRoom.objects.filter(users__in=selected_users).distinct()
            for room in possible_rooms:
                room_users = set(room.users.all())
                if room_users == set(selected_users):
                    serializer = ChatRoomSerializer(room)
                    return Response({'message': 'Room existed', 'room': serializer.data}, status=status.HTTP_200_OK)

            chat_room = ChatRoom.objects.create()
            chat_room.users.set(selected_users)
            serializer = ChatRoomSerializer(chat_room)

            other_users = selected_users.exclude(id=user_id)
            for user in other_users:
                async_to_sync(channel_layer.group_send)(
                    f'user_{user.id}',
                    {
                        'type': 'new_chat',
                        'room': serializer.data
                    }
                )
            return Response({'message': 'Room created', 'room': serializer.data}, status=status.HTTP_200_OK)

        return Response({'message': "Can't create room"}, status=status.HTTP_400_BAD_REQUEST)


class ChatUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chat_id):
        try:
            chat_room = ChatRoom.objects.get(id=chat_id, users=request.user)
            users_in_chat = chat_room.users.all()
            all_users = User.objects.exclude(id=request.user.id)

            user_data = []
            for user in all_users:
                user_data.append({
                    'id': user.id,
                    'username': user.username,
                    'is_in_chat': user in users_in_chat,
                })

            return Response({'users': user_data}, status=status.HTTP_200_OK)
        except ChatRoom.DoesNotExist:
            return Response({'message': 'Chat room not found or access denied'}, status=status.HTTP_404_NOT_FOUND)


class EditChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chat_id):
        users = request.data.getlist('users')
        users.append(request.user.id)

        selected_users = User.objects.filter(id__in=users)
        if selected_users.exists():
            possible_rooms = ChatRoom.objects.filter(users__in=selected_users).distinct()
            for room in possible_rooms:
                room_users = set(room.users.all())
                if room_users == set(selected_users):
                    serializer = ChatRoomSerializer(room)
                    return Response({'message': 'Room existed', 'room': serializer.data}, status=status.HTTP_200_OK)

            chat_room = ChatRoom.objects.get(id=chat_id)
            chat_room.users.set(selected_users)
            serializer = ChatRoomSerializer(chat_room)
            return Response({'message': 'Room updated', 'room': serializer.data}, status=status.HTTP_200_OK)

        return Response({'message': "Can't update room"}, status=status.HTTP_400_BAD_REQUEST)


class DeleteChatView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, chat_id):
        try:
            chat_room = ChatRoom.objects.get(id=chat_id, users=request.user)
            other_user_ids = list(chat_room.users.exclude(id=request.user.id).values_list('id', flat=True))
            chat_room.delete()

            for user_id in other_user_ids:
                async_to_sync(channel_layer.group_send)(
                    f'user_{user_id}',
                    {
                        'type': 'delete_chat',
                        'room_id': chat_id
                    }
                )

            return Response({'message': 'Chat deleted successfully'}, status=status.HTTP_200_OK)
        except ChatRoom.DoesNotExist:
            return Response({'message': 'Chat not found or access denied'}, status=status.HTTP_404_NOT_FOUND)


class ChatListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        chat_rooms = ChatRoom.objects.filter(users=user).annotate(last_message_time=Max('messages__timestamp')).order_by('-last_message_time')
        serializer = ChatRoomSerializer(chat_rooms, many=True)
        return Response({'message': 'Rooms retrieved', 'rooms': serializer.data}, status=status.HTTP_200_OK)


class MessageListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer

    def get_queryset(self):
        chat_room_id = self.kwargs.get('chat_id')
        return Message.objects.filter(chat_room_id=chat_room_id).order_by('timestamp')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        messages_with_avatars = []

        for message in queryset:
            sender_avatar = f'static/images/avatars/{message.sender.id}.jpg'
            if not os.path.exists(sender_avatar):
                sender_avatar = 'static/images/avatars/default.jpg'

            messages_with_avatars.append({
                'text': message.text,
                'sender': message.sender.username,
                'sender_id': message.sender.id,
                'sender_avatar': sender_avatar,
                'timestamp': message.timestamp.isoformat()
            })

        return Response({
            'current_user': {
                'username': request.user.username,
                'id': request.user.id
            },
            'messages': messages_with_avatars
        })


class GetProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        avatar_path = f'static/images/avatars/{user.id}.jpg'

        if not os.path.exists(avatar_path):
            avatar_path = 'static/images/avatars/default.jpg'

        timestamp = int(time.time())

        return Response({
            'username': user.username,
            'user_id': user.id,
            'avatar': f'{avatar_path}?t={timestamp}'
        })


class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        user = request.user
        username = request.data.get('username')
        avatar = request.FILES.get('avatar')

        if username:
            user.username = username
            user.save()

        avatar_url = None
        if avatar:
            avatar_path = f'static/images/avatars/{user.id}.jpg'
            with open(avatar_path, 'wb') as avatar_file:
                for chunk in avatar.chunks():
                    avatar_file.write(chunk)
            avatar_url = f'static/images/avatars/{user.id}.jpg'

        return Response({
            'message': 'Profile updated',
            'avatar': avatar_url or 'static/images/avatars/default.jpg'
        }, status=status.HTTP_200_OK)
