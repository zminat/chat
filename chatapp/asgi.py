import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from api.consumers import RoomConsumer, ChatMessageConsumer
from django.urls import path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chatapp.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path("ws/chat/", RoomConsumer.as_asgi()),
            path("ws/chat/<int:room_id>/", ChatMessageConsumer.as_asgi()),
        ])
    ),
})