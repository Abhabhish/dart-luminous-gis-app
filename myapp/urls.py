from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('ajax/load-districts/', views.load_districts, name='ajax_load_districts'),
    path('api/district-growth/<str:district_name>/', views.district_growth, name='district_growth'),
    path('api/district-details/<str:district_name>/', views.district_details, name='district_details'),
    path('api/state-districts/<str:state_name>/', views.state_districts, name='state_districts'),

    # path('api/state-districts/<str:state_name>/', views.state_districts, name='state_districts'),
    path('api/state-district-details/<str:state_name>/', views.state_district_details, name='state_district_details'),
    # path('api/district-details/<str:district_name>/', views.district_details, name='district_details'),
    # path('api/district-growth/<str:district_name>/', views.district_growth, name='district_growth')
]
