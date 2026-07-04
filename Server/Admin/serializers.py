from rest_framework import serializers
from authCustom.models import Profile
from users.models import BlogPost, Comment

class UserSerializer(serializers.ModelSerializer):
    posts = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['id', 'first_name', 'email', 'is_active', 'created_at', 'posts']

    def get_posts(self, obj):
        return obj.blog_posts.count()
    
class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'first_name', 'email', 'profile_picture']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost._meta.get_field('category').related_model
        fields = ['id', 'name']

class BlogPostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'author', 'status', 'category',
            'excerpt', 'thumbnail', 'created_at', 'published_date',
            'likes_count', 'comments_count', 'tags', 'show'
        ]

class CommentSerializer(serializers.ModelSerializer):
    user = AuthorSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'blog_id', 'user', 'content', 'created_at']

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'created_at']

class BlogPostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    like_count = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'author', 'title', 'content', 'excerpt',
            'category', 'status', 'tags', 'thumbnail',
            'created_at', 'updated_at', 'published_date', 'show',
            'comments', 'like_count'
        ]

    def get_like_count(self, obj):
        return obj.likes.count()