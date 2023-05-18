from django.urls import path
from .views import BadgeListView, BadgeListAjaxView

app_name = 'badges'

urlpatterns = [
    path('', BadgeListView.as_view(), name='badge_list'),
    path('ajax_get_data/', BadgeListAjaxView.as_view(), name='badge_list_ajax'),
]
