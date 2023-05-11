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

# TODO: ホーム画面にカテゴリー毎の累計活動時間の表示
    #* activity:HomeView内でimportする必要あり
    #* カテゴリーが削除済み(is_deleted = Ture)の場合は表示しない

# TODO: カテゴリー毎のhome画面
    #* カテゴリー毎の累計時間・累計日数の表示
    #* グラフの表示に必要なjson型データの送信

# class CategoryListView(LoginRequiredMixin, generic.View):
#     def get(self, request, *args, **kwargs):
#         return render(request, 'category_home.html')

# class CategoryAjaxView(LoginRequiredMixin, generic.View):
#     def get(self, request, *args, **kwargs):
#         # 過去すべてのレコードを取得する
#         end_date = date.min
#         records = ActivityCategory.objects.filter(user=self.request.user, date__gte=end_date)

#         # 日付ごとのレコードのリストを取得する
#         records_by_date = {}
#         for record in records:
#             date_str = record.date.strftime('%-m/%-d')
#             if date_str not in records_by_date:
#                 records_by_date[date_str] = []
#             records_by_date[date_str].append(record)

#         # 日付のリストを作成する
#         date_list = []
#         # 日付から7日前までの日付を取得する
#         current_date = date.today()
#         for i in range(7):
#             date_str = current_date.strftime('%-m/%-d')
#             date_list.append(date_str)
#             current_date -= timedelta(days=1)
#         date_list.reverse()

#         # 日付ごとのdurationを合計したリストを作成する
#         duration_list = []
#         for date_str in date_list:
#             if date_str in records_by_date:
#                 duration_sum = sum([record.duration for record in records_by_date[date_str]])
#                 duration_list.append(duration_sum)
#             else:
#                 duration_list.append(0)

#         # 日付の重複を除いた日数を計算する
#         total_days = len(set(records_by_date.keys()))

#         # 全レコードのdurationを合計する
#         total_duration = sum([record.duration for record in records])

#         # duration_listから各durationを'時間.分'の形式に変換する
#         duration_list = [f"{duration // 60 + duration % 60 / 60:.1f}" for duration in duration_list]

#         # JSON形式でデータを返す
#         response_data = {
#             'date_list': date_list,
#             'duration_list': duration_list,
#             'total_days': total_days,
#             'total_duration': f"{total_duration // 60}:{total_duration % 60}"
#         }
#         return JsonResponse(response_data)


class CategoryListView(LoginRequiredMixin, generic.ListView):
    model = ActivityCategory
    template_name = 'category_home.html'
    context_object_name = 'activities_by_category'

    def get_queryset(self):
        return ActivityCategory.objects.filter(activity_record__user=self.request.user).order_by('category')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        activities_by_category = {}
        for activity_category in context['object_list']:
            if activity_category.category not in activities_by_category:
                activities_by_category[activity_category.category] = []
            activities_by_category[activity_category.category].append(activity_category.activity_record)
        context['activities_by_category'] = activities_by_category
        return context

# カテゴリー作成機能
class CategoryAddView(LoginRequiredMixin, generic.CreateView):
    model = Category
    form_class = CategoryForm
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
