import numpy as np
import googlemaps
import json
import urllib
from calories_counter import calories_burned
import copy

ELEVATION_BASE_URL = 'http://maps.google.com/maps/api/elevation/json'
CHART_BASE_URL = 'http://chart.googleapis.com/chart'


class GoogleApiAgent:
    def __init__(self):
        self.direction_client = googlemaps.Client(key="AIzaSyAZJdq8qUnEZu1lNJzCnULREHlEtKcBmUs")
        self.distance_client = googlemaps.Client(key="AIzaSyCUi-hY8wMw0O5LPBMzHWXueu0EIDI7AOQ")
        self.elevation_client = googlemaps.Client(key="AIzaSyCZ3XRqEk9Ib_sdFGUAOoWGlALRnepjmuY")
        self.sat_map_client = googlemaps.Client(key="AIzaSyAbGT3SnxSgrhAsqMJjiRcUcnbTlqmgJGY")

    def get_directions(self, json_data):
        return self.direction_client.directions(origin=json_data['origin'], destination=json_data['destination'],
                                                waypoints=json_data['waypoints'], mode=json_data['mode'])

    def get_distance_and_time(self, json_data):
        origins, destinations = [json_data['origin']], []
        n_points = 1
        distance = 0.0
        time = 0.0

        if 'waypoints' in json_data and json_data['waypoints'] is not None:
            for waypoint in json_data['waypoints']:
                destinations.append(waypoint)
                origins.append(waypoint)
                n_points += 1

        destinations.append(json_data['destination'])

        distance_matrix = self.distance_client.distance_matrix(origins=origins, destinations=destinations,
                                                               mode=json_data['mode'])
        for i in range(0, n_points):
            distance += distance_matrix['rows'][i]['elements'][i]['distance']['value']
            time += distance_matrix['rows'][i]['elements'][i]['duration']['value']

        return distance / 1000, time / 3600

    def get_elevation(self, json_data, distance):
        locations = [json_data['origin']]

        if 'waypoints' in json_data and json_data['waypoints'] is not None:
            for waypoint in json_data['waypoints']:
                locations.append(waypoint)

        locations.append(json_data['destination'])

        return self.elevation_client.elevation_along_path(path=locations, samples=100)

    def get_uphill_and_downhill(self, elevationArray):
        prev = elevationArray[0]
        uphill, downhill = 0, 0

        for x in elevationArray:
            elev = x - prev
            if elev > 0:
                uphill += elev
            else:
                downhill -= elev
            prev = x

        return uphill, downhill

    def get_generated_paths(self, json_data):
        paths = []
        waypoint = {"latitude": 0.0, 'longitude': 0.0}
        tolerance = 0.4
        m_in_degrees = 0.000001
        change_rate_in_m = 100
        origin = json_data['origin']
        destination = json_data['destination']
        calories = json_data['calories']
        distance = json_data['distance']

        path_data = {'origin': json_data['origin'],
                     'destination': json_data['destination'],
                     'waypoints': None,
                     'mode': json_data['mode']}

        initial_path = self.get_path_info(path_data)

        ori = [origin['latitude'], origin['longitude']]
        dest = [destination['latitude'], destination['longitude']]
        midpoint = [(ori[0] + dest[0]) / 2, (ori[1] + dest[1]) / 2]
        mul = 1.0

        # znalezenie prostej prosotpadłej
        y_diff = ori[0] - dest[0]
        x_diff = ori[1] - dest[1]
        a = y_diff / x_diff
        a = -1 / a
        b = midpoint[0] - a * midpoint[1]

        for i in range(0, 2):
            val = np.random.uniform(min(ori[1], dest[1]), max(ori[1], dest[1]))
            waypoint['longitude'] = val
            waypoint["latitude"] = a * waypoint['longitude'] + b

            path_data['waypoints'] = [waypoint]
            path = self.get_path_info(path_data)

            calories_difference = calories - path['calories']
            distance_difference = distance - path['distance']

            n_iteration = 0
            while ((calories_difference / calories < tolerance or distance_difference / distance < tolerance)
                   and n_iteration) < 2:
                waypoint['longitude'] += max(abs((1 - path['calories'] / calories)),
                                             abs((1 - path[
                                                 'distance'] / distance))) * change_rate_in_m * m_in_degrees * mul
                waypoint["latitude"] = a * waypoint['longitude'] + b

                path_data['waypoints'] = [waypoint]
                path = self.get_path_info(path_data)

                calories_difference = calories - path['calories']
                distance_difference = distance - path['distance']

                n_iteration += 1

            mul = mul * -1
            data_copy = copy.deepcopy(path_data)
            paths.append({"path": data_copy, "info": path})

        return paths

    def get_path_info(self, json_data):
        distance, time = self.get_distance_and_time(json_data)
        elevation = self.get_elevation(json_data, distance)

        elevationArray = []

        for resultset in elevation:
            elevationArray.append(resultset['elevation'])

        uphill, downhill = self.get_uphill_and_downhill(elevationArray)

        chartURL = self.getChart(chartData=elevationArray)

        calories = calories_burned(uphill_in_km=uphill, distance_in_km=distance, time_in_h=time,
                                   activity=json_data['mode'], weight_in_kg=80)

        return {"calories": calories, "chart": chartURL, "time": time, "distance": distance}

    def getChart(self, chartData, chartDataScaling="-10,30", chartType="lc", chartLabel="Elevation in Meters",
                 chartSize="500x160", chartColor="blue", **chart_args):
        chart_args.update({
            'cht': chartType,
            'chs': chartSize,
            'chl': chartLabel,
            'chco': chartColor,
            'chds': chartDataScaling,
            'chxt': 'x,y',
            'chxr': '1,-10,30'
        })

        dataString = 't:' + ','.join(str(x) for x in chartData)
        chart_args['chd'] = dataString.strip(',')

        chartUrl = CHART_BASE_URL + '?' + urllib.parse.urlencode(chart_args)

        return chartUrl

    def getGoogleMapsUrl(self, json_data):
        origin = json_data['origin']
        destination = json_data['destination']
        waypoint = json_data['waypoints'][0]

        url = "www.google.com/maps/dir/" + str(origin['latitude']) + "," + str(origin['longitude']) + "/" + \
              str(waypoint['latitude']) + "," + str(waypoint['longitude']) + "/" + str(destination['latitude']) + ","\
              + str(destination['longitude']) + "/@15z/data=!4m2!4m1!3e2"

        return url