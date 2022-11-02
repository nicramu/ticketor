import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import { ActivityIndicator, Platform, Text, TextInput, View, SafeAreaView, Pressable, FlatList, Alert, StyleSheet } from 'react-native';
import Firebase from '../firebase';
import { getAuth, signInAnonymously } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';


import { styledark, stylelight } from '../Styles'
import { Context } from '../App';
import List from './List';
import Login from './Login'
import Mainweb from './Mainweb';
import Main from './Main';
import Loading from './Loading';

function Welcome({ navigation }) {
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

    const slides = [
        {
            title: "How it works",
            text: "description",
            icon: "asd"
        },
        {
            title: "account needed?",
            text: "description",
            icon: "asd"
        }
    ]


    useEffect(() => {
        // onAuthStateChanged returns an unsubscriber
        const unsubscribeAuth = auth.onAuthStateChanged(async authenticatedUser => {
            try {
                //let authenticatedUser=load() 
                await (authenticatedUser ? setUser(authenticatedUser) : setUser(null));
                setIsLoading(false);
                // console.log(authenticatedUser)
            } catch (error) {
                console.log(error);
            }
        });

        // unsubscribe auth listener on unmount
        return unsubscribeAuth;
    }, []);

    useEffect(() => {
        if (user && Platform.OS === 'web') {
            navigation.replace('Mainweb')
        } else if (user && Platform.OS !== 'web') {
            navigation.replace('Main')
        }
    }, [user]);


    async function signinanonym() {
        signInAnonymously(auth)
            .then(() => {
                //saveanonuser(auth)
            })
            .catch((error) => {
                console.log(error.code + error.message)
            });
    }

    const clearAll = async () => {
        try {
            await AsyncStorage.clear()
        } catch (e) {
            // clear error
        }

        console.log('Done.')
    }

    if (isLoading) {
        return (<Loading />)
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.inner}>

                <FlatList
                    data={slides}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={true}
                    renderItem={({ item }) => (
                        <View style={{ width: width - 40, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{}}>{item.title}</Text>
                        </View>
                    )} />
                <Pressable style={styles.buttonmain} onPress={() => navigation.navigate('Login')}><Text style={styles.buttonmaintext}>Login</Text></Pressable>
                <Pressable style={styles.buttonsecond} onPress={() => navigation.navigate('Signup')}><Text style={styles.buttonsecondtext}>Sign up</Text></Pressable>
                <Pressable style={styles.buttonsecond} onPress={() => signinanonym()}><Text style={styles.buttonsecondtext}>Continue as guest</Text></Pressable>
            </View>
        </SafeAreaView>

    )
}
export default Welcome;
