from django.db import models
from django.contrib.auth.models import User


class ChatRoom(models.Model):
    """ChatRoom model"""
    users = models.ManyToManyField(User, related_name='chatrooms')
