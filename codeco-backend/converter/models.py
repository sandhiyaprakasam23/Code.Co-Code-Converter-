# from django.db import models

# # Create your models here.



from django.db import models
from django.contrib.auth.models import User


class ConversionHistory(models.Model):
    """Stores every code conversion a user performs."""

    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name="conversions")
    from_lang   = models.CharField(max_length=50)
    to_lang     = models.CharField(max_length=50)
    input_code  = models.TextField()
    output_code = models.TextField(blank=True)
    char_count  = models.PositiveIntegerField(default=0)
    success     = models.BooleanField(default=True)
    error_msg   = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Conversion histories"

    def __str__(self):
        return f"{self.user.email} | {self.from_lang} → {self.to_lang} | {self.created_at:%Y-%m-%d %H:%M}"

    def save(self, *args, **kwargs):
        self.char_count = len(self.input_code)
        super().save(*args, **kwargs)
