from django.urls import path
from . import views

app_name = 'activity'

urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('list/', views.ActivityListView.as_view(), name='activity_list'),
    path('add/', views.ActivityAddView.as_view(), name='activity_add'),
    path('add/ajax_submit/', views.ActivityAddView.as_view(), name='activity_add_ajax_submit'),
    path('<int:pk>/edit/', views.ActivityEditView.as_view(), name='activity_edit'),
    path('<int:pk>/edit/ajax_submit/', views.ActivityEditView.as_view(), name='activity_edit_ajax_submit'),
    path('<int:pk>/delete/', views.ActivityDeleteView.as_view(), name='activity_delete'),
    path('get_total_days/', views.get_total_days, name='get_total_days'),
]
