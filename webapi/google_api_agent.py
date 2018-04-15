import googlemaps
import json
import urllib

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

    def get_distance(self, json_data):
        origins, destinations = [json_data['origin']], []
        n_points = 1
        distance = 0

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

        return distance

    def get_elevation(self, json_data, distance):
        locations = [json_data['origin']]

        if 'waypoints' in json_data and json_data['waypoints'] is not None:
            for waypoint in json_data['waypoints']:
                locations.append(waypoint)

        locations.append(json_data['destination'])

        return self.elevation_client.elevation_along_path(path=locations, samples=100)

    def getChart(chartData, chartDataScaling="-500,5000", chartType="lc", chartLabel="Elevation in Meters",
                 chartSize="500x160", chartColor="orange", **chart_args):


        chart_args.update({
            'cht': chartType,
            'chs': chartSize,
            'chl': chartLabel,
            'chco': chartColor,
            'chds': chartDataScaling,
            'chxt': 'x,y',
            'chxr': '1,-500,5000'
        })

        dataString = 't:' + ','.join(str(x) for x in chartData)
        chart_args['chd'] = dataString.strip(',')

        chartUrl = CHART_BASE_URL + '?' + urllib.urlencode(chart_args)

        print("")
        print("Elevation Chart URL:")
        print("")
        print(chartUrl)


