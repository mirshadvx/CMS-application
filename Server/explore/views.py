from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from users.models import BlogPost, BlogLike, Comment
from .serializers import BlogExploreSerializer, BlogPostDetailSerializer, CommentSerializer
from .filters import BlogPostFilter
from django.db.models import Count
from .pagination import *

class BlogExploretListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            queryset = BlogPost.objects.filter(status='published', show=True).annotate(
                likes_count=Count('likes'),
                comments_count=Count('comments') )

            filterset = BlogPostFilter(request.GET, queryset=queryset)
            if not filterset.is_valid():
                return Response(filterset.errors, status=status.HTTP_400_BAD_REQUEST)

            filtered_queryset = filterset.qs
            paginator = BlogPostPagination()
            paginated_queryset = paginator.paginate_queryset(filtered_queryset, request)
            serializer = BlogExploreSerializer(paginated_queryset, many=True)

            return paginator.get_paginated_response(serializer.data)

        except Exception as e:
            return Response( {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR )
            
class BlogPostDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            blog_post = BlogPost.objects.get(id=id)
            serializer = BlogPostDetailSerializer(blog_post)
            return Response(serializer.data)
        except BlogPost.DoesNotExist:
            return Response(
                {"error": "Blog post not found."},
                status=status.HTTP_404_NOT_FOUND
            )
            
class ToggleLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        try:
            blog_post = BlogPost.objects.get(id=id)
            user = request.user

            like, created = BlogLike.objects.get_or_create(blog=blog_post, user=user)

            if not created:
                like.delete()
                action = "unliked"
            else:
                action = "liked"

            likes_count = blog_post.likes.count()
            return Response({"action": action, "likes_count": likes_count})

        except BlogPost.DoesNotExist:
            return Response(
                {"error": "Blog post not found."},
                status=status.HTTP_404_NOT_FOUND
            )

class CommentsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            blog_post = BlogPost.objects.get(id=id)
            comments = Comment.objects.filter(blog=blog_post)
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)
        except BlogPost.DoesNotExist:
            return Response(
                {"error": "Blog post not found."},
                status=status.HTTP_404_NOT_FOUND
            )

    def post(self, request, id):
        try:
            blog_post = BlogPost.objects.get(id=id)
            serializer = CommentSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save(blog=blog_post, user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except BlogPost.DoesNotExist:
            return Response(
                {"error": "Blog post not found."},
                status=status.HTTP_404_NOT_FOUND
            )
