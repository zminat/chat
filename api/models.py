from django.db import models
from django.contrib.auth.models import User


class ChatRoom(models.Model):
    """ChatRoom model"""
    users = models.ManyToManyField(User, related_name='chatrooms')

    def __str__(self):
        return ', '.join([user.username for user in self.users.all()])

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    timestamp = models.DateTimeField(auto_now_add=True)
    text = models.TextField()

    def __str__(self):
        return f"{self.sender.username}: {self.text[:50]}..."