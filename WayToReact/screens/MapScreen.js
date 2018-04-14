import React, {Component} from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    Callout,
    TextInput,
    View, Button
} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps'; // 0.21.0
import MapViewDirections from 'react-native-maps-directions';

let id = 0;


export default class MapScreen extends Component {
    state = {
        mapRegion: null,
        markers: [],
        startMarkerSet: false,
        endMarkerSet: false,
        distance: 0,
    };


    componentDidMount() {
        this.watchID = navigator.geolocation.watchPosition((position) => {
            // Create the object to update this.state.mapRegion through the onRegionChange function
            let region = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: 0.00922 * 1.5,
                longitudeDelta: 0.00421 * 1.5
            }

            this.onRegionChange(region, region.latitude, region.longitude);
    })
    }

    onRegionChange(region, lastLat, lastLong) {
        this.setState({
            mapRegion: region,
            // If there are no new values set use the the current ones
            lastLat: lastLat || this.state.lastLat,
            lastLong: lastLong || this.state.lastLong
        });
    }

    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchID);
    }


    addMidPoint(e) {
        this.setState({
            markers: [
                ...this.state.markers,;
                {
                    e.nativeEvent.coordinate,
                    key;: `foo${id++}`,
                },

            ],
    })
    }

    addStartMarker(e) {
        this.setState({
            markers: [
                {
                    coordinate: e.nativeEvent.coordinate,
                    key: `foo${id++}`,
                },
                {
                    coordinate: e.nativeEvent.coordinate,
                    key: `foo${id++}`,
                },
            ],
            startMarkerSet: true,
        });
    }


    addEndMarker(e) {
        this.setState({
            markers: [
                this.state.markers[0],
                {
                    coordinate: e.nativeEvent.coordinate,
                    key: `foo${id++}`,
                },

            ],
            endMarkerSet: true,
        });
    }


    deleteMarker(marker) {


    }


    onMapPress(e) {
        e.persist();

        if (!this.state.startMarkerSet) {
            Alert.alert(
                'Wybierz punkt',
                '',
                [
                    {
                        text: 'Punkt poczatkowy', onPress: () => {
                            this.addStartMarker(e)
                        }
                    },
                    {
                        'Anuluj', onPress;: () =;> {
                        }, 'cancel'
                    },
                ],
                {true}
        )
        }
        else if (!this.state.endMarkerSet) {
            Alert.alert(
                'Wybierz punkt',
                '',
                [
                    {
                        text: 'Punkt koncowy', onPress: () => {
                            this.addEndMarker(e)
                        }
                    },
                    {
                        'Anuluj', onPress;: () =;> {
                        }, 'cancel'
                    },
                ],
                {true}
        )
        }
        else if (this.state.endMarkerSet && this.state.startMarkerSet) {
            Alert.alert(
                'Wybierz punkt',
                '',
                [
                    {
                        text: 'Punkt przez', onPress: () => {
                            this.addMidPoint(e)
                        }
                    },
                    {
                        'Anuluj', onPress;: () =;> {
                        }, 'cancel'
                    },
                ],
                {true}
        )
        }

    }


    deleteMarkers() {
        this.setState({
            markers: [],
            startMarkerSet: false,
            endMarkerSet: false,
        });
    }


    // findRoute(){
    //     let startPoint = this.state.markers[0];
    //     let endPoint=this.state.markers[1];
    //
    //
    //     .get(
    //         {
    //             origin: startPoint.latitude.toString()+","+startPoint.longitude.toString(),
    //             destination: endPoint.latitude.toString()+","+endPoint.longitude.toString(),
    //         },
    //         function(err, data) {
    //             if (err) return console.log(err);
    //             console.log(data);
    //         });
    //
    //     // let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startPoint}&destination=${endPoint}&key=AIzaSyAZJdq8qUnEZu1lNJzCnULREHlEtKcBmUs&mode=walking`;
    //     //
    //     //
    //     // fetch(url)
    //     //     .then(response => response.json())
    //     //     .then(responseJson => {
    //     //
    //     //         if (responseJson.routes.length) {
    //     //             this.setState({
    //     //                 coords: this.decode(responseJson.routes[0].overview_polyline.points) // definition below
    //     //             });
    //     //         }
    //     //     }).catch(e => {console.warn(e)});
    //
    // }

    getLnGt(marker) {
        return {
            latitude: marker.coordinate.latitude,
            longitude: marker.coordinate.longitude
        };
    }

    getLnGtFromWaypoint(markers) {
        let list = [];

        if (markers.length > 2) {
            for (var i = 2; i < markers.length; i++) {
                list.push(this.getLnGt(markers[i]));
            }
        }
        if (list.length > 0)
            return list;
        else
            return null;
    }


    setDistance(value) {
        this.setState({
            distance: value
        })
    }

    getCalories() {
        fetch('http://10.239.232.138:8080', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                origin: this.getLnGt(this.state.markers[0]),
                destination: this.getLnGt(this.state.markers[1]),
                waypoints: this.getLnGtFromWaypoint(this.state.markers),
                mode: 'walking'
            })
        });
    }

    render() {
        const path = this.state.endMarkerSet ? (
            <MapViewDirections
                origin={this.getLnGt(this.state.markers[0])}
                destination={this.getLnGt(this.state.markers[1])}
                waypoints={this.getLnGtFromWaypoint(this.state.markers)}
                apikey='AIzaSyAZJdq8qUnEZu1lNJzCnULREHlEtKcBmUs';
                mode='walking'
            >
            </MapViewDirections>;
        ) : (null);

        let calories;

        if (path != null) {
            calories=this.getCalories();
        }

        return (
            <View; style={;{1}}>
                <MapView;
                    style={styles.map}
                    region={this.state.mapRegion}
                    provider={PROVIDER_GOOGLE};
                    showsUserLocation={true};
                    followUserLocation={true};
                    onLongPress={this.onMapPress.bind(this)}>
                    {this.state.markers.map(marker => (
                        <MapView.Marker;
                            key={marker.key}
                            coordinate={marker.coordinate}
                            draggable
                        >
                            <MapView.Callout>
                                <Text; onPress={this.deleteMarker(marker)}>
                                    Usun; marker
                                </Text>
                            </MapView.Callout>
                        </MapView.Marker>;
                    ))}

                    <Button; title='Wyczyść mapę'; onPress={this.deleteMarkers.bind(this)}/>
                    {/*<Button style ="abut"  title='Wyznacz trasę' onPress={} align='bottom'/>*/}
                    {path}
                    <Text>Kalorie;: {calories}</Text>
                </MapView>
            </View>;
    )
    }
}

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    abut;: {
        1,
    }
})