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
    "austin": {"name": "Austin, TX", "latitude": 30.2672, "longitude": -97.7431, "address": "Austin, Travis County, Texas, USA"},
    "san diego": {"name": "San Diego, CA", "latitude": 32.7157, "longitude": -117.1611, "address": "San Diego, San Diego County, California, USA"},
    "san jose": {"name": "San Jose, CA", "latitude": 37.3382, "longitude": -121.8863, "address": "San Jose, Santa Clara County, California, USA"},
    "sacramento": {"name": "Sacramento, CA", "latitude": 38.5816, "longitude": -121.4944, "address": "Sacramento, Sacramento County, California, USA"},
    "fresno": {"name": "Fresno, CA", "latitude": 36.7468, "longitude": -119.7726, "address": "Fresno, Fresno County, California, USA"},
    "bakersfield": {"name": "Bakersfield, CA", "latitude": 35.3733, "longitude": -119.0187, "address": "Bakersfield, Kern County, California, USA"},
    "fort worth": {"name": "Fort Worth, TX", "latitude": 32.7555, "longitude": -97.3308, "address": "Fort Worth, Tarrant County, Texas, USA"},
    "elizabeth": {"name": "Elizabeth, NJ", "latitude": 40.6639, "longitude": -74.2107, "address": "Elizabeth, Union County, New Jersey, USA"},
    "newark": {"name": "Newark, NJ", "latitude": 40.7357, "longitude": -74.1724, "address": "Newark, Essex County, New Jersey, USA"},
    "laredo": {"name": "Laredo, TX", "latitude": 27.5036, "longitude": -99.5076, "address": "Laredo, Webb County, Texas, USA"},
    "savannah": {"name": "Savannah, GA", "latitude": 32.0809, "longitude": -81.0912, "address": "Savannah, Chatham County, Georgia, USA"},
    "chattanooga": {"name": "Chattanooga, TN", "latitude": 35.0456, "longitude": -85.3097, "address": "Chattanooga, Hamilton County, Tennessee, USA"},
    "knoxville": {"name": "Knoxville, TN", "latitude": 35.9606, "longitude": -83.9207, "address": "Knoxville, Knox County, Tennessee, USA"},
    "toronto": {"name": "Toronto, ON, Canada", "latitude": 43.6532, "longitude": -79.3832, "address": "Toronto, Ontario, Canada"},
    "montreal": {"name": "Montreal, QC, Canada", "latitude": 45.5017, "longitude": -73.5673, "address": "Montreal, Quebec, Canada"},
    "vancouver": {"name": "Vancouver, BC, Canada", "latitude": 49.2827, "longitude": -123.1207, "address": "Vancouver, British Columbia, Canada"}
}

STATE_HUBS = {
    "california": {"name": "California, USA", "latitude": 36.7783, "longitude": -119.4179, "address": "California, United States", "type": "state"},
    "texas": {"name": "Texas, USA", "latitude": 31.9686, "longitude": -99.9018, "address": "Texas, United States", "type": "state"},
    "florida": {"name": "Florida, USA", "latitude": 27.6648, "longitude": -81.5158, "address": "Florida, United States", "type": "state"},
    "illinois": {"name": "Illinois, USA", "latitude": 40.6331, "longitude": -89.3985, "address": "Illinois, United States", "type": "state"},
    "ohio": {"name": "Ohio, USA", "latitude": 40.4173, "longitude": -82.9071, "address": "Ohio, United States", "type": "state"},
    "indiana": {"name": "Indiana, USA", "latitude": 40.2672, "longitude": -86.1349, "address": "Indiana, United States", "type": "state"},
    "pennsylvania": {"name": "Pennsylvania, USA", "latitude": 41.2033, "longitude": -77.1945, "address": "Pennsylvania, United States", "type": "state"},
    "georgia": {"name": "Georgia, USA", "latitude": 32.1656, "longitude": -82.9001, "address": "Georgia, United States", "type": "state"},
    "michigan": {"name": "Michigan, USA", "latitude": 44.3148, "longitude": -85.6024, "address": "Michigan, United States", "type": "state"},
    "arizona": {"name": "Arizona, USA", "latitude": 34.0489, "longitude": -111.0937, "address": "Arizona, United States", "type": "state"},
    "washington": {"name": "Washington, USA", "latitude": 47.7511, "longitude": -120.7401, "address": "Washington, United States", "type": "state"},
    "colorado": {"name": "Colorado, USA", "latitude": 39.5501, "longitude": -105.7821, "address": "Colorado, United States", "type": "state"},
    "nevada": {"name": "Nevada, USA", "latitude": 38.8026, "longitude": -116.4194, "address": "Nevada, United States", "type": "state"},
    "tennessee": {"name": "Tennessee, USA", "latitude": 35.5175, "longitude": -86.5804, "address": "Tennessee, United States", "type": "state"},
    "missouri": {"name": "Missouri, USA", "latitude": 37.9643, "longitude": -91.8318, "address": "Missouri, United States", "type": "state"},
    "wisconsin": {"name": "Wisconsin, USA", "latitude": 43.7844, "longitude": -88.7879, "address": "Wisconsin, United States", "type": "state"},
    "minnesota": {"name": "Minnesota, USA", "latitude": 46.7296, "longitude": -94.6859, "address": "Minnesota, United States", "type": "state"},
    "alabama": {"name": "Alabama, USA", "latitude": 32.3182, "longitude": -86.9023, "address": "Alabama, United States", "type": "state"},
    "north carolina": {"name": "North Carolina, USA", "latitude": 35.7596, "longitude": -79.0193, "address": "North Carolina, United States", "type": "state"},
    "south carolina": {"name": "South Carolina, USA", "latitude": 33.8361, "longitude": -81.1637, "address": "South Carolina, United States", "type": "state"},
    "virginia": {"name": "Virginia, USA", "latitude": 37.4316, "longitude": -78.6569, "address": "Virginia, United States", "type": "state"},
    "kentucky": {"name": "Kentucky, USA", "latitude": 37.8393, "longitude": -84.2700, "address": "Kentucky, United States", "type": "state"},
    "oregon": {"name": "Oregon, USA", "latitude": 43.8041, "longitude": -120.5542, "address": "Oregon, United States", "type": "state"},
    "oklahoma": {"name": "Oklahoma, USA", "latitude": 35.0078, "longitude": -97.0929, "address": "Oklahoma, United States", "type": "state"},
    "louisiana": {"name": "Louisiana, USA", "latitude": 30.9843, "longitude": -91.9623, "address": "Louisiana, United States", "type": "state"},
    "iowa": {"name": "Iowa, USA", "latitude": 41.8780, "longitude": -93.0977, "address": "Iowa, United States", "type": "state"},
    "kansas": {"name": "Kansas, USA", "latitude": 39.0119, "longitude": -98.4842, "address": "Kansas, United States", "type": "state"},
    "utah": {"name": "Utah, USA", "latitude": 39.3210, "longitude": -111.0937, "address": "Utah, United States", "type": "state"},
    "arkansas": {"name": "Arkansas, USA", "latitude": 35.2010, "longitude": -91.8318, "address": "Arkansas, United States", "type": "state"},
    "nebraska": {"name": "Nebraska, USA", "latitude": 41.4925, "longitude": -99.9018, "address": "Nebraska, United States", "type": "state"},
    "new jersey": {"name": "New Jersey, USA", "latitude": 40.0583, "longitude": -74.4057, "address": "New Jersey, United States", "type": "state"},
    "new york": {"name": "New York State, USA", "latitude": 43.2994, "longitude": -74.2179, "address": "New York, United States", "type": "state"}
}

TYPO_ALIASES = {
    "dellas": "dallas",
    "dalas": "dallas",
    "dalllas": "dallas",
    "califonia": "california",
    "calfornia": "california",
    "cali": "california",
    "chicargo": "chicago",
    "chigago": "chicago",
    "housten": "houston",
    "pheonix": "phoenix",
    "phenix": "phoenix",
    "philly": "philadelphia",
    "nyc": "new york",
    "la": "los angeles",
    "vegas": "las vegas",
    "indy": "indianapolis",
    "atl": "atlanta",
    "san fran": "san francisco",
    "sf": "san francisco",
    "kc": "kansas city",
    "stl": "st. louis",
    "slc": "salt lake city",
    "columbas": "columbus",
    "milwakee": "milwaukee",
    "nashvile": "nashville",
    "mempis": "memphis",
    "detroit": "detroit",
    "pittsburg": "pittsburgh"
}

SUGGESTION_CACHE = {}

def normalize_query(query: str) -> str:
    """Normalizes query and resolves common typos."""
    q = (query or "").strip().lower()
    return TYPO_ALIASES.get(q, q)

def get_location_suggestions(query: str, limit: int = 8) -> list:
    """
    Returns a list of location suggestions matching the query.
    Checks local hubs, states, typo aliases, and optionally external search services.
    """
    query = (query or "").strip()
    if not query or len(query) < 2:
        return []

    cache_key = query.lower()
    if cache_key in SUGGESTION_CACHE:
        return SUGGESTION_CACHE[cache_key]

    normalized = normalize_query(query)
    results = []
    seen = set()

    def add_result(name, display_name, lat, lon, loc_type="city"):
        key = f"{round(lat, 2)},{round(lon, 2)}"
        if key not in seen and len(results) < limit:
            seen.add(key)
            results.append({
                "name": name,
                "display_name": display_name,
                "latitude": float(lat),
                "longitude": float(lon),
                "type": loc_type
            })

    # 1. Check exact alias or hub matches
    for alias_key, target in TYPO_ALIASES.items():
        if alias_key.startswith(normalized) or normalized.startswith(alias_key):
            if target in FALLBACK_HUBS:
                hub = FALLBACK_HUBS[target]
                add_result(hub["name"], hub["address"], hub["latitude"], hub["longitude"], "city")
            elif target in STATE_HUBS:
                st = STATE_HUBS[target]
                add_result(st["name"], st["address"], st["latitude"], st["longitude"], "state")

    # 2. Check State Hubs
    for state_key, state_data in STATE_HUBS.items():
        if normalized in state_key or state_key.startswith(normalized):
            add_result(state_data["name"], state_data["address"], state_data["latitude"], state_data["longitude"], "state")

    # 3. Check City / Freight Hubs
    for hub_key, hub_data in FALLBACK_HUBS.items():
        if normalized in hub_key or hub_key.startswith(normalized) or normalized in hub_data["name"].lower():
            add_result(hub_data["name"], hub_data["address"], hub_data["latitude"], hub_data["longitude"], "city")

    # 4. If under limit, query live Photon or Nominatim search-as-you-type API
    if len(results) < limit and len(query) >= 3:
        try:
            # Photon (Fast OSM Autocomplete)
            photon_url = "https://photon.komoot.de/api/"
            params = {"q": query, "limit": limit, "lang": "en"}
            resp = requests.get(photon_url, params=params, timeout=2.5)
            if resp.status_code == 200:
                features = resp.json().get("features", [])
                for feat in features:
                    props = feat.get("properties", {})
                    coords = feat.get("geometry", {}).get("coordinates", [])
                    if coords and len(coords) == 2:
                        lon, lat = coords[0], coords[1]
                        name_parts = [props.get("name")]
                        if props.get("city") and props.get("city") != props.get("name"):
                            name_parts.append(props.get("city"))
                        if props.get("state"):
                            name_parts.append(props.get("state"))
                        if props.get("country"):
                            name_parts.append(props.get("country"))
                        
                        clean_name = ", ".join(filter(None, name_parts[:2]))
                        full_address = ", ".join(filter(None, name_parts))
                        add_result(clean_name or query, full_address or query, lat, lon, props.get("type", "address"))
        except Exception:
            pass  # Fall back gracefully to local results

    SUGGESTION_CACHE[cache_key] = results
    return results

def geocode_location(query: str) -> dict:
    query = (query or "").strip()
    if not query:
        raise ValueError("Location query cannot be empty.")

    clean_key = query.lower()
    normalized_key = normalize_query(clean_key)
    
    if clean_key in GEOCODE_CACHE:
        return GEOCODE_CACHE[clean_key]
    if normalized_key in GEOCODE_CACHE:
        return GEOCODE_CACHE[normalized_key]

    # Check state hubs
    if normalized_key in STATE_HUBS:
        st = STATE_HUBS[normalized_key]
        result = {
            "name": st["name"],
            "address": st["address"],
            "latitude": st["latitude"],
            "longitude": st["longitude"]
        }
        GEOCODE_CACHE[clean_key] = result
        return result

    # Try OpenStreetMap Nominatim with proper User-Agent
    user_agent = getattr(settings, 'NOMINATIM_USER_AGENT', 'ELDRoutePlanner/1.0')
    url = "https://nominatim.openstreetmap.org/search"
    headers = {
        "User-Agent": user_agent,
        "Accept": "application/json"
    }
    params = {
        "q": normalized_key,
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
        if hub_key in normalized_key or normalized_key in hub_key:
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
        part_norm = normalize_query(part)
        if part_norm in FALLBACK_HUBS:
            hub = FALLBACK_HUBS[part_norm]
            result = {
                "name": query,
                "address": f"{query} (approx. via {hub['name']})",
                "latitude": hub["latitude"],
                "longitude": hub["longitude"]
            }
            GEOCODE_CACHE[clean_key] = result
            return result
        if part_norm in STATE_HUBS:
            st = STATE_HUBS[part_norm]
            result = {
                "name": query,
                "address": st["address"],
                "latitude": st["latitude"],
                "longitude": st["longitude"]
            }
            GEOCODE_CACHE[clean_key] = result
            return result

    # Default coordinate if unrecognized to avoid total crash
    raise ValueError(f"Could not locate '{query}'. Please provide a recognized city or state (e.g., 'Chicago, IL', 'Dallas, TX').")
