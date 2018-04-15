import React, {Component} from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    Image,
    TextInput,
    View, Button,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps'; // 0.21.0
import Lightbox from 'react-native-lightbox';
import CheckBox from 'react-native-checkbox';
import MapViewDirections from 'react-native-maps-directions';

let id = 0;
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
        time: 0,
        beton: false,
        piasek: false,
        lesnaSciezka: false,
        kalorie: 300,
        mapVisible: false,
        distanceTo:5,
        isDownloaded: false,
        firstTrace:null,
        secondTrace:null,
        chartPath: null,
        imagePredictVisible: false,
        idInMap:0,

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

        this.setState({
            beton: !e
        })
    }

    setPiachStatus(e) {

        this.setState({
            piasek: !e
        })
    }

    setLasStatus(e) {
        this.setState({
            lesnaSciezka: !e
        })

        console.log(this.state.lesnaSciezka)
    }


    addStartMarker(e) {
        this.setState({
            markers: [
                {
                    coordinate: e.nativeEvent.coordinate,
                    key: `foo${id++}`,
                },
            ],
            startMarkerSet: true,
            downloaded: false,
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
            downloaded: false,
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
    }

    showMap() {
        this.setState({
            mapVisible: true,
        })
        ;
    }

    hideMap() {
        this.setState({
            mapVisible: false,
        })
        ;
    }

    setTraceInParams(trace){
        console.log(trace);
        let waypointArray=[];
        for(var x in trace.path.waypoints){
            console.log(x);
            waypointArray.push({
                key: `foo${id++}`,
                coordinate:{
                        latitude: x.latitude,
                        longitude: x.longitude,
                }
            });
        }
        this.setState({
            calories:Math.round(trace.info.calories),
            isDownloaded:true,
            chartPath: trace.info.chart,
            time:trace.info.time,
            distance:trace.info.distance,
            markers: [
                {
                    key: `foo${id++}`,
                    coordinate:{
                        latitude:trace.path.origin.latitude,
                        longitude:trace.path.origin.longitude,
                    }

                },
                {
                    key: `foo${id++}`,
                    coordinate:{
                        latitude:trace.path.destination.latitude,
                        longitude:trace.path.destination.longitude,
                    }
                },
                {
                    key: `foo${id++}`,
                    coordinate:{
                        latitude:trace.path.waypoints[0].latitude,
                        longitude:trace.path.waypoints[0].longitude,
                    }
                },
            ],
        });
    console.log("afterSetState");

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

    generateRoute() {
        fetch('http://10.239.232.137:8080', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: 'paths',
                origin: this.getLnGt(this.state.markers[0]),
                destination: this.getLnGt(this.state.markers[1]),
                mode: 'walking',
                calories:parseInt(this.state.kalorie),
                distance:parseInt(this.state.distanceTo),
                osoba: {
                    sex: "M",
                    weight: 80,
                    age: 35,
                    activity: 'Bieg',
                },
            })
        }).then((response) => response.json())
            .then((responseJson) => {
                let arr=[];
                for(var x in responseJson){
                    arr.push(responseJson[x]);
                }
                this.setState({firstTrace:arr[0]});
                this.setState({secondTrace:arr[1]});
                this.setTraceInParams(arr[0]);

                this.setState({idInMap:0});
                })
            .catch((error) => {
                console.error(error);
            });
    }


    getLnGt(marker) {
        return {
            latitude: marker.coordinate.latitude,
            longitude: marker.coordinate.longitude
        };
    }


    changeMap(){
        if(this.state.idInMap===0){
            this.setTraceInParams(this.state.secondTrace);
            this.setState({
                idInMap:1,
            });
        }else{
            this.setTraceInParams(this.state.firstTrace);
            this.setState({
                idInMap:0,
            });
        }
    }

    render() {
        const beforeMap = (
            <View>
                <Text>Podaj ilość kalorii które chcesz spalić</Text>
                <TextInput
                    style={styles.input}
                    underlineColorAndroid="transparent"
                    placeholder="Podaj ilość kalori"
                    placeholderTextColor="#9a73ef"
                    autoCapitalize="none"
                    keyboardType='numeric'
                    value={this.state.kalorie.toString()}
                    onChangeText={(text) => this.setState({kalorie: text})}
                    maxLength={3}  //setting limit of input
                /><Text>Podaj ilość kilometrów którą chcesz przejść</Text><TextInput
                style={styles.input}
                underlineColorAndroid="transparent"
                placeholder="Podaj ilość kilometrów którą chcesz"
                placeholderTextColor="#9a73ef"
                autoCapitalize="none"
                keyboardType='numeric'
                value={this.state.distanceTo.toString()}
                onChangeText={(text) => this.setState({distanceTo: text})}
                maxLength={3}  //setting limit of input
            />
                <View>
                    <Text>Wybierz rodzaj podłoża</Text>
                    <CheckBox label="Beton" checked={this.state.beton} onChange={(e) => this.setBetonStatus(e)}/>
                    <CheckBox label="Piach" checked={this.state.piasek} onChange={(e) => this.setPiachStatus(e)}/>
                    <CheckBox label="Leśna" checked={this.state.lesnaSciezka} onChange={(e) => this.setLasStatus(e)}/>
                </View>
                <View>
                    <Button title='Mapa' onPress={() => this.showMap()} align='bottom'/>
                </View>
            </View>
        )

        const path = this.state.isDownloaded ? (
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


        let textLabel = null;
        if (this.state.markers[0] == null || this.state.markers[1] == null) {
            textLabel = (
                <Text>
                    Wybierz punkt początkowy i końcowy
                </Text>
            )
        } else {
            if (this.state.kalorie != null && this.state.kalorie > 0) {
                textLabel = (
                    <Button title='Generuj trasę na podstawie danych' onPress={() => this.generateRoute()}
                            align='bottom'/>
                )
            }
        }

        const mapView = (
            <View style={styles.map}>
                <MapView
                    style={styles.map}
                    region={this.state.mapRegion}
                    provider={PROVIDER_GOOGLE}
                    showsUserLocation={true}
                    followUserLocation={true}
                    onLongPress={(e) => this.onMapPress(e)}>
                    {this.state.markers.map(marker => (
                        <MapView.Marker
                            key={marker.key}
                            coordinate={marker.coordinate}
                        >
                        </MapView.Marker>
                    ))}
                    {path}
                </MapView>
                <View flex="end">
                    <View style={{backgroundColor: 'white'}}>
                        <Text color='red'>Kalorie: {this.state.calories}</Text>
                        <Text color='red'>Czas ( minuty ): {Math.round(this.state.time * 60)}</Text>
                        <Text color='red'>Odległośc ( km ): {this.state.distance}</Text>
                        renderIF<Button title='Zmień trasę' onPress={()=>this.changeMap()} align='bottom'/>

                    </View>
                </View>
                {chart}
                <View>
                    <Button title='Ustawienia' onPress={() => this.hideMap()} align='bottom'/>
                    {textLabel}
                </View>
            </View>
        );

        let view;

        if (this.state.mapVisible) {
            view = (
                mapView
            )
        } else {
            view = (beforeMap)
        }
        ;


        return (
            <View style={{flex: 1}}>
                {view}
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
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
})