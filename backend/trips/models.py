import datetime
import uuid
import mongoengine as me

class DriverDetails(me.EmbeddedDocument):
    driver_name = me.StringField(default="John Doe")
    co_driver_name = me.StringField(default="")
    carrier_name = me.StringField(default="Apex Logistics Inc.")
    main_office_address = me.StringField(default="100 Freight Way, Chicago, IL 60601")
    home_terminal_timezone = me.StringField(default="America/Chicago")
    truck_number = me.StringField(default="TRK-8802")
    trailer_number = me.StringField(default="TRL-4410")
    shipping_doc_number = me.StringField(default="BOL-98231")

class LocationPoint(me.EmbeddedDocument):
    name = me.StringField(required=True)
    address = me.StringField(default="")
    latitude = me.FloatField(required=True)
    longitude = me.FloatField(required=True)

class Stop(me.EmbeddedDocument):
    stop_id = me.StringField(default=lambda: str(uuid.uuid4())[:8])
    stop_type = me.StringField(choices=['ORIGIN', 'PICKUP', 'DROPOFF', 'FUEL', 'REST', 'BREAK'])
    location_name = me.StringField()
    latitude = me.FloatField()
    longitude = me.FloatField()
    duration_hours = me.FloatField(default=0.0)
    arrival_time = me.StringField()
    departure_time = me.StringField()
    notes = me.StringField()
    cumulative_miles = me.FloatField(default=0.0)

class TimelineEvent(me.EmbeddedDocument):
    id = me.StringField()
    type = me.StringField(choices=['OFF_DUTY', 'SLEEPER_BERTH', 'DRIVING', 'ON_DUTY_NOT_DRIVING'])
    status_code = me.StringField(choices=['OFF', 'SB', 'D', 'ON'])
    start_time = me.StringField()
    end_time = me.StringField()
    duration_hours = me.FloatField()
    start_location = me.StringField()
    end_location = me.StringField()
    notes = me.StringField()
    accumulated_driving_hours = me.FloatField(default=0.0)
    shift_driving_hours = me.FloatField(default=0.0)
    shift_duty_hours = me.FloatField(default=0.0)
    cycle_hours_remaining = me.FloatField(default=70.0)

class DutySegment(me.EmbeddedDocument):
    status = me.StringField()
    status_code = me.StringField()
    status_index = me.IntField()
    start_hour = me.FloatField()
    end_hour = me.FloatField()
    duration_hours = me.FloatField()
    location = me.StringField()
    notes = me.StringField()

class StatusTotals(me.EmbeddedDocument):
    off_duty_hours = me.FloatField(default=0.0)
    sleeper_berth_hours = me.FloatField(default=0.0)
    driving_hours = me.FloatField(default=0.0)
    on_duty_hours = me.FloatField(default=0.0)
    total_hours = me.FloatField(default=24.0)

class Remark(me.EmbeddedDocument):
    time = me.StringField()
    status = me.StringField()
    location = me.StringField()
    activity = me.StringField()

class DailyLog(me.EmbeddedDocument):
    day_number = me.IntField(required=True)
    date = me.StringField(required=True)
    driver_details = me.EmbeddedDocumentField(DriverDetails)
    total_miles_driving_today = me.FloatField(default=0.0)
    duty_segments = me.EmbeddedDocumentListField(DutySegment)
    status_totals = me.EmbeddedDocumentField(StatusTotals)
    remarks = me.EmbeddedDocumentListField(Remark)
    compliance_warnings = me.ListField(me.StringField())
    svg_grid_data = me.DictField()

class RouteSummary(me.EmbeddedDocument):
    total_distance_miles = me.FloatField(default=0.0)
    estimated_driving_time_hours = me.FloatField(default=0.0)
    total_trip_duration_hours = me.FloatField(default=0.0)
    total_driving_hours = me.FloatField(default=0.0)
    total_on_duty_hours = me.FloatField(default=0.0)
    total_off_duty_hours = me.FloatField(default=0.0)
    fuel_stops_count = me.IntField(default=0)
    rest_stops_count = me.IntField(default=0)

class ComplianceSummary(me.EmbeddedDocument):
    is_compliant = me.BooleanField(default=True)
    status = me.StringField(default='COMPLIANT')
    current_cycle_used = me.FloatField(default=0.0)
    cycle_hours_remaining_start = me.FloatField(default=70.0)
    cycle_hours_used_trip = me.FloatField(default=0.0)
    cycle_hours_remaining_end = me.FloatField(default=70.0)
    warnings = me.ListField(me.StringField())
    violations = me.ListField(me.StringField())

class Trip(me.Document):
    trip_id = me.StringField(primary_key=True, default=lambda: f"TRIP-{str(uuid.uuid4())[:8].upper()}")
    driver_details = me.EmbeddedDocumentField(DriverDetails, default=DriverDetails)
    current_location = me.EmbeddedDocumentField(LocationPoint, required=True)
    pickup_location = me.EmbeddedDocumentField(LocationPoint, required=True)
    dropoff_location = me.EmbeddedDocumentField(LocationPoint, required=True)
    current_cycle_used = me.FloatField(default=0.0)
    start_datetime = me.StringField()
    route_summary = me.EmbeddedDocumentField(RouteSummary, default=RouteSummary)
    stops = me.EmbeddedDocumentListField(Stop)
    timeline = me.EmbeddedDocumentListField(TimelineEvent)
    daily_logs = me.EmbeddedDocumentListField(DailyLog)
    compliance = me.EmbeddedDocumentField(ComplianceSummary, default=ComplianceSummary)
    route_geometry = me.DictField()
    route_instructions = me.ListField(me.DictField())
    created_at = me.DateTimeField(default=datetime.datetime.utcnow)
    updated_at = me.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'trips',
        'ordering': ['-created_at'],
        'indexes': ['trip_id', 'created_at']
    }

# Fallback in-memory storage for trips if MongoDB is offline
MEMORY_TRIPS = {}
