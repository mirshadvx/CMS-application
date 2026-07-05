from django.db.models import Q
from django_filters.rest_framework import FilterSet, CharFilter
from .models import BlogPost

class BlogPostFilter(FilterSet):
    status = CharFilter(field_name='status', lookup_expr='exact')
    search = CharFilter(method='filter_by_search')
    category = CharFilter(method='filter_by_category')
    sort_by = CharFilter(method='filter_by_sort')
    
    class Meta:
        model = BlogPost
        fields = ['status', 'category', 'search', 'sort_by']

    def filter_by_search(self, queryset, name, value):
        return queryset.filter(
            Q(title__icontains=value) |
            Q(excerpt__icontains=value) |
            Q(content__icontains=value)
        )

    def filter_by_category(self, queryset, name, value):
        if str(value).isdigit():
            return queryset.filter(category_id=value)
        return queryset.filter(category__name__iexact=value)

    def filter_by_sort(self, queryset, name, value):
        if value == 'oldest':
            return queryset.order_by('created_at')
        if value == 'updated':
            return queryset.order_by('-updated_at')
        if value == 'popular':
            return queryset.order_by('-likes_count', '-created_at')
        if value == 'most-commented':
            return queryset.order_by('-comments_count', '-created_at')
        return queryset.order_by('-created_at')
