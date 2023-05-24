from django.views import generic
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404
import json
from .models import Category
from .forms import CategoryForm
from datetime import timedelta, datetime
from activity.models import ActivityRecord
from django.db.models import Sum, Value
from django.db.models.functions import Coalesce
from decimal import Decimal

# Categoryの情報をJSON形式で返すView
class CategoryHomeAjaxView(generic.View):
    def get(self, request, *args, **kwargs):
        # ユーザーが作成したカテゴリーの一覧を取得
        categories = Category.objects.filter(user=request.user, is_deleted=False).annotate(
            total_duration=Coalesce(Sum('activitycategory__activity_record__duration'), Value(0))
        )

        # カテゴリーの情報を辞書型で保存
        categories_data = [
            {
                'id': category.id,  # カテゴリーのidを保存
                'name': category.name,  # カテゴリーの名前を保存
                'total_duration': minutes_to_hours(category.total_duration),  # カテゴリーの総時間を計算して保存
                'color_code': category.color_code,  # カテゴリーの色情報を保存
            }
            for category in categories
        ]
        return JsonResponse(categories_data, safe=False)  # カテゴリー情報をJSON形式で返す

def minutes_to_hours(minutes):
    hours = minutes // 60
    minutes = minutes % 60
    return f"{hours}:{minutes:02d}"


# カテゴリー毎の詳細画面
class CategoryDetailView(LoginRequiredMixin, generic.DetailView):
    model = Category
    #! todo: 動作確認時にtestを追加
    template_name = 'category_detail.html'
    context_object_name = 'category'


# カテゴリー毎の詳細画面へJson型のデータを送信する(非同期通信)
class CategoryDetailAjaxView(generic.DetailView):
    model = Category
    template_name = None

    def get(self, request, *args, **kwargs):
        # カテゴリーの基本情報を取得
        category = self.get_object()
        category_data = {
            'categoryid': category.id,
            'categoryname': category.name,
            'color_code': category.color_code,
            'goal': category.goal
        }

        # 7日前から本日までの日付を取得
        dates = [(datetime.now() - timedelta(days=i)).date() for i in range(6, -1, -1)]
        dates_str = [date.strftime('%m/%d') for date in dates]
        category_data['dates'] = dates_str

        # カテゴリーに紐づくアクティビティの合計時間を取得
        activities = ActivityRecord.objects.filter(activitycategory__category=category)
        total_duration = activities.aggregate(total_duration=Sum('duration'))['total_duration']

        #  total_durationがNoneの場合は0に設定する
        total_duration = total_duration if total_duration is not None else 0

        activity_duration_dict = activities.annotate(day=Sum('duration')).values('day', 'date')
        activity_duration_dict = {activity['date']: activity['day'] for activity in activity_duration_dict}

        # 1日毎の累計時間を計算
        duration_list = []
        for date in dates:
            duration = activity_duration_dict.get(date, 0)
            duration_hours = Decimal(duration) / 60  # 分から0.0時間の単位に変換
            duration_list.append(round(float(duration_hours), 1))  # 小数点第1位までに丸める
        category_data['duration_list'] = duration_list

        # カテゴリーの累計時間を計算
        total_duration_datetime = datetime(1, 1, 1) + timedelta(minutes=total_duration)
        category_data['category_total_duration'] = total_duration_datetime.strftime('%-H:%M')

        # カテゴリーの累計日数を計算
        category_dates = activities.values_list('date', flat=True).distinct()
        category_data['category_total_days'] = category_dates.count()

        return JsonResponse(category_data)


# カテゴリー作成機能
class CategoryAddView(LoginRequiredMixin, generic.CreateView):
    model = Category
    form_class = CategoryForm
    #! todo: 動作確認時にtestを追加
    template_name = 'category_add.html'
    success_url = reverse_lazy('activity:home')

    def form_valid(self, form):
        form.instance.user = self.request.user
        return super().form_valid(form)

# 同じ名前のカテゴリーが存在するか確認
def check_duplicate_add(request):
    if request.method == "POST":
        data = json.loads(request.body)
        category_name = data.get("name")
        existing_category = Category.objects.filter(user=request.user, name=category_name)
        deleted_category = existing_category.filter(is_deleted=True).first()

        if deleted_category:
            return JsonResponse({"duplicate": True, "category_id": deleted_category.id})
        elif existing_category.exists():
            return JsonResponse({"duplicate": True, "category_id": None})
        else:
            return JsonResponse({"duplicate": False})
    else:
        return JsonResponse({"error": "Invalid request method"})

# カテゴリー復元
def category_restore(request, pk):
    category = Category.objects.get(pk=pk, user=request.user)
    category.is_deleted = False
    category.save()
    return HttpResponseRedirect(reverse_lazy('activity:home'))

# カテゴリー編集
class CategoryEditView(LoginRequiredMixin, generic.UpdateView):
    model = Category
    form_class = CategoryForm
    #! todo: 動作確認時にtestを追加
    template_name = 'category_edit.html'
    success_url = reverse_lazy('activity:home')

    def form_valid(self, form):
        form.instance.user = self.request.user
        return super().form_valid(form)

# 編集するカテゴリーは含めずに重複を検索
def check_duplicate_edit(request):
    if request.method == "POST":
        data = json.loads(request.body)
        category_name = data.get("name")
        exclude_id = data.get("exclude_id", None)
        existing_category = Category.objects.filter(user=request.user, name=category_name).exclude(id=exclude_id)

        if existing_category.exists():
            return JsonResponse({"duplicate": True, "category_id": None})
        else:
            return JsonResponse({"duplicate": False})
    else:
        return JsonResponse({"error": "Invalid request method"})

# カテゴリー削除(論理削除)
class CategoryDeleteView(LoginRequiredMixin, generic.View):
    def post(self, request, *args, **kwargs):
        category = get_object_or_404(Category, id=kwargs['pk'], user=request.user)
        category.is_deleted = True
        category.save()
        return HttpResponseRedirect(reverse_lazy('activity:home'))
