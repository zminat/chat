from django.urls import path

from api.views import LoginView, LogoutView, SignupView, UserListView, CreateChatView, ChatListView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('userlist/', UserListView.as_view(), name='userlist'),
    path('createchat/', CreateChatView.as_view(), name='createchat'),
    path('chatlist/', ChatListView.as_view(), name='chatlist'),
]