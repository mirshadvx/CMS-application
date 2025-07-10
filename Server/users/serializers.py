from rest_framework import serializers
from .models import ContentCategory

class contentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentCategory
        fields = ['id', 'name', 'active']