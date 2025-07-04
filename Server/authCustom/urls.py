from django.urls import path
from .views import *


urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', customTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', logout, name='logout'),
    path('authenticated/', is_authenticated, name='authenticated'),
    path('register', RegisterView.as_view(), name='register'),
]