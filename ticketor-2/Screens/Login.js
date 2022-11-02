import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import { Dimensions, Text, TextInput, View, SafeAreaView, Pressable, FlatList, useWindowDimensions, Alert, StyleSheet } from 'react-native';
import Firebase from '../firebase';

import { styledark,stylelight } from '../Styles'
import { Context } from '../App';
import List from './List';

function Login({ navigation }) {
    const {
        filesindir, setfilesindir,
        mergedfiles, setmergedfiles,
        savedfiles, setsavedfiles,
        getData,
        isloading, setisloading,
        styles,setstyles

    } = useContext(Context)


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.inner}>
                <TextInput></TextInput>
            </View>
        </SafeAreaView>

    )
}
export default Login;
