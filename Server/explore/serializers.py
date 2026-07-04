from rest_framework import serializers
from users.models import BlogPost, ContentCategory, Comment, BlogLike
from authCustom.models import Profile

class ContentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentCategory
        fields = ['id', 'name', 'active']

class ProfileSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['id', 'first_name', 'last_name', 'display_name', 'profile_picture']

    def get_display_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name or "User"

class CommentSerializer(serializers.ModelSerializer):
    user = ProfileSerializer(read_only=True)
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'blog', 'user', 'content', 'created_at', 'can_edit', 'can_delete']
        read_only_fields = ['blog', 'user']

    def _has_comment_permission(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return obj.user_id == user.id or obj.blog.author_id == user.id

    def get_can_edit(self, obj):
        return self._has_comment_permission(obj)

    def get_can_delete(self, obj):
        return self._has_comment_permission(obj)

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
    is_liked = serializers.SerializerMethodField()
    is_author = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'content', 'excerpt', 'author', 'category',
            'status', 'tags', 'thumbnail', 'created_at', 'updated_at',
            'published_date', 'likes_count', 'comments_count', 'is_liked',
            'is_author'
        ]

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return obj.likes.filter(user=user).exists()

    def get_is_author(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        return bool(user and user.is_authenticated and obj.author_id == user.id)
