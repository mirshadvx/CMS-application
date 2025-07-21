from django_filters import rest_framework as filters
from users.models import BlogPost
from django.db.models import Q

class BlogPostFilter(filters.FilterSet):
    search = filters.CharFilter(method='filter_by_search')
    category = filters.CharFilter(field_name='category__name', lookup_expr='iexact')
    sort_by = filters.CharFilter(method='filter_by_sort')

    class Meta:
        model = BlogPost
        fields = ['search', 'category', 'sort_by']

    def filter_by_search(self, queryset, name, value):
        return queryset.filter(
            Q(title__icontains=value) | Q(excerpt__icontains=value)
        )

    def filter_by_sort(self, queryset, name, value):
        if value == 'latest':
            return queryset.order_by('-created_at')
        elif value == 'popular':
            return queryset.order_by('-likes__count')
        elif value == 'most-commented':
            return queryset.order_by('-comments__count')
        return queryset