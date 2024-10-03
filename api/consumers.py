import json
import os
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import ChatRoom, Message

class ChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_group_name = None
        self.room_id = None

    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        user = self.scope['user']

        chat_room = await sync_to_async(ChatRoom.objects.get)(id=self.room_id)
        message_instance = await sync_to_async(Message.objects.create)(
            sender=user,
            chat_room=chat_room,
            text=message
        )

        sender_avatar = f'static/images/avatars/{user.id}.jpg'
        if not os.path.exists(sender_avatar):
            sender_avatar = 'static/images/avatars/default.jpg'

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': user.username,
                'sender_id': user.id,
                'sender_avatar': sender_avatar,
                'timestamp': message_instance.timestamp.isoformat(),
                'sender_channel_name': self.channel_name
            }
        )

    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']
        sender_id = event['sender_id']
        sender_avatar = event['sender_avatar']
        timestamp = event['timestamp']
        sender_channel_name = event['sender_channel_name']

        if self.channel_name != sender_channel_name:
            await self.send(text_data=json.dumps({
                'type': 'chat_message',
                'message': message,
                'sender': sender,
                'sender_id': sender_id,
                'sender_avatar': sender_avatar,
                'timestamp': timestamp
            }))
