import { StatusBar } from 'expo-status-bar';
import { Text, TextInput, View, SafeAreaView, Pressable, FlatList, useWindowDimensions, Alert, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
//import PDFReader from 'rn-pdf-reader-js'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-gesture-handler';
//import { WebView } from 'react-native-webview';
//import Constants from 'expo-constants';
import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Picker } from '@react-native-picker/picker';
import { ScrollView } from 'react-native-gesture-handler';


import { styledark, stylelight } from '../Styles'
import { Context } from '../App';
import List from './List';
import Loading from './Loading';


function Mainweb({ navigation }) {
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

    const [firebasefiles, setfirebasefiles] = useState([])

    useEffect(() => {
        // database.goOffline()
        //database.goOnline()

        setIsLoading(true)


        database.ref(".info/connected").on("value", (snap) => {
            if (snap.val() === true) {
                console.log("connected");
                database.ref('users/' + /*user.uid*/'qFPLWQfh4Bvx0hanIE9GixOPiVmG' + '/files')
                    .on('value', (snapshot) => {
                        console.log("Current data: ", snapshot.val());
                        let data = snapshot.val() ? Object.values(snapshot.val()) : []
                        setfirebasefiles(data)
                        setIsLoading(false)
                    });
            } else {
                console.log("not connected");
            }
        });



    }, []);

    const getfile = async () => {
        let result = await DocumentPicker.getDocumentAsync({})
        if (result.type == 'cancel') { return }
        if (firebasefiles.some(e => e.name === result.name)) {
            alert("same file already exists on your list")
        } else {
            let obj = {
                uri: result.uri,
                size: result.size,
                name: result.name,
                type: result.mimeType,
                text: 'default',
                category: 'other',
                id: result.name.slice(0, result.name.lastIndexOf(".")),
                isarchived: 'no',
                url: '',
                key:Date.now()
            }
            sendlisttoserver([obj])
            console.log(result)
            await uploadtofirebase(obj)
        }
    };

/*     useEffect(() => {
        if (firebasefiles.length > 0) {
            for (let file of firebasefiles) {
                if (file.url == ''&&file.text=='default') { uploadtofirebase(file) }
            }
        }
    }, [firebasefiles]) */


    async function uploadtofirebase(result) {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // on load
            xhr.onload = function () {
                resolve(xhr.response);
            };
            // on error
            xhr.onerror = function (e) {
                console.log(e);
                reject(new TypeError("Network request failed"));
            };
            // on complete
            xhr.responseType = "blob";
            xhr.open("GET", result.uri, true);
            xhr.send(null);
        });

        // a reference that points to this 'userphoto/101' location 
        //const fileRef = ref(getStorage(), user.uid + `/${result.name}`);
        let upload = storage.ref(user.uid + '/' + result.id).put(blob)

        // Register three observers:
        // 1. 'state_changed' observer, called any time the state changes
        // 2. Error observer, called on failure
        // 3. Completion observer, called on successful completion
        upload.on('state_changed',
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                setIsLoading(true)
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
/*                 switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                        console.log('Upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                        console.log('Upload is running');
                        break;
                } */
            },
            (error) => {
                console.log("upload error "+error)// Handle unsuccessful uploads
            },
            () => {
                //blob.close();
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                upload.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    //console.log('File available at', downloadURL);
                    //let newarr = locallist.map(x => (x.id === result.id ? { ...x, url: downloadURL } : x))
                    //console.log('afetr mapping ' + JSON.stringify(newarr))
                    //database.ref("users/" + user.uid + "/files/" + result.id +'/').update({url:downloadURL})
setIsLoading(false)
                    //setlocallist(newarr)
                   // updatelist(newarr)
                });
            }
        );
        // upload the 'blob' (the image) in the location refered by 'fileRef'
        // const asd = await uploadBytes(fileRef, blob);

        // We're done with the blob, close and release it
        //blob.close();
    }



    if (isLoading) {
        return (<Loading />)
    }

    return (

        <SafeAreaView style={styles.container}>
            <View style={styles.inner}>
                <FlatList
                    inverted
                    //ref={flatListRef}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingTop:70  }}
                    ListEmptyComponent={() => (<View style={{ transform: [{ scaleY: -1 }], alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}><Ionicons style={{ position: 'absolute' }} name="cloud-circle-outline" size={256} color="#c9ada7" /><Text style={{ fontSize: 28, textTransform: 'uppercase', fontWeight: 'bold', color: '#d22b49', zIndex: 1 }}>Add your tickets</Text></View>)}
                    data={firebasefiles.sort((a, b) => a.key - b.key)}
                    extraData={firebasefiles}
                    ItemSeparatorComponent={() => (<View style={{ flex: 1, marginVertical:-5 }}></View>)}
                    renderItem={({ item }) => (
                        <List item={item} navigation={navigation} />
                    )} />
                <Pressable onPress={() => getfile()} style={{ position: 'absolute', bottom: 0, left: 0, zIndex: 999, margin: 20, width: 64, height: 64, borderRadius: 10, backgroundColor: styles.colors.secondary, elevation: 4 }}>
                    <Ionicons style={{ marginHorizontal: 2, marginVertical: -2 }} name="md-add-circle-outline" size={64} color={styles.colors.accent} />
                </Pressable>
            </View>
        </SafeAreaView>

    )
}
export default Mainweb;
