import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import { ActivityIndicator, ScrollView, Switch, Platform, Text, TextInput, View, SafeAreaView, Pressable, FlatList, Alert, StyleSheet } from 'react-native';
import Firebase from '../firebase';
import { applyActionCode, getAuth, signInAnonymously } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Picker } from '@react-native-picker/picker';

import { styledark, stylelight } from '../Styles'
import { Context } from '../App';
import List from './List';
import Login from './Login'
import Mainweb from './Mainweb';
import Main from './Main';
import languages from '../languages.json'

function Settings({ navigation }) {
    const {
        width, height,
        locallist, setlocallist,
        localfiles, setlocalfiles,
        savedfiles, setsavedfiles,
        getData,
        isLoading, setIsLoading,
        user, setUser,
        auth,
        styles, setstyles,
        theme, settheme,
        lang, setlang,
        database
    } = useContext(Context)

    useEffect(() => {
        if (theme) {
            setstyles(styledark)
        } else {
            setstyles(stylelight)
        }
    }, [theme])

    let languagesarr = []
    for (let language in languages) {
        languagesarr.push(
            <Picker.Item label={languages[language][1]} value={languages[language][0]} key={languages[language][0]} />
        )
    }

    const toggleSwitch = () => settheme(previousState => !previousState);

    const clearAll = async () => {
        try {
            await AsyncStorage.clear()
        } catch (e) {
            // clear error
        }

        console.log('Done.')
        alert("Whole local memory deleted. Restart app.")
    }

    const removeValue = async () => {
        try {
            await AsyncStorage.removeItem('@fileslist')
        } catch (e) {
            // remove error
        }

        let filest = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
        for (let file of filest) {
            console.log(file)
            let filei = await FileSystem.getInfoAsync(FileSystem.documentDirectory + file, { md5: true })
            await FileSystem.deleteAsync(filei.uri);

            let index = localfiles.map(x => {
                return x.md5;
            }).indexOf(file.id);
            localfiles.splice(index, 1);
        }
        setlocalfiles([...localfiles])
        console.log('Done.')
        alert("All local files deleted.")
    }

    async function deleteaccount() {
        if (Platform.OS == 'web') {
            if (window.confirm("Are sure you want to delete your account?")) {
                performdel()
            }
        } else {
            Alert.alert(
                "Deleting account",
                "Are sure you want to delete your account?",
                [
                    {
                        text: "Yes",
                        onPress: () => performdel(),
                    },
                    {
                        text: "No",
                        onPress: () => { return },
                        style: "cancel",
                    },
                ]
            );
        }

        async function performdel() {
            auth.currentUser.delete().then(() => {
                auth.signOut() // User deleted.
                if (Platform.OS == 'web') { location.reload() }
            }).catch((error) => {
                // An error ocurred
                // ...
            });
        }

    }


    return (
        <ScrollView style={{backgroundColor:styles.container.backgroundColor}}>
            <SafeAreaView style={styles.container}>
                <View style={styles.inner}>


                    {isLoading ?
                        <ActivityIndicator
                            size='large'
                            style={[styles.loadingspinner, { top: (height / 2) - 40 }]}
                        /> : null}


                    <View style={styles.tile}>
                        <Text style={styles.headertext}>User ID</Text>
                        <Text style={{ color: styles.colors.text }}>{user.uid}</Text>
                    </View>

                    <View style={styles.tile}>
                        <Text style={styles.headertext}>Theme</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ color: styles.colors.text }}>Darkmode enabled</Text>
                            <Switch
                                onValueChange={toggleSwitch}
                                value={theme}
                            />
                        </View>
                    </View>

                    <View style={styles.tile}>
                        <Text style={styles.headertext}>Language</Text>
                        <Text style={{ color: styles.colors.text }}>Used for Tessetact OCR engine</Text>
                        <Picker
                            style={[styles.inputs, { color: styles.colors.text }]}
                            selectedValue={lang}
                            
                            onValueChange={(itemValue, itemIndex) =>
                                [setlang(itemValue),
                                
                                    database.ref("users/" + user.uid + "/language").update(
                                      {tesseract:itemValue}).then((input) => {
                                        //success callback
                                        console.log('data ', input)
                                      }).catch((error) => {
                                        //error callback
                                        console.log('error ', error)
                                      })]
                                  
                            }
                        >
                            {languagesarr}
                        </Picker>
                    </View>

                    <Pressable style={styles.buttonmain} onPress={() => clearAll()}><Text style={styles.buttonmaintext}>Clear memory</Text></Pressable>
                    <Pressable style={styles.buttonmain} onPress={() => removeValue()}><Text style={styles.buttonmaintext}>Clear local files</Text></Pressable>
                    <Pressable style={styles.buttonmain} onPress={() => deleteaccount()}><Text style={styles.buttonmaintext}>Delete account</Text></Pressable>
                </View>
            </SafeAreaView>
        </ScrollView>

    )
}
export default Settings;
