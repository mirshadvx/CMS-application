from django.urls import path
from .views import *

urlpatterns = [
    path('blogs/', BlogExploretListView.as_view(), name='explore_blogs'),
    path('blogs/<int:id>/', BlogPostDetailView.as_view(), name='blog-detail'),
    path('blogs/<int:id>/like/', ToggleLikeView.as_view(), name='toggle-like'),
    path('blogs/<int:id>/comments/', CommentsListView.as_view(), name='comments-list'),
]
