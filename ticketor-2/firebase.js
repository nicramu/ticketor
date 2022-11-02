import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/functions';
import 'firebase/compat/storage';
import Constants from "expo-constants";

import AsyncStorage from '@react-native-async-storage/async-storage';
//import {initializeAuth, connectAuthEmulator} from 'firebase/auth';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth/react-native';

// Initialize Firebase
const firebaseConfig = {

};

let Firebase;

if (firebase.apps.length === 0) {
    Firebase = firebase.initializeApp(firebaseConfig);

    const origin = Constants.manifest.debuggerHost?.split(":").shift() || "localhost";

    initializeAuth(Firebase, {
        persistence: getReactNativePersistence(AsyncStorage)
    });


    firebase.auth().useEmulator(`http://${origin}:9099/`)
    firebase.database().useEmulator(origin, 9000);
    firebase.functions().useEmulator(origin, 5001);
    firebase.storage().useEmulator(origin, 9199);


}


export const auth = firebase.auth()
export const database = firebase.database();
export const storage = firebase.storage();



export default firebase;