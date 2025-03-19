from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RefineryViewSet, DashboardSettingsViewSet, CurrentUserView

router = DefaultRouter()
router.register(r'refineries', RefineryViewSet)
router.register(r'settings', DashboardSettingsViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('user/', CurrentUserView.as_view(), name='current_user'),
]