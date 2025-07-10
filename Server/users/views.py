from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ContentCategory
from .serializers import *
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

class ContentList(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            categories = ContentCategory.objects.all()
            serializer = contentCategorySerializer(categories, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Failed to fetch preferences"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)