from django.urls import path
from .views import *

urlpatterns = [
    path('content-categories/', ContentList.as_view(), name='content_categories'),
    path('blogs/create/', CreateBlogPostView.as_view(), name='create-blog'),
    path('blogs/user/', UserBlogListView.as_view(), name='user-blogs'),
    path('blogs/<int:pk>/', BlogPostDetailView.as_view(), name='blog-detail'),
]