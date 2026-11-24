from django.conf import settings
from django.db import models

class TypingPassage(models.Model):
    DIFFICULTLY_CHOICES = [
        ('EASY','Easy'),
        ('MEDIUM','Medium'),
        ('HARD','Hard'),
    ]

    title = models.CharField(max_length=150)
    content = models.TextField()
    difficulty = models.CharField(
        max_length=10,
        choices=DIFFICULTLY_CHOICES,
        default='ESAY'
        )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class TypingResult(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='typing_result'
    )

    passage = models.ForeignKey(
        TypingPassage,
        on_delete=models.PROTECT,
        related_name='typing_results'
    )

    wpm = models.PositiveIntegerField()
    accuracy = models.FloatField()
    errors = models.PositiveIntegerField(default=0)
    duration = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.wps} WPM"