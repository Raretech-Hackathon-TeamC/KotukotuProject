from django.db import models
from django.conf import settings

class BadgeType(models.Model):
    BADGE_TYPES = [
        ('bronze', 'ブロンズ'),
        ('silver', 'シルバー'),
        ('gold', 'ゴールド'),
        ('platinum', 'プラチナ'),
        ('diamond', 'ダイヤ'),
    ]
    badge_type = models.CharField(max_length=255, choices=BADGE_TYPES, unique=True)
    color_code = models.CharField(max_length=7)

    def __str__(self):
        return f'{self.badge_type} - {self.color_code}'

class Badge(models.Model):
    CONDITION_TYPES = [
        ('total_duration', '累計時間'),
        ('total_days', '累計日数'),
        ('total_activities', '累計積み上げ数'),
    ]
    COMPARATORS = [
        ('<', 'より小さい'),
        ('>', 'より大きい'),
        ('==', '等しい'),
        ('<=', '以下'),
        ('>=', '以上'),
    ]
    name = models.CharField(max_length=255, null=False, blank=False)
    description = models.TextField(null=False, blank=False)
    badge_type = models.CharField(max_length=255, choices=BadgeType.BADGE_TYPES, null=False, blank=False)
    condition_type = models.CharField(max_length=255, choices=CONDITION_TYPES, null=False, blank=False)
    condition_value = models.IntegerField(null=False, blank=False)
    comparator = models.CharField(max_length=2, choices=COMPARATORS, default='>=',null=False, blank=False)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class UserBadge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    badge = models.ForeignKey(Badge, on_delete=models.PROTECT)
    date_unlocked = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'badge',)

    def __str__(self):
        return f'{self.badge.name} - {self.user}'
