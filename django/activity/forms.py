from django import forms
from .models import ActivityRecord
from categories.models import Category, ActivityCategory
from datetime import date

# ActivityRecord登録・編集用フォーム
class ActivityRecordForm(forms.ModelForm):
    # カテゴリーの入力欄を追加(初期値は空白, 選択は必須ではない)
    category = forms.ModelChoiceField(
        queryset=Category.objects.none(),
        required=False,
        label='カテゴリー'
    )
    date = forms.DateField(widget=forms.DateInput(attrs={'type': 'date', 'value': date.today().strftime('%Y-%m-%d')}))
    duration = forms.IntegerField(widget=forms.TimeInput(attrs={'type': 'time', 'value': '00:00'}))

    class Meta:
        model = ActivityRecord
        fields = ['date', 'duration', 'memo']

    # 初期値の設定
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super(ActivityRecordForm, self).__init__(*args, **kwargs)
        # 編集時の初期値を設定
        if self.instance.pk:
            # 活動時間の初期値を設定
            self.initial['duration'] = f"{self.instance.duration // 60:02d}:{self.instance.duration % 60:02d}"
            # 日付の初期値を設定
            self.initial['date'] = self.instance.date.strftime('%Y-%m-%d')

            # 関連付けられているカテゴリーを取得
            try:
                activity_category = ActivityCategory.objects.get(activity_record=self.instance)
                related_category = activity_category.category
            except ActivityCategory.DoesNotExist:
                related_category = None

            # カテゴリーフィールドの初期値を設定
            self.fields['category'].initial = related_category

        # userが指定されている場合、カテゴリーをユーザーに紐付けられている論理削除されていないカテゴリー一覧を取得
        if user:
            self.fields['category'].queryset = Category.objects.filter(user=user, is_deleted=False)

    # durationを分単位に変換
    def clean(self):
        cleaned_data = super().clean()
        duration = cleaned_data.get('duration')
        activity_date = cleaned_data.get('date')

        # 確認: 選択された日付が未来のものでない
        if activity_date is not None and activity_date > date.today():
            self.add_error('date', "未来の日付は選択できません。")

        # 確認:時間が入力されていない
        if duration == 0:
            self.add_error('duration', "時間を入力してください。")

        return cleaned_data


    # 分単位に変換した後の値をdurationカラムに保存します
    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.duration = self.cleaned_data['duration']

        if commit:
            instance.save()

        return instance
