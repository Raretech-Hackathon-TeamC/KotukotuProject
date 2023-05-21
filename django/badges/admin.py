from django.contrib import admin
from .models import Badge, UserBadge, BadgeType

# モデルをAdminページで表示・編集できるように設定
admin.site.register(Badge)
admin.site.register(UserBadge)

# BadgeTypeモデルに対するModelAdminクラスを作成し、登録します
@admin.register(BadgeType)
class BadgeTypeAdmin(admin.ModelAdmin):
    list_display = ('badge_type', 'color_code')
    ordering = ('badge_type',)
