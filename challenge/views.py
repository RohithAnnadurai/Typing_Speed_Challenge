from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView

from .forms import RegisterForm

def register_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('dashboard')
    else:
        form = RegisterForm()

    return render(request, 'register.html',{'form':form})

class CustomLoginView(LoginView):
    templete_name = 'login.html'
    redirect_authenticated_user = True

@login_required
def dashboard_view(request):
    return render(request, 'home.html')

class CustomLoginView(LoginView):
    template_name = 'login.html'
    redirect_authenticated_user = True
    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        form.fields['username'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Enter username'
        })
        form.fields['password'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Enter password'
        })
        return form