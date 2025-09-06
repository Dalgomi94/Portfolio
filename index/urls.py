from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path("ajax/test/", views.index_ajax, name="test_ajax"),
]