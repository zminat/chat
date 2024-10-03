from django.urls import path

from api.views import LoginView, LogoutView, SignupView, UserListView, CreateChatView, ChatListView, MessageListView, \
    GetProfileView, UpdateProfileView, EditChatView, ChatUsersView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('userlist/', UserListView.as_view(), name='userlist'),
    path('createchat/', CreateChatView.as_view(), name='createchat'),
    path('editchat/<int:chat_id>/', EditChatView.as_view(), name='editchat'),
    path('chatlist/', ChatListView.as_view(), name='chatlist'),
    path('chat/<int:chat_id>/messages/', MessageListView.as_view(), name='chatmessages'),
    path('chat/<int:chat_id>/users/', ChatUsersView.as_view(), name='chatusers'),
    path('getprofile/', GetProfileView.as_view(), name='getprofile'),
    path('updateprofile/', UpdateProfileView.as_view(), name='updateprofile'),
]