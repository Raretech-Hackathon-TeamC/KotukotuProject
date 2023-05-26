from django.urls import path
from . import views

app_name = 'categories'

#TODO
urlpatterns = [
    path('add/', views.CategoryAddView.as_view(), name='category_add'),
    path('check_duplicate_add/', views.check_duplicate_add, name='check_duplicate_add'),
    path('restore/<str:category_name>/', views.category_restore, name='category_restore'),
    path('<int:pk>/edit/', views.CategoryEditView.as_view(), name='category_edit'),
    path('check_duplicate_edit/', views.check_duplicate_edit, name='check_duplicate_edit'),
    path('<int:pk>/delete/', views.CategoryDeleteView.as_view(), name='category_delete'),
    path('<int:pk>/', views.CategoryDetailView.as_view(), name='category_detail'),
    path('<int:pk>/category_detail_ajax/', views.CategoryDetailAjaxView.as_view(), name='category_detail_ajax'),
    path('categories_json/', views.CategoryHomeAjaxView.as_view(), name='categories_json')
]
