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


export default class MapPredict extends Component {
    static navigationOptions = {
        title: 'GeneratorMap',
    };
    state = {
        mapRegion: null,
        markers: [],
        startMarkerSet: false,
        endMarkerSet: false,
        distance: 0,
        calories: 0,
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


        render() {

        let getMapsButton

            return (
                <View style={{flex: 1}}>
                    <MapView
                        style={styles.map}
                        region={this.state.mapRegion}
                        provider={PROVIDER_GOOGLE}
                        showsUserLocation={true}
                        followUserLocation={true}
                        onLongPress={this.onMapPress.bind(this)}>
                        {this.state.markers.map(marker => (
                            <MapView.Marker
                                key={marker.key}
                                coordinate={marker.coordinate}
                            >
                            </MapView.Marker>
                        ))}

                        <Button title='Wyczyść mapę' onPress={this.deleteMarkers.bind(this)}/>

                        {path}
                        <Text color='red'>Kalorie: {this.state.calories}</Text>
                    </MapView>
                </View>
            );
        }
}