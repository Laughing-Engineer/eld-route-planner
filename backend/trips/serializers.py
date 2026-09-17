from rest_framework import serializers

class PlanTripInputSerializer(serializers.Serializer):
    current_location = serializers.CharField(required=True, allow_blank=False, help_text="Current truck location / city")
    pickup_location = serializers.CharField(required=True, allow_blank=False, help_text="Pickup location / shipper facility")
    dropoff_location = serializers.CharField(required=True, allow_blank=False, help_text="Drop-off location / receiver facility")
    current_cycle_used = serializers.FloatField(required=False, default=0.0, min_value=0.0, max_value=70.0, help_text="Hours already used in 70-hr/8-day cycle")
    
    # Optional parameters
    driver_name = serializers.CharField(required=False, default="John Doe", max_length=120)
    co_driver_name = serializers.CharField(required=False, default="", allow_blank=True, max_length=120)
    carrier_name = serializers.CharField(required=False, default="Apex Logistics Inc.", max_length=120)
    main_office_address = serializers.CharField(required=False, default="100 Freight Way, Chicago, IL 60601", max_length=255)
    home_terminal_timezone = serializers.CharField(required=False, default="America/Chicago", max_length=60)
    truck_number = serializers.CharField(required=False, default="TRK-8802", max_length=50)
    trailer_number = serializers.CharField(required=False, default="TRL-4410", max_length=50)
    shipping_doc_number = serializers.CharField(required=False, default="BOL-98231", max_length=50)
    start_datetime = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    average_truck_speed = serializers.FloatField(required=False, default=55.0, min_value=30.0, max_value=80.0)
    fuel_tank_range_miles = serializers.FloatField(required=False, default=1000.0, min_value=300.0, max_value=2000.0)

    def validate_current_cycle_used(self, value):
        if value is None:
            return 0.0
        if value < 0.0 or value > 70.0:
            raise serializers.ValidationError("Current cycle used must be between 0.0 and 70.0 hours.")
        return value

class GeocodeRequestSerializer(serializers.Serializer):
    query = serializers.CharField(required=True, allow_blank=False)

class RouteCalculateRequestSerializer(serializers.Serializer):
    start_lat = serializers.FloatField(required=True)
    start_lon = serializers.FloatField(required=True)
    end_lat = serializers.FloatField(required=True)
    end_lon = serializers.FloatField(required=True)
    avg_speed_mph = serializers.FloatField(required=False, default=55.0)
