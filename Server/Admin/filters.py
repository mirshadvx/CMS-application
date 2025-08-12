import django_filters
from authCustom.models import Profile

class UserFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(method='filter_status')

    class Meta:
        model = Profile
        fields = []

    def filter_status(self, queryset, name, value):
        if value.lower() == 'active':
            return queryset.filter(is_active=True)
        elif value.lower() == 'inactive':
            return queryset.filter(is_active=False)
        return queryset
