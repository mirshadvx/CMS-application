from django.urls import path
from .views import CustomTokenObtainPairView, customTokenRefreshView, logout, is_authenticated


urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', customTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', logout, name='logout'),
    path('is-authenticated/', is_authenticated, name='is_authenticated'),
]