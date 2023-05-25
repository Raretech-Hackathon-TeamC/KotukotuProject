from django import forms
from .models import Category

class CategoryForm(forms.ModelForm):
    name = forms.CharField(required=False)
    goal = forms.CharField(required=False)
    color_code = forms.CharField(required=False)

    class Meta:
        model = Category
        fields = ['name', 'goal', 'color_code']

    def clean_name(self):
        name = self.cleaned_data.get('name')
        if not name:
            raise forms.ValidationError('カテゴリー名を入力して下さい')
        if len(name) > 30:
            raise forms.ValidationError('30文字以内で入力して下さい')
        return name

    def clean_goal(self):
        goal = self.cleaned_data.get('goal')
        if not goal:
            raise forms.ValidationError('目標を入力して下さい')
        if len(goal) > 255:
            raise forms.ValidationError('255文字以内で入力して下さい')

    def clean_color_code(self):
        color_code = self.cleaned_data.get('color_code')
        if not color_code:
            raise forms.ValidationError('色を選択して下さい')
        return color_code
