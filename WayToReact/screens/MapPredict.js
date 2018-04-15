import React, {Component} from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    Callout,
    TextInput,
    View, Button,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps'; // 0.21.0
import RadioButton from 'react-native-radio-buttons'
import Lightbox from 'react-native-lightbox';
import  CheckBox from 'react-native-checkbox';


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
        beton: false,
        piasek: false,
        lesnaSciezka: false,
        kalorie: 0,
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

    setBetonStatus(e) {
        console.log(setBetonStatus);
        this.setState({
            beton: e
        })
    }

    setPiachStatus(e) {
        console.log(setPiachStatus);
        this.setState({
            beton: e
        })
    }

    setLasStatus(e) {
        console.log(setLasStatus);
        console.log(e);
        this.setState({
            beton: e
        })
    }

    render() {
        const beforeMap = (
            <View>
                <TextInput
                    style={styles.input}
                    underlineColorAndroid="transparent"
                    placeholder="Podaj ilość kalori"
                    placeholderTextColor="#9a73ef"
                    autoCapitalize="none"
                    keyboardType='numeric'
                    value={this.state.kalorie}
                    maxLength={3}  //setting limit of input
                />
                <View>
                    <Text>Wybierz rodzaj podłoża</Text>
                    <CheckBox  label="Beton" checked={this.state.beton} onPress={(() => this.setState({beton: !this.state.beton}))}/>
                    <CheckBox label="Piach" checked={this.state.piasek} onPress={(() => this.setState({piasek: !this.state.piasek}))}/>
                    <CheckBox label="Leśna" checked={this.state.lesnaSciezka} onPress={(() => this.setState({lesnaSciezka: !this.state.lesnaSciezka}))}/>
                </View>
            </View>
        )

        const chart = this.state.chartPath ? (
            <Lightbox>
                <Image
                    style={{
                        flexDirection: 'row',
                        resizeMode: 'stretch',
                        height: 150,
                        width: null
                    }}
                    source={{uri: this.state.chartPath}}
                />
            </Lightbox>
        ) : (null);


        // const mapView = (
        //     <View>
        //         <MapView
        //             style={styles.map}
        //             region={this.state.mapRegion}
        //             provider={PROVIDER_GOOGLE}
        //             showsUserLocation={true}
        //             followUserLocation={true}
        //             onLongPress={(e) => this.onMapPress(e)}>
        //             {this.state.markers.map(marker => (
        //                 <MapView.Marker
        //                     key={marker.key}
        //                     coordinate={marker.coordinate}
        //                 >
        //                 </MapView.Marker>
        //             ))}
        //         </MapView>
        //         <View flex="end">
        //             <View style={{backgroundColor: 'white'}}>
        //                 <Text color='red'>Kalorie: {this.state.calories}</Text>
        //                 <Text color='red'>Czas ( minuty ): {Math.round(this.state.time * 60)}</Text>
        //                 <Text color='red'>Odległośc ( km ): {this.state.distance}</Text>
        //                 {chart}
        //             </View>
        //             <View>
        //                 <Button title='Wyczyść mapę' color="#841584" onPress={() => this.deleteMarkers()}/>
        //             </View>
        //         </View>
        //     </View>
        // );

        return (
            <View style={{flex: 1}}>
                {beforeMap}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 23
    },
    input: {
        margin: 15,
        height: 40,
        borderColor: '#7a42f4',
        borderWidth: 1
    },
    submitButton: {
        backgroundColor: '#7a42f4',
        padding: 10,
        margin: 15,
        height: 40,
    },
    submitButtonText: {
        color: 'white'
    }
})