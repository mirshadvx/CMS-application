from django.db import models

class ContentCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name
    
class BlogPost(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published')
    ]
    
    author = models.ForeignKey('authCustom.Profile', on_delete=models.CASCADE, related_name='blog_posts')
    title = models.CharField(max_length=100)
    content = models.TextField()
    excerpt = models.TextField(max_length=500, blank=True)
    category = models.ForeignKey(ContentCategory, on_delete=models.CASCADE, related_name='blogs')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    tags = models.JSONField(default=list, blank=True)
    thumbnail = models.URLField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_date = models.DateTimeField(auto_now_add=True)
    show = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.author.username} - {self.title[:50]}"
    
class Comment(models.Model):
    blog = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey('authCustom.Profile', on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username}"
    
class BlogLike(models.Model):
    blog = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey('authCustom.Profile', on_delete=models.CASCADE, related_name='liked_blogs')
    liked_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('blog', 'user')
        
    def __str__(self):
        return f"{self.user.username} - {self.blog.title}"