from django.shortcuts import render
from django.db.models import Sum
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import generic
from activity.models import ActivityRecord
from .models import Badge, UserBadge
from django.http import JsonResponse

# ユーザーの累計時間を取得し、指定した条件値と比較する関数
def check_total_duration(user, condition_value, comparator):
    # ユーザーの全ての活動レコードから累計時間を合計します
    total_duration = ActivityRecord.objects.filter(user=user).aggregate(Sum('duration'))['duration__sum']
    # 合計時間と条件値を指定した比較演算子で比較します
    return compare_values(total_duration, condition_value, comparator)

# ユーザーの累計日数を取得し、指定した条件値と比較する関数
def check_total_days(user, condition_value, comparator):
    # ユーザーの全ての活動レコードから日付を一意に数え上げます
    total_days = ActivityRecord.objects.filter(user=user).dates('date', 'day').count()
    # 合計日数と条件値を指定した比較演算子で比較します
    return compare_values(total_days, condition_value, comparator)


# ユーザーの累計活動数を取得し、指定した条件値と比較する関数
def check_total_activities(user, condition_value, comparator):
    # ユーザーの全ての活動レコードの数を数え上げます
    total_activities = ActivityRecord.objects.filter(user=user).count()
    # 合計活動数と条件値を指定した比較演算子で比較します
    return compare_values(total_activities, condition_value, comparator)

# ２つの値を比較し、true/falseの結果を返す関数
def compare_values(actual_value, condition_value, comparator):
    if comparator == '<':
        return condition_value < actual_value
    elif comparator == '>':
        return condition_value > actual_value
    elif comparator == '<=':
        return condition_value <= actual_value
    elif comparator == '>=':
        return condition_value >= actual_value
    else:  # comparator == '=':
        return condition_value == actual_value


# ActivityRecordが保存されるたびに呼び出され、バッジの獲得条件をチェックし、条件が満たされていればUserBadgeを生成する関数
@receiver(post_save, sender=ActivityRecord)
def check_badges(sender, instance, **kwargs):
    # ユーザーの取得
    user = instance.user
    # すべての利用可能なバッジを取得
    badges = Badge.objects.filter(is_available=True)

    for badge in badges:
        # ユーザーがすでにバッジを持っている場合はスキップ
        if UserBadge.objects.filter(user=user, badge=badge).exists():
            continue

        # 実績の条件に応じた関数を呼び出す
        if badge.condition_type == 'total_duration':
            result = check_total_duration(user, badge.condition_value, badge.comparator)
        elif badge.condition_type == 'total_days':
            result = check_total_days(user, badge.condition_value, badge.comparator)
        else:  # badge.condition_type == 'total_activities':
            result = check_total_activities(user, badge.condition_value, badge.comparator)

        # 実績が達成されている場合は、ユーザーのバッジを更新
        if result:
            UserBadge.objects.create(user=user, badge=badge)


# ユーザーがログインしていなければ、ログインページにリダイレクトされます。
# 実績リスト画面(実績一覧)
class BadgeListView(LoginRequiredMixin, generic.View):
    # HTTP GETリクエストに対する処理
    def get(self, request, *args, **kwargs):
        # 'badge_list.html'という名前のテンプレートをレンダリングし、その結果をHTTPレスポンスとして返します。
        return render(request, 'badge_list.html')

# レコード画面にJson型のデータを送信する(非同期通信)
class BadgeListAjaxView(LoginRequiredMixin, generic.View):
    # HTTP GETリクエストに対する処理
    def get(self, request, *args, **kwargs):
        # 現在ログインしているユーザーを取得します。
        user = request.user
        # 現在のユーザーが獲得したバッジを全て取得します。
        user_badges = UserBadge.objects.filter(user=user)
        # 獲得したバッジの情報を元に、データを作成します。
        data = [{
                "badge_id": ub.badge.pk,
                "badge_name": ub.badge.name,
                "badge_type": ub.badge.badge_type,
                "is_unlocked": True,  # ユーザーが獲得したため、is_unlockedはTrueです。
                "date_unlocked": ub.date_unlocked  # 獲得した日付
                }
            for ub in user_badges
        ]
        # 全てのバッジを取得します。
        all_badges = Badge.objects.all()
        # 獲得していないバッジの情報をデータに追加します。
        for badge in all_badges:
            # もしバッジがまだ獲得されていなければ
            if not any(d['badge_name'] == badge.name for d in data):
                # データに追加します。
                data.append({
                    "badge_id": badge.pk,
                    "badge_name": badge.name,
                    "badge_type": badge.badge_type,
                    "is_unlocked": False,  # 未獲得のため、is_unlockedはFalseです。
                    "date_unlocked": None,  # 未獲得のため、date_unlockedはNoneです。
                })
        # JSON形式でデータを返します。
        return JsonResponse(data, safe=False)
