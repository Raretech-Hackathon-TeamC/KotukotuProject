from django.urls import path
from . import views

app_name = 'categories'

#TODO
urlpatterns = [
    path('home/<int:pk>/', views.CategoryListView.as_view(), name='category_home'),
    path('add/', views.CategoryAddView.as_view(), name='category_add'),
    path('check_duplicate_add/', views.check_duplicate_add, name='check_duplicate_add'),
    path('restore/<int:pk>/', views.category_restore, name='category_restore'),
    path('<int:pk>/edit/', views.CategoryEditView.as_view(), name='category_edit'),
    path('check_duplicate_edit/', views.check_duplicate_edit, name='check_duplicate_edit'),
    path('<int:pk>/delete/', views.CategoryDeleteView.as_view(), name='category_delete')
]
