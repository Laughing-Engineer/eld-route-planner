from django.urls import path
from .views import (
    PlanTripView,
    TripListView,
    TripDetailView,
    TripRouteView,
    TripScheduleView,
    TripLogsView,
    GeocodeView,
    CalculateRouteView,
    HealthCheckView,
    LocationSuggestView
)

urlpatterns = [
    path('trips/plan/', PlanTripView.as_view(), name='trip-plan'),
    path('trips/', TripListView.as_view(), name='trip-list'),
    path('trips/<str:trip_id>/', TripDetailView.as_view(), name='trip-detail'),
    path('trips/<str:trip_id>/route/', TripRouteView.as_view(), name='trip-route'),
    path('trips/<str:trip_id>/schedule/', TripScheduleView.as_view(), name='trip-schedule'),
    path('trips/<str:trip_id>/logs/', TripLogsView.as_view(), name='trip-logs'),
    path('geocode/', GeocodeView.as_view(), name='geocode'),
    path('locations/suggest/', LocationSuggestView.as_view(), name='location-suggest'),
    path('routes/calculate/', CalculateRouteView.as_view(), name='calculate-route'),
    path('health/', HealthCheckView.as_view(), name='health-check'),
]
