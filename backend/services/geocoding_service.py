import time
import requests
from django.conf import settings

GEOCODE_CACHE = {}

FALLBACK_HUBS = {
    "chicago": {"name": "Chicago, IL", "latitude": 41.8781, "longitude": -87.6298, "address": "Chicago, Cook County, Illinois, USA"},
    "los angeles": {"name": "Los Angeles, CA", "latitude": 34.0522, "longitude": -118.2437, "address": "Los Angeles, California, USA"},
    "dallas": {"name": "Dallas, TX", "latitude": 32.7767, "longitude": -96.7970, "address": "Dallas, Dallas County, Texas, USA"},
    "houston": {"name": "Houston, TX", "latitude": 29.7604, "longitude": -95.3698, "address": "Houston, Harris County, Texas, USA"},
    "atlanta": {"name": "Atlanta, GA", "latitude": 33.7490, "longitude": -84.3880, "address": "Atlanta, Fulton County, Georgia, USA"},
    "new york": {"name": "New York, NY", "latitude": 40.7128, "longitude": -74.0060, "address": "New York, New York, USA"},
    "seattle": {"name": "Seattle, WA", "latitude": 47.6062, "longitude": -122.3321, "address": "Seattle, King County, Washington, USA"},
    "denver": {"name": "Denver, CO", "latitude": 39.7392, "longitude": -104.9903, "address": "Denver, Colorado, USA"},
    "kansas city": {"name": "Kansas City, MO", "latitude": 39.0997, "longitude": -94.5786, "address": "Kansas City, Jackson County, Missouri, USA"},
    "phoenix": {"name": "Phoenix, AZ", "latitude": 33.4484, "longitude": -112.0740, "address": "Phoenix, Maricopa County, Arizona, USA"},
    "indianapolis": {"name": "Indianapolis, IN", "latitude": 39.7684, "longitude": -86.1581, "address": "Indianapolis, Marion County, Indiana, USA"},
    "memphis": {"name": "Memphis, TN", "latitude": 35.1495, "longitude": -90.0490, "address": "Memphis, Shelby County, Tennessee, USA"},
    "nashville": {"name": "Nashville, TN", "latitude": 36.1627, "longitude": -86.7816, "address": "Nashville, Davidson County, Tennessee, USA"},
    "detroit": {"name": "Detroit, MI", "latitude": 42.3314, "longitude": -83.0458, "address": "Detroit, Wayne County, Michigan, USA"},
    "miami": {"name": "Miami, FL", "latitude": 25.7617, "longitude": -80.1918, "address": "Miami, Miami-Dade County, Florida, USA"},
    "philadelphia": {"name": "Philadelphia, PA", "latitude": 39.9526, "longitude": -75.1652, "address": "Philadelphia, Pennsylvania, USA"},
    "san francisco": {"name": "San Francisco, CA", "latitude": 37.7749, "longitude": -122.4194, "address": "San Francisco, California, USA"},
    "st. louis": {"name": "St. Louis, MO", "latitude": 38.6270, "longitude": -90.1994, "address": "St. Louis, Missouri, USA"},
    "saint louis": {"name": "St. Louis, MO", "latitude": 38.6270, "longitude": -90.1994, "address": "St. Louis, Missouri, USA"},
    "minneapolis": {"name": "Minneapolis, MN", "latitude": 44.9778, "longitude": -93.2650, "address": "Minneapolis, Hennepin County, Minnesota, USA"},
    "columbus": {"name": "Columbus, OH", "latitude": 39.9612, "longitude": -82.9988, "address": "Columbus, Franklin County, Ohio, USA"},
    "charlotte": {"name": "Charlotte, NC", "latitude": 35.2271, "longitude": -80.8431, "address": "Charlotte, Mecklenburg County, North Carolina, USA"},
    "salt lake city": {"name": "Salt Lake City, UT", "latitude": 40.7608, "longitude": -111.8910, "address": "Salt Lake City, Utah, USA"},
    "las vegas": {"name": "Las Vegas, NV", "latitude": 36.1699, "longitude": -115.1398, "address": "Las Vegas, Clark County, Nevada, USA"},
    "oklahoma city": {"name": "Oklahoma City, OK", "latitude": 35.4676, "longitude": -97.5164, "address": "Oklahoma City, Oklahoma, USA"},
    "omaha": {"name": "Omaha, NE", "latitude": 41.2565, "longitude": -95.9345, "address": "Omaha, Douglas County, Nebraska, USA"},
    "albuquerque": {"name": "Albuquerque, NM", "latitude": 35.0844, "longitude": -106.6504, "address": "Albuquerque, Bernalillo County, New Mexico, USA"},
    "portland": {"name": "Portland, OR", "latitude": 45.5152, "longitude": -122.6784, "address": "Portland, Multnomah County, Oregon, USA"},
    "pittsburgh": {"name": "Pittsburgh, PA", "latitude": 40.4406, "longitude": -79.9959, "address": "Pittsburgh, Allegheny County, Pennsylvania, USA"},
    "cincinnati": {"name": "Cincinnati, OH", "latitude": 39.1031, "longitude": -84.5120, "address": "Cincinnati, Hamilton County, Ohio, USA"},
    "cleveland": {"name": "Cleveland, OH", "latitude": 41.4993, "longitude": -81.6944, "address": "Cleveland, Cuyahoga County, Ohio, USA"},
    "boston": {"name": "Boston, MA", "latitude": 42.3601, "longitude": -71.0589, "address": "Boston, Suffolk County, Massachusetts, USA"},
    "baltimore": {"name": "Baltimore, MD", "latitude": 39.2904, "longitude": -76.6122, "address": "Baltimore, Maryland, USA"},
    "milwaukee": {"name": "Milwaukee, WI", "latitude": 43.0389, "longitude": -87.9065, "address": "Milwaukee, Milwaukee County, Wisconsin, USA"},
    "louisville": {"name": "Louisville, KY", "latitude": 38.2527, "longitude": -85.7585, "address": "Louisville, Jefferson County, Kentucky, USA"},
    "new orleans": {"name": "New Orleans, LA", "latitude": 29.9511, "longitude": -90.0715, "address": "New Orleans, Orleans Parish, Louisiana, USA"},
    "san antonio": {"name": "San Antonio, TX", "latitude": 29.4241, "longitude": -98.4936, "address": "San Antonio, Bexar County, Texas, USA"},
    "el paso": {"name": "El Paso, TX", "latitude": 31.7619, "longitude": -106.4850, "address": "El Paso, El Paso County, Texas, USA"},
    "des moines": {"name": "Des Moines, IA", "latitude": 41.5868, "longitude": -93.6250, "address": "Des Moines, Polk County, Iowa, USA"},
    "boise": {"name": "Boise, ID", "latitude": 43.6150, "longitude": -116.2023, "address": "Boise, Ada County, Idaho, USA"},
    "little rock": {"name": "Little Rock, AR", "latitude": 34.7465, "longitude": -92.2896, "address": "Little Rock, Pulaski County, Arkansas, USA"},
    "birmingham": {"name": "Birmingham, AL", "latitude": 33.5186, "longitude": -86.8104, "address": "Birmingham, Jefferson County, Alabama, USA"},
    "richmond": {"name": "Richmond, VA", "latitude": 37.5407, "longitude": -77.4360, "address": "Richmond, Virginia, USA"},
    "raleigh": {"name": "Raleigh, NC", "latitude": 35.7796, "longitude": -78.6382, "address": "Raleigh, Wake County, North Carolina, USA"},
    "jacksonville": {"name": "Jacksonville, FL", "latitude": 30.3322, "longitude": -81.6557, "address": "Jacksonville, Duval County, Florida, USA"},
    "tampa": {"name": "Tampa, FL", "latitude": 27.9506, "longitude": -82.4572, "address": "Tampa, Hillsborough County, Florida, USA"},
}

def geocode_location(query: str) -> dict:
    query = (query or "").strip()
    if not query:
        raise ValueError("Location query cannot be empty.")

    clean_key = query.lower()
    if clean_key in GEOCODE_CACHE:
        return GEOCODE_CACHE[clean_key]

    # Try OpenStreetMap Nominatim with proper User-Agent
    user_agent = getattr(settings, 'NOMINATIM_USER_AGENT', 'ELDRoutePlanner/1.0')
    url = "https://nominatim.openstreetmap.org/search"
    headers = {
        "User-Agent": user_agent,
        "Accept": "application/json"
    }
    params = {
        "q": query,
        "format": "json",
        "limit": 1,
        "addressdetails": 1
    }

    try:
        response = requests.get(url, headers=headers, params=params, timeout=4)
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                first = data[0]
                result = {
                    "name": query,
                    "address": first.get("display_name", query),
                    "latitude": float(first.get("lat")),
                    "longitude": float(first.get("lon"))
                }
                GEOCODE_CACHE[clean_key] = result
                return result
    except Exception as e:
        print(f"[Geocoding Warning] Nominatim request failed for '{query}': {e}. Checking fallback hubs.")

    # Fallback to predefined freight hubs
    for hub_key, hub_data in FALLBACK_HUBS.items():
        if hub_key in clean_key or clean_key in hub_key:
            result = {
                "name": query,
                "address": hub_data["address"],
                "latitude": hub_data["latitude"],
                "longitude": hub_data["longitude"]
            }
            GEOCODE_CACHE[clean_key] = result
            return result

    # Check state/city fuzzy matches
    parts = [p.strip().lower() for p in query.replace(",", " ").split() if p.strip()]
    for part in parts:
        if part in FALLBACK_HUBS:
            hub = FALLBACK_HUBS[part]
            result = {
                "name": query,
                "address": f"{query} (approx. via {hub['name']})",
                "latitude": hub["latitude"],
                "longitude": hub["longitude"]
            }
            GEOCODE_CACHE[clean_key] = result
            return result

    # Default coordinate if unrecognized to avoid total crash
    raise ValueError(f"Could not locate '{query}'. Please provide a recognized city or state (e.g., 'Chicago, IL', 'Dallas, TX').")
