from django.contrib.auth.models import User
from rest_framework import serializers
from api.models import ChatRoom


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class ChatRoomSerializer(serializers.ModelSerializer):
    users_list = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ['id', 'users_list']

    def get_users_list(self, obj):
        return str(obj)