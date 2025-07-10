from django.urls import path
from .views import *

urlpatterns = [
    path('content-categories/', ContentList.as_view(), name='content_categories'),
]
