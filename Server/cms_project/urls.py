from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('authCustom.urls')),
    path('api/v1/user/', include('users.urls')),
    path('api/v1/explore/', include('explore.urls')),
    path('api/v1/admin/', include('Admin.urls')),
]