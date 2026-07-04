from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from authCustom.models import Profile
from .serializers import UserSerializer, BlogPostSerializer
from .filters import UserFilter
from users.models import BlogPost, Comment
from django.db.models import Q
from .pagination import StandardPagination
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

class AdminLogin(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        if not email or not password:
            return Response({"success": False, "error": "Email and password are required"},
                            status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, email=email, password=password)

        if not user:
            return Response({"success": False, "error": "Invalid credentials"},
                            status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_staff:
            return Response({"success": False, "error": "You are not authorized to access admin"},
                            status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        response = Response({
            "success": True,
            "role": "admin",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.get_full_name() or user.email
            }
        }, status=status.HTTP_200_OK)

        response.set_cookie("access_token", access_token, httponly=True, secure=True, samesite="None", path="/")
        response.set_cookie("refresh_token", str(refresh), httponly=True, secure=True, samesite="None", path="/")

        return response

class UserListView(generics.ListAPIView):
    queryset = Profile.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = UserFilter
    search_fields = ['first_name', 'email']

class UserStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            user = Profile.objects.get(pk=pk)
        except Profile.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status not in ['Active', 'Inactive']:
            return Response({"detail": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = (new_status == 'Active')
        user.save()

        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class BlogPostListAPIView(APIView):
    pagination_class = StandardPagination()

    def get(self, request):
        queryset = BlogPost.objects.select_related('author', 'category').prefetch_related('likes', 'comments').order_by('-created_at')
        
        status_filter = request.query_params.get('status')
        show_filter = request.query_params.get('show')
        search = request.query_params.get('search')

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if show_filter is not None:
            if show_filter:
                queryset = queryset.filter(show=True)
            elif not show_filter:
                queryset = queryset.filter(show=False)
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(author__first_name__icontains=search))

        paginator = self.pagination_class
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = BlogPostSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

class BlogPostSoftDeleteAPIView(APIView):

    def patch(self, request, pk):
        try:
            post = BlogPost.objects.get(pk=pk)
        except BlogPost.DoesNotExist:
            return Response({"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

        post.show = False
        post.save()
        serializer = BlogPostSerializer(post, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class BlogPostRestoreAPIView(APIView):

    def patch(self, request, pk):
        try:
            post = BlogPost.objects.get(pk=pk)
        except BlogPost.DoesNotExist:
            return Response({"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

        post.show = True
        post.save()
        serializer = BlogPostSerializer(post, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class BlogDetailAPIView(APIView):

    def get(self, request, blog_id):
        blog = get_object_or_404(BlogPost, id=blog_id)
        serializer = BlogPostSerializer(blog)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, blog_id):
        if not request.user.is_staff:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        comment_id = request.query_params.get("comment_id")
        if not comment_id:
            return Response({"error": "comment_id query param is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        comment = get_object_or_404(Comment, id=comment_id, blog_id=blog_id)
        comment.delete()
        return Response({"message": "Comment deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
