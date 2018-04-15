from http.server import BaseHTTPRequestHandler, HTTPServer
from calories_counter import calories_burned
from google_api_agent import GoogleApiAgent
import json


class Server(BaseHTTPRequestHandler):
    def __init__(self, request, client_address, server):
        self.googleAgent = GoogleApiAgent()
        super().__init__(request, client_address, server)


    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    def do_GET(self):
        self._set_headers()
        self.wfile.write(str.encode("<html><body><h1>hi!</h1></body></html>"))

    def do_HEAD(self):
        self._set_headers()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])  # <--- Gets the size of data
        post_data = self.rfile.read(content_length)  # <--- Gets the data itself
        response = "Zwrotka"
        try:
            print(post_data.decode())
            json_data = json.loads(post_data.decode())
            distance, time = self.googleAgent.get_distance_and_time(json_data)
            elevation = self.googleAgent.get_elevation(json_data, distance)

            elevationArray = []

            for resultset in elevation:
                elevationArray.append(resultset['elevation'])

            uphill, downhill = self.googleAgent.get_uphill_and_downhill(elevationArray)

            chartURL = self.googleAgent.getChart(chartData=elevationArray)

            calories = calories_burned(uphill_in_km=uphill, distance_in_km=distance, time_in_h=time,
                                       activity=json_data['mode'], weight_in_kg=80)

            response = {"calories": calories, "chart": chartURL, "time": time}

        except json.decoder.JSONDecodeError:
            response = "Blad konwersji JSON"

        print(response)
        self._set_headers()
        self.wfile.write(str.encode(json.dumps(response) + '\n'))


def run(server_class=HTTPServer, handler_class=Server, port=80):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()


if __name__ == "__main__":
    run(port=8080)
