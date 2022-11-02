import { Text, TextInput, View, SafeAreaView, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import 'react-native-gesture-handler';
//import { WebView } from 'react-native-webview';
//import Constants from 'expo-constants';
import React, { useState, useContext } from "react";
import { Picker } from '@react-native-picker/picker';
import { ScrollView } from 'react-native-gesture-handler';

import { styledark, stylelight } from '../Styles'
import { Context } from '../App';

function Edit({ navigation, route }) {
    const {
        width, height,
        localfiles, setlocalfiles,
        locallist, setlocallist,
        savelist, loadlist,
        sendlisttoserver,
        bytesToSize,
        isLoading, setIsLoading,
        user, setUser,
        auth, database, storage,
        styles, setstyles

    } = useContext(Context)
    const { item } = route.params;

    const [category, setcategory] = useState(item.category)
    const [text, onChangeText] = useState(item.name);

    async function save() {
        console.log(item)
        for (let i of locallist) {
            if (i.id == item.id) {
                i.name = text
                i.category = category
            }
        }
        savelist(locallist)
        setlocallist([...locallist])
        sendlisttoserver(locallist)
        navigation.goBack()
    }


    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.inner, { marginVertical: 0, paddingVertical: 0 }]}>
                <ScrollView contentContainerStyle={{ padding: 10 }} >


                    <View style={styles.tile}>
                        <Text style={styles.headertext}>name</Text>
                        <TextInput onChangeText={onChangeText} defaultValue={item.name} style={{ backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 5, paddingVertical: 5, marginHorizontal: -10, color: styles.colors.text }}></TextInput>
                    </View>

                    <View style={styles.tile}>
                        <Text style={styles.headertext}>category</Text>
                        <Picker
                            selectedValue={category == null ? item.category : category}
                            style={[styles.inputs, { color: styles.colors.text }]}
                            onValueChange={(itemValue, itemIndex) =>
                                setcategory(itemValue)
                            }>
                            <Picker.Item label="✈️ airplane" value="airplane" />
                            <Picker.Item label="🚆 train" value="train" />
                            <Picker.Item label="🚌 bus" value="bus" />
                            <Picker.Item label="🎫 other" value="other" />
                        </Picker>
                    </View>

                    <View style={styles.tile}>
                        <Text style={styles.headertext}>synchronisation status</Text>
                        {item.url ?
                            <View style={{ flexDirection: 'row', alignItems: 'center', }}><Ionicons name="cloud-done" size={24} color={styles.colors.text} /><Text style={{ color: styles.colors.text }}> synced</Text></View>
                            :
                            <View style={{ flexDirection: 'row', alignItems: 'center', }}><Ionicons name="cloud-offline" size={24} color={styles.colors.text} /><Text style={{ color: styles.colors.text }}> not synced</Text></View>
                        }
                        {item.text !== 'default' ?
                            <View style={{ flexDirection: 'row', alignItems: 'center', }}><Ionicons name="eye" size={24} color={styles.colors.text} /><Text style={{ color: styles.colors.text }}> OCRed</Text></View>
                            :
                            <View style={{ flexDirection: 'row', alignItems: 'center', }}><Ionicons name="eye-off" size={24} color={styles.colors.text} /><Text style={{ color: styles.colors.text }}> not OCRed</Text></View>}
                    </View>

                    <View style={styles.tile}>
                        <Text style={styles.headertext}>size</Text>
                        <Text style={{ color: styles.colors.text }}>{bytesToSize(item.size)}</Text>
                    </View>

                    <View style={styles.tile}>
                        <Text style={styles.headertext}>location</Text>
                        <Text style={{ color: styles.colors.text }}>{item.uri}</Text>
                    </View>

                    <View style={{ height: 50 }}></View>
                </ScrollView>

                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 50, backgroundColor: 'rgba(0,0,0,0.2)', position: 'absolute', bottom: 0, left: 0, right: 0, }}>
                    <Pressable onPress={() => { save() }} style={{ width: 150, backgroundColor: styles.colors.accent, alignItems: 'center', justifyContent: 'center', height: 40, borderRadius: 10, marginHorizontal: 10, elevation: 2 }}><Text style={styles.buttonmaintext}>Save</Text></Pressable>
                    <Pressable onPress={() => navigation.goBack()} style={{ width: 150, backgroundColor: styles.colors.main, alignItems: 'center', justifyContent: 'center', height: 40, borderRadius: 10, marginHorizontal: 10, elevation: 2 }}><Text style={styles.buttonsecondtext}>Cancel</Text></Pressable>
                </View>
            </View>
        </SafeAreaView>
    );



}
export default Edit;
