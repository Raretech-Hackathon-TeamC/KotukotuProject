from django.shortcuts import render
from django.views import generic
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404
import json
from .models import Category, ActivityCategory
from .forms import CategoryForm
from datetime import timedelta, date
from activity.models import ActivityRecord
from django.db.models import Sum
from django.utils import timezone
import datetime
from django.db.models import Q

# Categoryの情報をJSON形式で返すView
class CategoryHomeAjaxView(generic.View):
    def get(self, request, *args, **kwargs):
        # ユーザーが作成したカテゴリーの一覧を取得
        categories = Category.objects.filter(user=request.user, is_deleted=False).annotate(
            total_duration=Sum('activitycategory__activity_record__duration')  # カテゴリーの総時間を計算
        ).exclude(Q(activitycategory__activity_record__duration=None) | Q(total_duration=None))

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


# TODO: カテゴリー毎のhome画面
    #* カテゴリー毎の累計時間・累計日数の表示
    #* グラフの表示に必要なjson型データの送信
class CategoryDetailView(LoginRequiredMixin, generic.ListView):
    model = ActivityCategory
    #! todo: 動作確認時にtestを追加
    template_name = 'category_detail.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        category = get_object_or_404(Category, pk=self.kwargs['pk'], user=self.request.user)

        # 7日前の日付を取得
        start_date = date.today() - timedelta(days=6)

        # 日付範囲に基づいて、アクティビティレコードをフィルタリング
        activity_records = ActivityRecord.objects.filter(
            activitycategory__category=category,
            date__gte=start_date
        )

        total_duration = activity_records.aggregate(Sum('duration'))['duration__sum'] or 0

        context['category'] = category
        context['activity_records'] = activity_records
        context['total_duration'] = total_duration
        return context


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
