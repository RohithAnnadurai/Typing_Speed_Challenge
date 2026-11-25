
from django.urls import path
from django.contrib.auth.views import LogoutView

from . import views

urlpatterns = [
    path('', views.CustomLoginView.as_view(), name='home'),
    path('login/', views.CustomLoginView.as_view(), name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', LogoutView.as_view(next_page='login'), name='logout'),

    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('typing-test/', views.typing_test_view, name='typing_test'),
    path('save-typing-result/', views.save_typing_result, name='save_typing_result'),
    path('typing-history/', views.typing_history_view, name='typing_history'),
]
