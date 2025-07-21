from django.contrib import admin
from .models import ContentCategory, BlogPost, BlogLike, Comment

admin.site.register(ContentCategory)
admin.site.register(BlogPost)
admin.site.register(BlogLike)
admin.site.register(Comment)