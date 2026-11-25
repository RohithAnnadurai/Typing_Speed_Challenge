
import json

from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_protect
from django.http import JsonResponse

from .models import TypingPassage, TypingResult
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

    return render(request, 'register.html', {'form': form})


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


@login_required
def dashboard_view(request):
    return render(request, 'home.html')


@login_required
def typing_test_view(request):
    passage = TypingPassage.objects.order_by('?').first()

    return render(request, 'test.html', {
        'passage': passage
    })


@login_required
@require_POST
@csrf_protect
def save_typing_result(request):
    try:
        data = json.loads(request.body)

        passage_id = data.get('passage_id')
        typed_text = data.get('typed_text')
        duration = data.get('duration')

        if not isinstance(typed_text, str):
            return JsonResponse({
                'success': False,
                'message': 'Invalid typed text.'
            }, status=400)

        try:
            passage_id = int(passage_id)
            duration = int(duration)
        except (TypeError, ValueError):
            return JsonResponse({
                'success': False,
                'message': 'Invalid passage ID or duration.'
            }, status=400)

        if not 1 <= duration <= 60:
            return JsonResponse({
                'success': False,
                'message': 'Invalid test duration.'
            }, status=400)

        passage = TypingPassage.objects.filter(
            id=passage_id
        ).first()

        if passage is None:
            return JsonResponse({
                'success': False,
                'message': 'Typing passage not found.'
            }, status=404)

        original_text = passage.content.strip()

        correct_characters = sum(
            1 for index, character in enumerate(typed_text)
            if index < len(original_text)
            and character == original_text[index]
        )

        total_typed_characters = len(typed_text)
        incorrect_characters = total_typed_characters - correct_characters

        accuracy = (
            correct_characters / total_typed_characters * 100
            if total_typed_characters > 0 else 0
        )

        elapsed_minutes = duration / 60
        wpm = round((correct_characters / 5) / elapsed_minutes)

        result = TypingResult.objects.create(
            user=request.user,
            passage=passage,
            wpm=wpm,
            accuracy=round(accuracy, 2),
            errors=incorrect_characters,
            duration=duration
        )

        return JsonResponse({
            'success': True,
            'message': 'Typing result saved successfully.',
            'result_id': result.id,
            'wpm': result.wpm,
            'accuracy': float(result.accuracy),
            'errors': result.errors,
            'duration': result.duration
        })

    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data.'
        }, status=400)

    except Exception:
        return JsonResponse({
            'success': False,
            'message': 'Unable to save the typing result.'
        }, status=500)
