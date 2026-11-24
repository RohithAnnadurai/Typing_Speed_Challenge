
from django.contrib import admin
from .models import TypingPassage, TypingResult


@admin.register(TypingPassage)
class TypingPassageAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'title',
        'difficulty',
        'created_at',
    )

    list_filter = ('difficulty',)

    search_fields = ('title', 'content')


@admin.register(TypingResult)
class TypingResultAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'user',
        'passage',
        'wpm',
        'accuracy',
        'errors',
        'duration',
        'created_at',
    )

    list_filter = ('created_at',)

    search_fields = ('user__username', 'passage__title')
