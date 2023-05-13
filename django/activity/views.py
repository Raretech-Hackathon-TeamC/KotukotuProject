from django.shortcuts import render
from django.views import generic
from django.urls import reverse_lazy, reverse
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Count, Prefetch
from django.http import JsonResponse
from .models import ActivityRecord
from .forms import ActivityRecordForm
from categories.models import Category, ActivityCategory
from datetime import timedelta, date
from collections import defaultdict


# ホーム画面
class HomeView(LoginRequiredMixin, generic.TemplateView):
    #! todo: 動作確認時にtestを追加
    template_name = 'test_home.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories_json_url'] = reverse('categories:categories_json')
        return context

# TODO: カテゴリー機能別色分け機能の追加

# ホーム画面へJson型のデータを送信する(非同期通信)
class HomeAjaxView(LoginRequiredMixin, generic.View):
    # getメソッドの場合
    def get(self, request, *args, **kwargs):
        # Pythonのdate.minを使用して日付の最小値をend_dateとして設定
        end_date = date.min

        # request.userを使用して現在のユーザーに紐づくアクティビティ記録を取得
        # date__gte=end_dateは、日付がend_dateよりも大きいまたは等しい記録のみを取得するフィルター
        records = ActivityRecord.objects.filter(user=self.request.user, date__gte=end_date)

        # Step 1: 日付ごと、カテゴリーごとのレコードリストを取得
        # defaultdictを使用して、日付とカテゴリーをキーとしたネストした辞書を作成
        records_by_date_and_category = defaultdict(lambda: defaultdict(list))

        # 取得した記録すべてに対してループ
        for record in records:
            # 記録の日付を文字列（'%-m/%-d'形式）に変換し、date_strとして保存
            date_str = record.date.strftime('%-m/%-d')

            # 当該記録に関連付けられたカテゴリーを取得
            categories = ActivityCategory.objects.filter(activity_record=record)

            # 各カテゴリーに対してループを実行し、日付とカテゴリーをキーとして、それぞれのカテゴリーに属する記録を辞書に追加
            for category in categories:
                records_by_date_and_category[date_str][category.category].append(record)

        # Step 2: 日付のリストとカテゴリー毎のdurationリストを作成
        # 現在の日付から過去7日間の日付を取得し、そのリストを作成
        date_list = []
        current_date = date.today()
        for i in range(7):
            date_str = current_date.strftime('%-m/%-d')
            date_list.append(date_str)
            current_date -= timedelta(days=1)
        date_list.reverse()

        # defaultdictを使用してカテゴリー毎のdurationリストを作成するための辞書を作成
        category_duration_lists = defaultdict(list)

        # 取得した日付リストのすべての日付に対してループ
        for date_str in date_list:
            # 全てのカテゴリーに対してループ
            for category in Category.objects.all():
                # もし特定のカテゴリーが特定の日付の記録に存在する場合
                if category in records_by_date_and_category[date_str]:
                    # そのカテゴリーの記録の合計持続時間（duration）を計算
                    duration_sum = sum([record.duration for record in records_by_date_and_category[date_str][category]])
                    # 合計持続時間をそのカテゴリーのdurationリストに追加
                    category_duration_lists[str(category)].append(duration_sum)
                else:
                    # もし特定のカテゴリーが特定の日付の記録に存在しない場合、その日のカテゴリーの持続時間（duration）は0としてリストに追加
                    category_duration_lists[str(category)].append(0)

        # Step 3: 未分類のdurationリストを作成
        # 日付ごとの持続時間（duration）のリストを作成
        duration_list = []
        for date_str in date_list:
            # もし特定の日付の記録が存在する場合
            if date_str in records_by_date_and_category:
                # その日の全記録の合計持続時間（duration）を計算
                duration_sum = sum([record.duration for category in records_by_date_and_category[date_str].values() for record in category])

                # 合計持続時間をリストに追加
                duration_list.append(duration_sum)
            else:
                # もし特定の日付の記録が存在しない場合、その日の持続時間（duration）は0としてリストに追加
                duration_list.append(0)

        # 未分類のdurationリストを作成
        uncategorized_duration_list = duration_list.copy()
        for category, category_duration_list in category_duration_lists.items():
            # 未分類のdurationは、全体のdurationから各カテゴリーのdurationを引いたもの
            uncategorized_duration_list = [total - category for total, category in zip(uncategorized_duration_list, category_duration_list)]

        # Step 4: カテゴリー毎の色情報を取得
        # 各カテゴリーの色情報を辞書として取得
        category_colors = {str(category): category.color_code for category in Category.objects.all()}

        # 全記録の持続時間（duration）を合計
        total_duration = sum([record.duration for record in records])

        # 日付の重複を除いた日数を計算
        total_days = len(set(records_by_date_and_category.keys()))

        # Step 5: JSONレスポンスの作成
        # 必要なデータを辞書としてまとめる
        data = {
            'date_list': date_list,
            # 'category_duration_lists' では、各カテゴリー（文字列形式）とそのリストの持続時間（時間形式に変換）のマッピングを作成します。
            'category_duration_lists': {str(category): [f"{duration // 60 + duration % 60 / 60:.1f}" for duration in category_duration_list] for category, category_duration_list in category_duration_lists.items()},


            # 'uncategorized_duration_list' は未分類のdurationリストを作成し、持続時間を時間形式に変換します。
            'uncategorized_duration_list': [f"{duration // 60 + duration % 60 / 60:.1f}" for duration in uncategorized_duration_list],

            # 'total_days' は記録が存在する日数を表します。
            'total_days': total_days,

            # 'total_duration' は全ての記録の持続時間を合計し、時間:分の形式に変換します。
            'total_duration': f"{total_duration // 60}:{total_duration % 60}",

            # 'category_colors' は各カテゴリーとその色情報のマッピングを作成します。
            'category_colors': category_colors,
        }
        # JsonResponseで上記で作成した辞書をJSON形式のHTTPレスポンスとして返します。
        return JsonResponse(data)



# 積み上げ追加画面
class ActivityAddView(LoginRequiredMixin, generic.CreateView):
    # モデル・フォーム・テンプレート・リダイレクト先の設定
    model = ActivityRecord
    form_class = ActivityRecordForm
    #! todo: 動作確認時にtestを追加
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
        #! todo: 動作確認時にtestを追加
        return render(request, 'activity_list.html')

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
    #! todo: 動作確認時にtestを追加
    template_name = 'activity_edit.html'
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
