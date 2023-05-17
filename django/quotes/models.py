from django.db import models

class Quote(models.Model):
    text = models.TextField()

    def __str__(self):
        return self.text[:50]
