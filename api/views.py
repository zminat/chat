from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.shortcuts import render
from django.views.decorators.csrf import csrf_protect
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


def homepage(request):
    if request.user is not None and not request.user.is_anonymous:
        return render(request, 'chat.html')
    return render(request, 'index.html')


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
        user = User.objects.create_user(username = username, password = password)
        login(request, user)
        return Response({'success': True, 'message': 'Login successful'}, status=status.HTTP_200_OK)
