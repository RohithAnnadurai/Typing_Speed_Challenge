
from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView
from .models import TypingPassage

from .forms import RegisterForm


# User Registration
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

    return render(request, 'register.html', {'form': form})


# Custom Login
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


# Dashboard
@login_required
def dashboard_view(request):
    return render(request, 'home.html')


@login_required
def typing_test_view(request):

    passage = TypingPassage.objects.order_by('?').first()

    if passage is None:
        return render(
            request,
            'test.html',
            {'passage': None}
        )

    context = {
        'passage': passage,
    }

    return render(request,'test.html',context)
