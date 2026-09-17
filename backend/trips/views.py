import datetime
import uuid
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import (
    PlanTripInputSerializer,
    GeocodeRequestSerializer,
    RouteCalculateRequestSerializer
)
from .models import Trip, MEMORY_TRIPS
from services.geocoding_service import geocode_location
from services.route_service import calculate_driving_route
from services.schedule_service import build_trip_schedule
from services.log_generator import generate_daily_logs

def serialize_mongo_trip(trip):
    """Converts a MongoEngine Trip document or dict into a standard JSON dictionary."""
    if isinstance(trip, dict):
        return trip
    
    # If it's a MongoEngine Document
    data = trip.to_mongo().to_dict()
    if '_id' in data:
        data['trip_id'] = str(data.pop('_id'))
    if 'created_at' in data and isinstance(data['created_at'], datetime.datetime):
        data['created_at'] = data['created_at'].isoformat()
    if 'updated_at' in data and isinstance(data['updated_at'], datetime.datetime):
        data['updated_at'] = data['updated_at'].isoformat()
    return data

class PlanTripView(APIView):
    """
    Main Trip Planning endpoint:
    1. Validates input
    2. Geocodes locations
    3. Calculates driving route
    4. Applies HOS rules & schedules stops
    5. Generates 24-hour ELD daily log sheets
    6. Persists trip to MongoDB Atlas
    """
    def post(self, request):
        serializer = PlanTripInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"error": "Validation Error", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        # 1. Geocode locations
        try:
            curr_loc = geocode_location(data["current_location"])
            pick_loc = geocode_location(data["pickup_location"])
            drop_loc = geocode_location(data["dropoff_location"])
        except ValueError as ve:
            return Response({"error": "Geocoding Failed", "message": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Geocoding Service Error", "message": str(e)}, status=status.HTTP_502_BAD_GATEWAY)

        # 2. Driver details dictionary
        driver_details = {
            "driver_name": data.get("driver_name", "John Doe"),
            "co_driver_name": data.get("co_driver_name", ""),
            "carrier_name": data.get("carrier_name", "Apex Logistics Inc."),
            "main_office_address": data.get("main_office_address", "100 Freight Way, Chicago, IL 60601"),
            "home_terminal_timezone": data.get("home_terminal_timezone", "America/Chicago"),
            "truck_number": data.get("truck_number", "TRK-8802"),
            "trailer_number": data.get("trailer_number", "TRL-4410"),
            "shipping_doc_number": data.get("shipping_doc_number", "BOL-98231")
        }

        # 3. Schedule & HOS Simulation
        try:
            plan_result = build_trip_schedule(
                origin=curr_loc,
                pickup=pick_loc,
                dropoff=drop_loc,
                current_cycle_used=data.get("current_cycle_used", 0.0),
                start_datetime=data.get("start_datetime"),
                avg_speed_mph=data.get("average_truck_speed", 55.0),
                fuel_interval_miles=data.get("fuel_tank_range_miles", 1000.0),
                driver_details=driver_details
            )
        except Exception as e:
            return Response({"error": "HOS Engine Calculation Error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 4. Generate 24-Hour ELD Daily Log Sheets
        try:
            daily_logs = generate_daily_logs(
                timeline_events=plan_result["timeline"],
                driver_details=driver_details,
                total_trip_miles=plan_result["route_summary"]["total_distance_miles"]
            )
        except Exception as e:
            return Response({"error": "Log Generator Error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        trip_id = f"TRIP-{str(uuid.uuid4())[:8].upper()}"
        now_str = datetime.datetime.utcnow().isoformat()

        trip_dict = {
            "trip_id": trip_id,
            "driver_details": driver_details,
            "current_location": curr_loc,
            "pickup_location": pick_loc,
            "dropoff_location": drop_loc,
            "current_cycle_used": data.get("current_cycle_used", 0.0),
            "start_datetime": data.get("start_datetime") or plan_result["timeline"][0]["start_time"],
            "route_summary": plan_result["route_summary"],
            "stops": plan_result["stops"],
            "timeline": plan_result["timeline"],
            "daily_logs": daily_logs,
            "compliance": plan_result["compliance"],
            "route_geometry": plan_result["route_geometry"],
            "route_instructions": plan_result["route_instructions"],
            "created_at": now_str,
            "updated_at": now_str
        }

        # 5. Persist to MongoDB if available, and store in in-memory cache
        MEMORY_TRIPS[trip_id] = trip_dict

        if getattr(settings, 'MONGO_CONNECTED', False):
            try:
                # Save using MongoEngine document
                mongo_trip = Trip(
                    trip_id=trip_id,
                    driver_details=driver_details,
                    current_location=curr_loc,
                    pickup_location=pick_loc,
                    dropoff_location=drop_loc,
                    current_cycle_used=data.get("current_cycle_used", 0.0),
                    start_datetime=trip_dict["start_datetime"],
                    route_summary=plan_result["route_summary"],
                    stops=plan_result["stops"],
                    timeline=plan_result["timeline"],
                    daily_logs=daily_logs,
                    compliance=plan_result["compliance"],
                    route_geometry=plan_result["route_geometry"],
                    route_instructions=plan_result["route_instructions"]
                )
                mongo_trip.save()
            except Exception as e:
                print(f"[MongoDB Warning] Could not persist trip to Atlas: {e}. Saved in memory.")

        return Response(trip_dict, status=status.HTTP_201_CREATED)

class TripListView(APIView):
    """Lists trips with optional search filter."""
    def get(self, request):
        search_query = request.query_params.get("search", "").strip().lower()
        results = []

        if getattr(settings, 'MONGO_CONNECTED', False):
            try:
                for trip in Trip.objects.order_by('-created_at'):
                    t_dict = serialize_mongo_trip(trip)
                    results.append(t_dict)
            except Exception as e:
                print(f"[MongoDB Warning] Failed fetching from Atlas: {e}. Reading from memory.")
                results = list(MEMORY_TRIPS.values())
        else:
            results = list(MEMORY_TRIPS.values())

        if search_query:
            results = [
                t for t in results
                if search_query in t.get("trip_id", "").lower()
                or search_query in t.get("current_location", {}).get("name", "").lower()
                or search_query in t.get("pickup_location", {}).get("name", "").lower()
                or search_query in t.get("dropoff_location", {}).get("name", "").lower()
                or search_query in t.get("driver_details", {}).get("driver_name", "").lower()
            ]

        # Return lightweight summaries for list view
        summaries = []
        for t in results:
            summaries.append({
                "trip_id": t.get("trip_id"),
                "driver_name": t.get("driver_details", {}).get("driver_name"),
                "current_location": t.get("current_location", {}).get("name"),
                "pickup_location": t.get("pickup_location", {}).get("name"),
                "dropoff_location": t.get("dropoff_location", {}).get("name"),
                "total_distance_miles": t.get("route_summary", {}).get("total_distance_miles"),
                "total_driving_hours": t.get("route_summary", {}).get("total_driving_hours"),
                "total_days": len(t.get("daily_logs", [])),
                "compliance_status": t.get("compliance", {}).get("status"),
                "is_compliant": t.get("compliance", {}).get("is_compliant"),
                "created_at": t.get("created_at")
            })

        return Response({"count": len(summaries), "trips": summaries}, status=status.HTTP_200_OK)

class TripDetailView(APIView):
    """Retrieves or deletes a specific trip."""
    def get(self, request, trip_id):
        trip_data = None
        if getattr(settings, 'MONGO_CONNECTED', False):
            try:
                t = Trip.objects(trip_id=trip_id).first()
                if t:
                    trip_data = serialize_mongo_trip(t)
            except Exception:
                pass

        if not trip_data:
            trip_data = MEMORY_TRIPS.get(trip_id)

        if not trip_data:
            return Response({"error": "Trip Not Found", "trip_id": trip_id}, status=status.HTTP_404_NOT_FOUND)

        return Response(trip_data, status=status.HTTP_200_OK)

    def delete(self, request, trip_id):
        deleted = False
        if getattr(settings, 'MONGO_CONNECTED', False):
            try:
                t = Trip.objects(trip_id=trip_id).first()
                if t:
                    t.delete()
                    deleted = True
            except Exception:
                pass

        if trip_id in MEMORY_TRIPS:
            del MEMORY_TRIPS[trip_id]
            deleted = True

        if not deleted:
            return Response({"error": "Trip Not Found", "trip_id": trip_id}, status=status.HTTP_404_NOT_FOUND)

        return Response({"message": f"Trip {trip_id} deleted successfully."}, status=status.HTTP_200_OK)

class TripRouteView(APIView):
    """Retrieves only route geometry and instructions."""
    def get(self, request, trip_id):
        t = MEMORY_TRIPS.get(trip_id)
        if not t and getattr(settings, 'MONGO_CONNECTED', False):
            try:
                m_trip = Trip.objects(trip_id=trip_id).first()
                if m_trip:
                    t = serialize_mongo_trip(m_trip)
            except Exception:
                pass

        if not t:
            return Response({"error": "Trip Not Found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "trip_id": trip_id,
            "route_summary": t.get("route_summary"),
            "route_geometry": t.get("route_geometry"),
            "route_instructions": t.get("route_instructions")
        }, status=status.HTTP_200_OK)

class TripScheduleView(APIView):
    """Retrieves timeline and stops."""
    def get(self, request, trip_id):
        t = MEMORY_TRIPS.get(trip_id)
        if not t and getattr(settings, 'MONGO_CONNECTED', False):
            try:
                m_trip = Trip.objects(trip_id=trip_id).first()
                if m_trip:
                    t = serialize_mongo_trip(m_trip)
            except Exception:
                pass

        if not t:
            return Response({"error": "Trip Not Found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "trip_id": trip_id,
            "stops": t.get("stops"),
            "timeline": t.get("timeline"),
            "compliance": t.get("compliance")
        }, status=status.HTTP_200_OK)

class TripLogsView(APIView):
    """Retrieves daily ELD logs for a trip."""
    def get(self, request, trip_id):
        t = MEMORY_TRIPS.get(trip_id)
        if not t and getattr(settings, 'MONGO_CONNECTED', False):
            try:
                m_trip = Trip.objects(trip_id=trip_id).first()
                if m_trip:
                    t = serialize_mongo_trip(m_trip)
            except Exception:
                pass

        if not t:
            return Response({"error": "Trip Not Found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "trip_id": trip_id,
            "daily_logs": t.get("daily_logs")
        }, status=status.HTTP_200_OK)

class GeocodeView(APIView):
    """Standalone geocoding endpoint."""
    def post(self, request):
        serializer = GeocodeRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            res = geocode_location(serializer.validated_data["query"])
            return Response(res, status=status.HTTP_200_OK)
        except ValueError as ve:
            return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Geocoding failed", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CalculateRouteView(APIView):
    """Standalone routing calculation endpoint."""
    def post(self, request):
        serializer = RouteCalculateRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        route = calculate_driving_route(
            data["start_lat"], data["start_lon"],
            data["end_lat"], data["end_lon"],
            avg_speed_mph=data.get("avg_speed_mph", 55.0)
        )
        return Response(route, status=status.HTTP_200_OK)

class HealthCheckView(APIView):
    """Health status endpoint."""
    def get(self, request):
        return Response({
            "status": "healthy",
            "service": "ELD Route Planner & HOS Log Generator API",
            "version": "1.0.0",
            "mongodb_connected": getattr(settings, 'MONGO_CONNECTED', False),
            "timestamp": datetime.datetime.utcnow().isoformat()
        }, status=status.HTTP_200_OK)
