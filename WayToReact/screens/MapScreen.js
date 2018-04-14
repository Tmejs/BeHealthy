import React, { Component } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    Callout,
    TextInput,
    View, Button
} from 'react-native';
import MapView,{PROVIDER_GOOGLE} from 'react-native-maps'; // 0.21.0

export default class MapScreen extends Component {
    state = {
        mapRegion: null,
        lastLat: null,
        lastLong: null,
        startMarker: null,
        endMarker: null,
    }

    renderCallout(marker) {
        return (
            <MapView.Callout tooltip>
                <View>
                    <Text>Marker</Text>
                </View>
            </MapView.Callout>
        );
    }

    componentDidMount() {
        this.watchID = navigator.geolocation.watchPosition((position) => {
            // Create the object to update this.state.mapRegion through the onRegionChange function
            let region = {
                latitude:       position.coords.latitude,
                longitude:      position.coords.longitude,
                latitudeDelta:  0.00922*1.5,
                longitudeDelta: 0.00421*1.5
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


    async getDirections(startLoc, destinationLoc) {
        try {
            let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${ startLoc }&destination=${ destinationLoc }`)
            let respJson = await resp.json();
            let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
            let coords = points.map((point, index) => {
                return  {
                    latitude : point[0],
                    longitude : point[1]
                }
            })
            this.setState({coords: coords})
            return coords
        } catch(error) {
            return error
        }
    }

    clearStartMarker(){
        setState({
            startMarker: null,
        });
    }
    addEndMarker(e){
        let region = {
            latitude:       e.nativeEvent.coordinate.latitude,
            longitude:      e.nativeEvent.coordinate.longitude,
            latitudeDelta:  0.00922*1.5,
            longitudeDelta: 0.00421*1.5
        }

        let marker = {
            title:'EndMarker',
            latitude:       e.nativeEvent.coordinate.latitude,
            longitude:      e.nativeEvent.coordinate.longitude,
        };

        this.setState({
            endMarker: marker,
        });
    }

    addStartMarker(e){
        let region = {
            latitude:       e.nativeEvent.coordinate.latitude,
            longitude:      e.nativeEvent.coordinate.longitude,
            latitudeDelta:  0.00922*1.5,
            longitudeDelta: 0.00421*1.5
        }

        let marker = {
            title:'StartMarker',
            latitude:       e.nativeEvent.coordinate.latitude,
            longitude:      e.nativeEvent.coordinate.longitude,
        };
        this.setState({
            startMarker: marker,
        });
    }

    addMidMarker(e){
        let region = {
            latitude:       e.nativeEvent.coordinate.latitude,
            longitude:      e.nativeEvent.coordinate.longitude,
            latitudeDelta:  0.00922*1.5,
            longitudeDelta: 0.00421*1.5
        }

        let marker = {
            title:'MidMarker',
            latitude:       e.nativeEvent.coordinate.latitude,
            longitude:      e.nativeEvent.coordinate.longitude,
        };
    }

    onMapPress(e) {
        Alert.alert(
            'Wybierz punkt',
            '',
            [
                {text: 'Punkt poczatkowy', onPress: this.addStartMarker(e)},
                {text: 'Punkt koncowy', onPress: this.addEndMarker(e)},
                {text: 'Punkt posredni', onPress: this.addMidMarker(e)},
                {text: 'Anuluj',onPress:()=>{},style: 'cancel'},
            ],
            { cancelable: true }
        );
    }


    render() {
        return (
            <View style={{flex: 1}}>
                <MapView
                    style={styles.map}
                    region={this.state.mapRegion}
                    provider ={PROVIDER_GOOGLE}
                    showsUserLocation={true}
                    followUserLocation={true}
                    onRegionChange={this.onRegionChange.bind(this)}
                    onLongPress={this.onMapPress.bind(this)}>
                    {/*Markerk poczatku trasy*/}exp
                    renderIf({this.state.startMarker!=null}){
                        <MapView.Marker
                            coordinate = {this.state.startMarker}
                            title='Start'
                        >
                            <MapView.Callout>
                                <Text
                                    onPress={this.clearStartMarker}
                                    title='Usuń punkt początkowy'
                                >Usuń punkt początkowy
                                </Text>
                            </MapView.Callout>
                        </MapView.Marker>
                    }

                    {/*MarkerKoncaTrasy*/}
                    renderIf({this.state.endMarker!=null}){
                    <MapView.Marker
                        coordinate = {this.state.endMarker}
                        title='Start'
                    >
                        <MapView.Callout>
                            <Text
                                onPress={this.clearStartMarker}
                                title='Usuń punkt Końcowy'
                            >Usuń punkt początkowy
                            </Text>
                        </MapView.Callout>
                    </MapView.Marker>
                }
                </MapView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    inputView: {
        backgroundColor: 'rgba(0,0,0,0)',
        position: 'absolute',
        top: 0,
        left: 5,
        right: 5
    },
    input: {
        height: 36,
        padding: 10,
        marginTop: 20,
        marginLeft: 10,
        marginRight: 10,
        fontSize: 18,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#48BBEC',
        backgroundColor: 'white',
    }
});