from django.urls import path
from . import views

app_name = 'activity'

urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('ajax_get_data/', views.HomeAjaxView.as_view(), name='home_ajax'),
    path('list/', views.ActivityListView.as_view(), name='activity_list'),
    path('list/ajax_get_data/', views.ActivityListAjaxView.as_view(), name='list_ajax'),
    path('add/', views.ActivityAddView.as_view(), name='activity_add'),
    path('<int:pk>/edit/', views.ActivityEditView.as_view(), name='activity_edit'),
    path('<int:pk>/delete/', views.ActivityDeleteView.as_view(), name='activity_delete'),
    path('get_total_days/', views.get_total_days, name='get_total_days'),
]
