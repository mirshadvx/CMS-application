from rest_framework import serializers
from .models import BlogPost, ContentCategory, BlogLike, Comment

class ContentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentCategory
        fields = ['id', 'name', 'active']

class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = [
            'id', 'author', 'title', 'content', 'excerpt',
            'category', 'status', 'tags', 'thumbnail',
            'created_at', 'updated_at', 'published_date'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'published_date']

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class BlogPostListSerializer(serializers.ModelSerializer):
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    category = ContentCategorySerializer(read_only=True)
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'author', 'title', 'excerpt',
            'category', 'status', 'tags', 'thumbnail',
            'created_at', 'updated_at', 'published_date',
            'likes_count', 'comments_count'
        ]
        read_only_fields = [
            'id', 'author', 'created_at', 'updated_at',
            'published_date', 'likes_count', 'comments_count'
        ]
        
# from rest_framework import serializers
# from .models import ContentCategory, BlogPost

# class contentCategorySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ContentCategory
#         fields = ['id', 'name', 'active']
        
# class BlogPostSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = BlogPost
#         fields = [
#             'id', 'author', 'title', 'content', 'excerpt',
#             'category', 'status', 'tags', 'thumbnail',
#             'created_at', 'updated_at', 'published_date'
#         ]
#         read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'published_date']

#     def create(self, validated_data):
#         validated_data['author'] = self.context['request'].user
#         return super().create(validated_data)
    
# class BlogPostListSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = BlogPost
#         fields = [
#             'id', 'author', 'title', 'excerpt',
#             'category', 'status', 'tags', 'thumbnail',
#             'created_at', 'updated_at', 'published_date'
#         ]
#         read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'published_date']
