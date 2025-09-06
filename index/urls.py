from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path("ajax/index_data_save", views.ajax_index_data_save, name="ajax_index_data_save"),
]