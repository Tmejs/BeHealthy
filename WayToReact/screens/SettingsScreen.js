import React from 'react';
import {ExpoConfigView} from '@expo/samples';
import {Text, View, AsyncStorage, ScrollView, TextInput, StyleSheet} from "react-native";
import RadioButtons from 'react-native-radio-buttons'
import {SegmentedControls} from 'react-native-radio-buttons'
import '../global.js'

export default class SettingsScreen extends React.Component {
    static navigationOptions = {
        title: 'Ustawienia',
    };
    state = {
        sex: null,
        weight: 0,
        age: 0,
        activity: null,
    };



    static getOsoba() {
        console.log("getOsoba");
        let osoba= {
            sex: this.state.sex,
            weight: this.state.weight,
            age: this.state.age,
            activity: this.state.activity,
        };
    }


    setSex(gender) {
        this.setState({
            sex: {gender},
        })
    }

    render() {

        global.osoba = this.getOsoba();
        const options = [
            "Mezczyzna",
            "Kobieta"
        ];

        const activityOptions = [
            "Bieg",
            "Spacer"
        ];


        function setSelectedOption(selectedOption) {
            this.setState({
                sex: selectedOption
            });
        }

        function setSelectedTreningOption(selectedOption) {
            this.setState({
                activity: selectedOption
            });
        }

        function onNumericWeightTextChanged(text) {
            let newText = '';
            let numbers = '0123456789';

            for (var i = 0; i < text.length; i++) {
                if (numbers.indexOf(text[i]) > -1) {
                    newText = newText + text[i];
                }
                else {
                    // your call back function
                    alert("please enter numbers only");
                }
            }
            this.setState({weight: newText});
        }

        function onNumericAgeTextChanged(text) {
            let newText = '';
            let numbers = '0123456789';

            for (var i = 0; i < text.length; i++) {
                if (numbers.indexOf(text[i]) > -1) {
                    newText = newText + text[i];
                }
                else {
                    // your call back function
                    alert("please enter numbers only");
                }
            }
            this.setState({weight: newText});
        }

        return (<View>
            {/*waga,wiek,plec,rodzaj aktywności*/}
            <ScrollView>
                <View style={{margin: 20}}>
                    <Text>Wybierz płec</Text>
                    <SegmentedControls
                        options={options}
                        onSelection={setSelectedOption.bind(this)}
                        selectedOption={this.state.sex}
                    />
                </View>

                <View style={{margin: 20}}>
                    <Text>Wybierz rodzaj treningu</Text>
                    <SegmentedControls
                        options={activityOptions}
                        onSelection={setSelectedTreningOption.bind(this)}
                        selectedOption={this.state.activity}
                    />
                </View>
                <View style={{margin: 20}}>
                    <Text>Wiek</Text>
                    <TextInput
                        style={styles.input}
                        underlineColorAndroid="transparent"
                        placeholder="Waga"
                        placeholderTextColor="#9a73ef"
                        autoCapitalize="none"
                        keyboardType='numeric'
                        value={this.state.weight.toString()}
                        maxLength={3}  //setting limit of input
                    />
                </View>
                <View style={{margin: 20}}>
                    <Text>Waga</Text>
                    <TextInput
                        style={styles.input}
                        underlineColorAndroid="transparent"
                        placeholder="Wiek"
                        placeholderTextColor="#9a73ef"
                        autoCapitalize="none"
                        keyboardType='numeric'
                        value={this.state.age.toString()}
                        maxLength={3}  //setting limit of input
                    />
                </View>
                <View style={{margin: 20}}>
                    <Text>Wybierz rodzaj treningu</Text>
                    <SegmentedControls
                        options={activityOptions}
                        onSelection={setSelectedTreningOption.bind(this)}
                        selectedOption={this.state.activity}
                    />
                </View>
                <View>

                </View>
            </ScrollView>
        </View>);
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

