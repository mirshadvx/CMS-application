from django_filters.rest_framework import FilterSet, CharFilter
from .models import BlogPost

class BlogPostFilter(FilterSet):
    status = CharFilter(field_name='status', lookup_expr='exact')
    
    class Meta:
        model = BlogPost
        fields = ['status', 'category']