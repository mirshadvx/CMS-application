from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ContentCategory
from .serializers import *
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from cms_project.Loggin.logger import logger
from .filters import BlogPostFilter
from django.db.models import Count

class ContentList(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            categories = ContentCategory.objects.all()
            serializer = ContentCategorySerializer(categories, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception:
            logger.exception("Failed to fetch content categories")
            return Response({"error": "Failed to fetch preferences"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class CreateBlogPostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BlogPostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
class UserBlogListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            queryset = BlogPost.objects.filter(author=request.user)
            
            filterset = BlogPostFilter(request.GET, queryset=queryset)
            if filterset.is_valid():
                queryset = filterset.qs
                
            queryset = queryset.annotate(
                likes_count=Count('likes'),
                comments_count=Count('comments')
            )
            
            serializer = BlogPostListSerializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': 'Failed to fetch user blogs.', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class BlogPostDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk, user):
        try:
            blog = BlogPost.objects.get(pk=pk, author=user)
            return blog
        except BlogPost.DoesNotExist:
            return None
    
    def get(self, request, pk):
        try:
            blog = self.get_object(pk, request.user)
            if not blog:
                return Response(
                    {'error': 'Blog post not found or you do not have permission to view it.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            serializer = BlogPostSerializer(blog)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': 'Failed to fetch blog details.', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request, pk):
        try:
            blog = self.get_object(pk, request.user)
            if not blog:
                return Response(
                    {'error': 'Blog post not found or you do not have permission to edit it.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            serializer = BlogPostSerializer(blog, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response( {'error': 'Failed to update blog post.', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR )
    
    def delete(self, request, pk):
        try:
            blog = self.get_object(pk, request.user)
            if not blog:
                return Response({'error': 'Blog post not found or you do not have permission to delete it.'},
                    status=status.HTTP_404_NOT_FOUND )
            blog.delete()
            return Response(status=status.HTTP_200_OK)
        except Exception as e:
            return Response( {'error': 'Failed to delete blog post.', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR )
            

