from django.shortcuts import render
from django.views import generic
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Count, Prefetch
from django.http import JsonResponse
from django.core import serializers
from .models import ActivityRecord
from .forms import ActivityRecordForm
from categories.models import Category, ActivityCategory
from datetime import timedelta, date
import json

# ホーム画面
class HomeView(LoginRequiredMixin, generic.View):
    def get(self, request, *args, **kwargs):
        #! todo: 本番環境ではtestを削除
        return render(request, 'test_home.html')

# TODO: カテゴリー機能別色分け機能の追加
# ホーム画面へJson型のデータを送信する(非同期通信)
class HomeAjaxView(LoginRequiredMixin, generic.View):
    def get(self, request, *args, **kwargs):
        # 過去すべてのレコードを取得する
        end_date = date.min
        records = ActivityRecord.objects.filter(user=self.request.user, date__gte=end_date)

        # 日付ごとのレコードのリストを取得する
        records_by_date = {}
        for record in records:
            date_str = record.date.strftime('%-m/%-d')
            if date_str not in records_by_date:
                records_by_date[date_str] = []
            records_by_date[date_str].append(record)

        # 日付のリストを作成する
        date_list = []
        # 日付から7日前までの日付を取得する
        current_date = date.today()
        for i in range(7):
            date_str = current_date.strftime('%-m/%-d')
            date_list.append(date_str)
            current_date -= timedelta(days=1)
        date_list.reverse()

        # 日付ごとのdurationを合計したリストを作成する
        duration_list = []
        for date_str in date_list:
            if date_str in records_by_date:
                duration_sum = sum([record.duration for record in records_by_date[date_str]])
                duration_list.append(duration_sum)
            else:
                duration_list.append(0)

        # 日付の重複を除いた日数を計算する
        total_days = len(set(records_by_date.keys()))

        # 全レコードのdurationを合計する
        total_duration = sum([record.duration for record in records])

        # duration_listから各durationを'時間.分'の形式に変換する
        duration_list = [f"{duration // 60 + duration % 60 / 60:.1f}" for duration in duration_list]

        # JSON形式でデータを返す
        response_data = {
            'date_list': date_list,
            'duration_list': duration_list,
            'total_days': total_days,
            'total_duration': f"{total_duration // 60}:{total_duration % 60}"
        }
        return JsonResponse(response_data)


# 積み上げ追加画面
class ActivityAddView(LoginRequiredMixin, generic.CreateView):
    # モデル・フォーム・テンプレート・リダイレクト先の設定
    model = ActivityRecord
    form_class = ActivityRecordForm
    #! todo: 本番環境ではtestを削除
    template_name = 'test_activity_add.html'
    success_url = reverse_lazy('activity:home')

    # フォームが有効な場合、リクエストユーザーを設定
    def form_valid(self, form):
        form.instance.user = self.request.user
        return super().form_valid(form)

    def get_form_kwargs(self):
        kwargs = super(ActivityAddView, self).get_form_kwargs()
        kwargs.update({'user': self.request.user})
        return kwargs


    # POSTリクエストの場合、ajax_submitメソッドを呼び出す
    def dispatch(self, request, *args, **kwargs):
        if request.method == 'POST':
            return self.ajax_submit(request)
        # それ以外の場合、親クラスのdispatchメソッドを呼び出す
        return super(ActivityAddView, self).dispatch(request, *args, **kwargs)

    def ajax_submit(self, request):
        # リクエストからフォームを作成
        form = self.form_class(request.POST, instance=ActivityRecord(user=request.user), user=request.user)

        # フォームが有効な場合、保存し成功メッセージを返す
        if form.is_valid():
            activity = form.save()
            category = form.cleaned_data['category']

            # カテゴリーが選択されている場合、ActivityCategoryオブジェクトを作成
            if category:
                ActivityCategory.objects.create(category=category, activity_record=activity)

            return JsonResponse({"success": True})
        # フォームが無効な場合、エラーメッセージを返す
        else:
            return JsonResponse({"success": False, "errors": form.errors})

# 累計日数の取得
def get_total_days(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)

    # 日付を一意にしたデータセットを取得
    unique_dates = ActivityRecord.objects.filter(user=user).values('date').annotate(count=Count('date'))

    # 一意な日付の数をカウント
    total_days = len(unique_dates)

    return JsonResponse({"total_days": total_days})

# レコード画面(積み上げ一覧)
class ActivityListView(LoginRequiredMixin, generic.View):
    def get(self, request, *args, **kwargs):
        #! todo: 本番環境ではtestを削除
        return render(request, 'test_activity_list.html')

# レコード画面にJson型のデータを送信する(非同期通信)
class ActivityListAjaxView(LoginRequiredMixin, generic.View):
    # getリクエストの処理
    def get(self, request, *args, **kwargs):
        # ユーザーのアクティビティレコードを取得
        activities = ActivityRecord.objects.filter(user=request.user)

        # アクティビティに紐づくカテゴリーを一括で取得 (N+1問題の解消)
        # prefetch_relatedを使って、ActivityCategoryとCategoryを一度に取得
        activities = activities.prefetch_related(
            Prefetch(
                'activitycategory_set',
                queryset=ActivityCategory.objects.select_related('category'),
                to_attr='fetched_categories'
            )
        )

        # 各アクティビティのデータを格納するためのリストを作成
        activities_data = []

        # 各アクティビティレコードについて処理を行う
        for activity in activities:
            # fetched_categories属性の存在チェック
            # fetched_categories属性が存在する場合、その属性からカテゴリー名を取得
            # 存在しない場合、カテゴリーを空文字列とする
            if hasattr(activity, 'fetched_categories'):
                activity_categories = [activity_category.category for activity_category in activity.fetched_categories]
                category_color = ', '.join([category.color_code for category in activity_categories])
            else:
                category_color = ''

            # 各アクティビティのデータをリストに追加
            activities_data.append({
                'id': activity.pk,
                'date': activity.date.strftime('%Y-%m-%d'),
                'duration': round(activity.duration / 60, 1),
                'memo': activity.memo,
                'category_color': category_color,
            })

        # JSON形式でレスポンスを返す
        return JsonResponse({'activities': activities_data})


# 積み上げ編集画面
class ActivityEditView(LoginRequiredMixin, generic.UpdateView):
    model = ActivityRecord
    form_class = ActivityRecordForm
    #! todo: 本番環境ではtestを削除
    template_name = 'test_activity_edit.html'
    success_url = reverse_lazy('activity:activity_list')

    def get_form_kwargs(self):
        kwargs = super(ActivityEditView, self).get_form_kwargs()
        kwargs.update({'user': self.request.user})
        return kwargs

    def dispatch(self, request, *args, **kwargs):
        if request.method == 'POST':
            return self.ajax_submit(request)
        return super(ActivityEditView, self).dispatch(request, *args, **kwargs)

    def ajax_submit(self, request):
        instance = ActivityRecord.objects.get(pk=self.kwargs['pk'])
        form = self.form_class(request.POST, instance=instance, user=request.user)

        if form.is_valid():
            activity = form.save()
            category = form.cleaned_data['category']

            if category:
                ActivityCategory.objects.update_or_create(category=category, activity_record=activity)

            return JsonResponse({"success": True})
        else:
            return JsonResponse({"success": False, "errors": form.errors})


# 積み上げ削除画面
class ActivityDeleteView(LoginRequiredMixin, generic.DeleteView):
    model = ActivityRecord
    success_url = reverse_lazy('activity:activity_list')

    def post(self, request, *args, **kwargs):
        return self.delete(request, *args, **kwargs)

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)
