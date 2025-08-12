from django.urls import path
from .views import *

urlpatterns = [
    path('login/', AdminLogin.as_view(), name="admin_login"),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/status/', UserStatusUpdateView.as_view(), name='user-status-update'),
    path('posts/', BlogPostListAPIView.as_view(), name='posts-list'),
    path('posts/<int:pk>/delete/', BlogPostSoftDeleteAPIView.as_view(), name='post-soft-delete'),
    path('posts/<int:pk>/restore/', BlogPostRestoreAPIView.as_view(), name='post-restore'),
    path('blog/<int:blog_id>/', BlogDetailAPIView.as_view(), name='blog-detail'),
]