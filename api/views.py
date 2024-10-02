from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.shortcuts import render
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from api.models import ChatRoom
from api.serializers import UserSerializer, ChatRoomSerializer


def homepage(request):
    if request.user is None or request.user.is_anonymous:
        return render(request, 'index.html')
    user = request.user
    chat_rooms = ChatRoom.objects.filter(users=user)
    return render(request, 'chat.html', {'chat_rooms': chat_rooms})


class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({'success': True, 'message': 'Login successful'}, status=status.HTTP_200_OK)
        return Response({'success': False, 'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logout(request)
        return Response({'success': True, 'message': 'Logout successful'}, status=status.HTTP_200_OK)


class SignupView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        password_check = request.data.get('password_check')
        if password != password_check:
            return Response({'success': False, 'message': "Passwords don't match"}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=username, password=password)
        login(request, user)
        return Response({'success': True, 'message': 'Login successful'}, status=status.HTTP_200_OK)


class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.exclude(id=request.user.id)
        serializer = UserSerializer(users, many=True)
        return Response({'success': True, 'message': 'Room created', 'users': serializer.data}, status=status.HTTP_200_OK)


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
                    return Response({'success': True, 'message': 'Room created', 'room': serializer.data}, status=status.HTTP_200_OK)

            chat_room = ChatRoom.objects.create()
            chat_room.users.set(selected_users)
            serializer = ChatRoomSerializer(chat_room)
            return Response({'success': True, 'message': 'Room created', 'room': serializer.data}, status=status.HTTP_200_OK)
        return Response({'success': False, 'message': "Can't create room"}, status=status.HTTP_400_BAD_REQUEST)

class ChatListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        chat_rooms = ChatRoom.objects.filter(users=user)
        serializer = ChatRoomSerializer(chat_rooms, many=True)
        return Response({'success': True, 'message': 'Room created', 'rooms': serializer.data}, status=status.HTTP_200_OK)
