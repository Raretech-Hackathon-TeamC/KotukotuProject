from django.contrib import admin
from .models import Badge, UserBadge

# モデルをAdminページで表示・編集できるように設定
admin.site.register(Badge)
admin.site.register(UserBadge)
