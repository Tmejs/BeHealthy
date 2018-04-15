import React, {Component} from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    Callout,
    View, Button,Modal,Image
} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps'; // 0.21.0
import MapViewDirections from 'react-native-maps-directions';
import ImagePreview from 'react-native-image-preview';

let id = 0;


export default class MapScreen extends Component {
    static navigationOptions = {
        title: 'Mapa',
    };
    state = {
        mapRegion: null,
        markers: [],
        startMarkerSet: false,
        endMarkerSet: false,
        distance: 0,
        calories: 0,
        distance: 0,
        downloaded: false,
        modalVisible: false,
        chartPath: null,
        imagePredictVisible:false,
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
        });
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
                ...this.state.markers,
                {
                    coordinate: e.nativeEvent.coordinate,
                    key: `foo${id++}`,
                },

            ],
        });
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
                        text: 'Anuluj', onPress: () => {
                        }, style: 'cancel'
                    },
                ],
                {cancelable: true}
            );
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
                        text: 'Anuluj', onPress: () => {
                        }, style: 'cancel'
                    },
                ],
                {cancelable: true}
            );
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
                        text: 'Anuluj', onPress: () => {
                        }, style: 'cancel'
                    },
                ],
                {cancelable: true}
            );
        }

    }


    deleteMarkers() {
        this.setState({
            markers: [],
            startMarkerSet: false,
            endMarkerSet: false,
            distance: 0,
            calories: 0,
            time: 0,
            downloaded: false,
            chartPath: null,
        });
    }

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
        fetch('http://10.239.232.137:8080', {
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
        }).then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    calories: Math.round(responseJson.calories),
                    time: responseJson.time,
                    distance: responseJson.distance,
                    chartPath: responseJson.chart,
                })

            })
            .catch((error) => {
                console.error(error);
            });
    }

    markerDragEnd(e) {
        console.log('markerDragStart');
        e.persist();
        console.log(e);
    }

    onRegionChange(newRegion) {
        this.setState({
            mapRegion: newRegion
        });
    }

    render() {
        const path = this.state.endMarkerSet ? (
            <MapViewDirections
                origin={this.getLnGt(this.state.markers[0])}
                destination={this.getLnGt(this.state.markers[1])}
                waypoints={this.getLnGtFromWaypoint(this.state.markers)}
                apikey='AIzaSyAZJdq8qUnEZu1lNJzCnULREHlEtKcBmUs'
                mode='walking'
                strokeWidth={2}
                strokeColor="hotPink"
            >
            </MapViewDirections>
        ) : (null);



        const chart = this.state.chartPath ? (
            <ImagePreview visible={this.state.imagePredictVisible} source={this.state.chartPath} close={this.setState({imagePredictVisible :false})} />
        ) : (null);

        if (path != null) {
            if (!this.state.downloaded) {
                this.getCalories();
                this.setState({
                    downloaded: true,
                })
            }
        }

        return (
            <View style={{flex: 1}}>
                    <MapView
                        style={styles.map}
                        region={this.state.mapRegion}
                        // onRegionChange={this.onRegionChange.bind(this)}
                        provider={PROVIDER_GOOGLE}
                        showsUserLocation={true}
                        onLongPress={this.onMapPress.bind(this)}>
                        {this.state.markers.map(marker => (
                            <MapView.Marker
                                key={marker.key}
                                coordinate={marker.coordinate}
                            >
                            </MapView.Marker>
                        ))}

                        <Button title='Wyczyść mapę' onPress={this.deleteMarkers.bind(this)}/>
                        {/*<Button style ="abut"  title='Wyznacz trasę' onPress={} align='bottom'/>*/}
                        {path}
                        <Text color='red'>Kalorie: {this.state.calories}</Text>
                        <Text color='red'>Czas (minuty): {Math.round(this.state.time * 60)}</Text>
                        <Text color='red'>Odległośc (metry): {this.state.distance}</Text>
                        {chart}
                    </MapView>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    abut: {
        flex: 1,
    },
    chart:{
        flex:1,
    }
});