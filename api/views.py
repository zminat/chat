import os

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.shortcuts import render
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from api.models import ChatRoom, Message
from api.serializers import UserSerializer, ChatRoomSerializer, MessageSerializer


def homepage(request):
    if request.user is None or request.user.is_anonymous:
        return render(request, 'index.html')
    user = request.user
    chat_rooms = ChatRoom.objects.filter(users=user)

    selected_chat_room = chat_rooms.first()
    messages = Message.objects.filter(chat_room=selected_chat_room) if selected_chat_room else []

    avatar_url = f'/static/images/avatars/{user.id}.jpg' if os.path.exists(f'static/images/avatars/{user.id}.jpg') else '/static/images/avatars/default.jpg'

    context = {
        'user': user,
        'chat_rooms': chat_rooms,
        'selected_chat_room': selected_chat_room,
        'messages': messages,
        'avatar_url': avatar_url,
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
        users.append(request.user.id)

        selected_users = User.objects.filter(id__in=users)
        if selected_users.exists():
            possible_rooms = ChatRoom.objects.filter(users__in=selected_users).distinct()
            for room in possible_rooms:
                room_users = set(room.users.all())
                if room_users == set(selected_users):
                    serializer = ChatRoomSerializer(room)
                    return Response({'message': 'Room created', 'room': serializer.data}, status=status.HTTP_200_OK)

            chat_room = ChatRoom.objects.create()
            chat_room.users.set(selected_users)
            serializer = ChatRoomSerializer(chat_room)
            return Response({'message': 'Room created', 'room': serializer.data}, status=status.HTTP_200_OK)
        return Response({'message': "Can't create room"}, status=status.HTTP_400_BAD_REQUEST)


class ChatListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        chat_rooms = ChatRoom.objects.filter(users=user)
        serializer = ChatRoomSerializer(chat_rooms, many=True)
        return Response({'message': 'Room created', 'rooms': serializer.data}, status=status.HTTP_200_OK)


class MessageListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer

    def get_queryset(self):
        chat_room_id = self.kwargs.get('chat_room_id')
        return Message.objects.filter(chat_room_id=chat_room_id).order_by('timestamp')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        current_user = request.user.username
        return Response({
            'current_user': current_user,
            'messages': serializer.data
        })


import time

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
