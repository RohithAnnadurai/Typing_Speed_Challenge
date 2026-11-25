from django.contrib import admin
from django.urls import path
from django.contrib.auth.views import LogoutView

from challenge.views import (register_view, CustomLoginView,dashboard_view,)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', CustomLoginView.as_view(), name='home'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('register/', register_view, name='register'),
    path('logout/', LogoutView.as_view(next_page='login'),name='logout'),
    path('dashboard/', dashboard_view, name='dashboard'),
]
