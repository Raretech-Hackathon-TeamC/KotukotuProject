from django import forms
from users.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import authenticate
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

# ユーザー登録用
class RegistForm(forms.ModelForm):
    user_name = forms.CharField(label='名前')
    email = forms.EmailField(label='メールアドレス')
    password = forms.CharField(label='パスワード', widget=forms.PasswordInput())
    confirm_password = forms.CharField(label='パスワード再入力', widget=forms.PasswordInput())

    class Meta:
        model = User
        fields = ['user_name', 'email', 'password']
    
    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')  # passwordの存在を確認する
        confirm_password = cleaned_data.get('confirm_password')  # confirm_passwordの存在を確認する

        if password and confirm_password:
            if password != confirm_password:
                self.add_error('confirm_password', 'パスワードが異なります')
            try:
                validate_password(password, self.instance)
            except forms.ValidationError as error:
                self.add_error('password', error)
        else:
            if not password:
                self.add_error('password', 'パスワードを入力してください') # passwordが空の場合にエラーメッセージを追加
            if not confirm_password:
                self.add_error('confirm_password', '確認用パスワードを入力してください') # confirm_passwordが空の場合にエラーメッセージを追加
        
    def save(self, commit=False):
        user = super().save(commit=False)
        validate_password(self.cleaned_data['password'], user)
        user.set_password(self.cleaned_data['password'])
        user.save()
        return user


# login用
class UserLoginForm(AuthenticationForm):
    username = forms.EmailField(label='メールアドレス')
    password = forms.CharField(label='パスワード', widget=forms.PasswordInput())
    error_messages = {
        'invalid_login': "メールアドレスまたはパスワードが正しくありません。",
    }