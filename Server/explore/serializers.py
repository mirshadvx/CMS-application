from rest_framework import serializers
from users.models import BlogPost, ContentCategory, Comment, BlogLike
from authCustom.models import Profile

class ContentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentCategory
        fields = ['id', 'name', 'active']

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['username', 'email', 'profile_picture']

class CommentSerializer(serializers.ModelSerializer):
    user = ProfileSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'blog', 'user', 'content', 'created_at']
        read_only_fields = ['blog', 'user']

class BlogLikeSerializer(serializers.ModelSerializer):
    user = ProfileSerializer(read_only=True)

    class Meta:
        model = BlogLike
        fields = ['id', 'user', 'liked_at']

class BlogExploreSerializer(serializers.ModelSerializer):
    author = ProfileSerializer(read_only=True)
    category = ContentCategorySerializer(read_only=True)
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    tags = serializers.ListField(child=serializers.CharField())

    class Meta:
        model = BlogPost
        fields = [
            'id', 'author', 'title', 'excerpt', 'category', 'status', 'tags', 
            'thumbnail', 'created_at', 'updated_at', 'published_date', 
            'likes_count', 'comments_count'
        ]
        
class BlogPostDetailSerializer(serializers.ModelSerializer):
    author = ProfileSerializer()
    category = ContentCategorySerializer()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'content', 'excerpt', 'author', 'category',
            'status', 'tags', 'thumbnail', 'created_at', 'updated_at',
            'published_date', 'likes_count', 'comments_count'
        ]

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()