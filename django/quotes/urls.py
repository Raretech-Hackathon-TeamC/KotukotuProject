from django.urls import path
from . import views

app_name = 'quotes'

urlpatterns = [
    path('random/', views.random_quote, name='random_quote'),
]
