from django.contrib import admin
from .models import Badge, UserBadge, BadgeTypeColor

# モデルをAdminページで表示・編集できるように設定
admin.site.register(Badge)
admin.site.register(UserBadge)

# BadgeTypeColorモデルに対するModelAdminクラスを作成し、登録します
@admin.register(BadgeTypeColor)
class BadgeTypeColorAdmin(admin.ModelAdmin):
    list_display = ('badge_type', 'color_code')
    ordering = ('badge_type',)
