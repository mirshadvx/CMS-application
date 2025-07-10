from django.db import models
from django.contrib.auth.models import AbstractUser
from users.models import ContentCategory

class Profile(AbstractUser):
    email = models.EmailField(unique=True)
    bio = models.TextField(blank=True)
    profile_picture = models.URLField(max_length=500, blank=True, null=True)
    title = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    interests = models.ManyToManyField(ContentCategory, related_name='interested_users', blank=True)
    
    def __str__(self):
        return self.username