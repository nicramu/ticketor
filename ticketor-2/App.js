import { StatusBar } from 'expo-status-bar';
import { useWindowDimensions, Platform, Text, TextInput, View, SafeAreaView, Pressable, FlatList, Alert, StyleSheet, NativeModules } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
//import PDFReader from 'rn-pdf-reader-js'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler'
//import { WebView } from 'react-native-webview';
//import Constants from 'expo-constants';
import React, { useState, useEffect, useRef, useCallback, useContext, createContext } from "react";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Picker } from '@react-native-picker/picker';
import * as NavigationBar from 'expo-navigation-bar';

//import screens
//
import List from './Screens/List';
import Main from './Screens/Main';
import Mainweb from './Screens/Mainweb';
import Edit from './Screens/Edit';
import Welcome from './Screens/Welcome';
import Login from './Screens/Login';
import Signup from './Screens/Signup';
import Settings from './Screens/Settings'
import Viewer from './Screens/Viewer'
import languages from './languages.json';

import { styledark, stylelight } from './Styles'

import firebase, { auth, database, storage } from './firebase';


export const Context = createContext(null);
const RootStack = createStackNavigator();

function RootStackScreen() {

  const [user, setUser] = useState(null);
  const [firebasefiles, setfirebasefiles] = useState(null)
  const [styles, setstyles] = useState(stylelight)
  const [theme, settheme] = useState(false);

  if (Platform.OS === 'android') {
    NavigationBar.setBackgroundColorAsync(styles.colors.main)
    NavigationBar.setBorderColorAsync('transparent')
  }


  const filesindirinitial = {
    name: 'loading',
    id: '',
    type: '',
    size: '',
    uri: '',
    text: '',
    category: '',
    isarchived: ''
  };


  const savelist = async (data) => {
    try {
     // console.log("saving " + data)
      const jsonValue = JSON.stringify(data)
      await AsyncStorage.setItem('@fileslist', jsonValue)
    } catch (e) {
      // saving error
    }
  }
  const loadlist = async () => {
    try {
     // console.log("loading local files list")
      const jsonValue = await AsyncStorage.getItem('@fileslist')
      //console.log(jsonValue)
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      // error reading value
    }
  }



  const [isLoading, setIsLoading] = useState(true);
  const [localfiles, setlocalfiles] = useState([]);
  const [locallist, setlocallist] = useState([]);

  function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  }

  function sendlisttoserver(input) {
    console.log("here we go")
    input.forEach(element => {
      database.ref("users/" + user.uid + "/files/" + element.id).update(
        element
      ).then((input) => {
        //success callback
       // console.log('data ', input)
      }).catch((error) => {
        //error callback
       // console.log('error ', error)
      })
    });
  }

  function deletefromserver(input) {
    console.log("here we go")
    database.ref("users/" + user.uid + "/files/" + input).remove(
    ).then((input) => {
      //success callback
      console.log('data ', input)
    }).catch((error) => {
      //error callback
      console.log('error ', error)
    })

    // Delete the file
    storage.ref(user.uid + '/' + input).delete().then(() => {
      // File deleted successfully
    }).catch((error) => {
      // Uh-oh, an error occurred!
    });
  }

  const { height, width } = useWindowDimensions();

  const [lang, setlang] = useState(null)

  const getDeviceLang = () => {
    let appLanguage = ''
    if (Platform.OS === 'ios') {
      appLanguage = NativeModules.SettingsManager.settings.AppleLocale ||
                        NativeModules.SettingsManager.settings.AppleLanguages[0]
    } else if (Platform.OS === 'android') {
      appLanguage = NativeModules.I18nManager.localeIdentifier;
    }else{ 
      appLanguage = navigator.language
     }

    appLanguage = appLanguage.search(/-|_| /g) !== -1
    ? appLanguage.slice(0, 2).toLowerCase()
    : appLanguage.toLowerCase();
  setlang(languages[appLanguage][0])
}

useEffect(() => {
  getDeviceLang()
}, [])


const [onlinestatus,setonlinestatus]=useState(false)

return (
  <Context.Provider value={{
    width, height,
    localfiles, setlocalfiles,
    locallist, setlocallist,
    savelist, loadlist,
    sendlisttoserver,
    bytesToSize,
    isLoading, setIsLoading,
    user, setUser,
    auth, database, storage,
    styles, setstyles,
    theme, settheme,
    deletefromserver,
    lang, setlang,
    onlinestatus,setonlinestatus
  }}>
    <StatusBar style={styles == stylelight ? "dark" : "light"} animated={true} />
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName='Welcome'
        screenOptions={{
          headerStyle: {
            backgroundColor: styles.colors.secondary,
          },
          headerTintColor: styles.colors.text,
          headerTitleStyle: {
            fontWeight: 'normal',
          },
          headerShadowVisible: false
        }}>
        <RootStack.Group screenOptions={{ headerShown: true }}>
          <RootStack.Screen name="Main" component={Main} options={({ navigation }) => ({
            title: 'Ticketor', headerRight: () => (
              <Pressable style={{ marginRight: 20 }} onPress={() => {
                navigation.navigate('Settings')
              }}>
                <MaterialCommunityIcons name="cog" size={32} color={styles.colors.text} />
              </Pressable>
            )
          })} />
          <RootStack.Screen name="Mainweb" component={Mainweb} options={({ navigation }) => ({
            title: 'Ticketor', headerRight: () => (
              <Pressable style={{ marginRight: 20 }} onPress={() => {
                navigation.navigate('Settings')
              }}>
                <MaterialCommunityIcons name="cog" size={32} color={styles.colors.text} />
              </Pressable>
            )
          })} />
          <RootStack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
        </RootStack.Group>
        <RootStack.Group screenOptions={{ presentation: 'modal' }}>
          <RootStack.Screen name="Edit" component={Edit} options={({ route }) => ({ title: route.params.item.name })} />
          <RootStack.Screen name="Login" component={Login} options={{ title: 'Log in' }} />
          <RootStack.Screen name="Signup" component={Signup} options={{ title: 'Sign up' }} />
          <RootStack.Screen name="Settings" component={Settings} options={{ title: 'Settings' }} />
          <RootStack.Screen name="Viewer" component={Viewer} options={({ route }) => ({ title: route.params.item.name })} />

        </RootStack.Group>
      </RootStack.Navigator>
    </NavigationContainer>
  </Context.Provider>
);
}

export default RootStackScreen;