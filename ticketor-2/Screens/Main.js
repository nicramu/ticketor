import { StatusBar } from 'expo-status-bar';
import { Text, TextInput, View, SafeAreaView, Pressable, FlatList, useWindowDimensions, Alert, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
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
import firebase from '../firebase';



import { styledark, stylelight } from '../Styles'
import { Context } from '../App';
import List from './List';
import Loading from './Loading';
import { func } from 'prop-types';


function Main({ navigation }) {
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
        styles, setstyles,
        onlinestatus, setonlinestatus

    } = useContext(Context)


    const flatListRef = useRef()
    const toTop = () => {
        // use current
        flatListRef.current.scrollToEnd({ animated: true })
    }


    const getfile = async () => {
        let result = await DocumentPicker.getDocumentAsync({})
        if (result.type == 'cancel') { return }
        let exists = await FileSystem.getInfoAsync(result.uri, { md5: true })
        // console.log("local " + localfiles)
        if (localfiles.some(e => e.md5 === exists.md5)) {
            alert("same file already exists on your list")

        } else {
            FileSystem.copyAsync({
                from: result.uri,
                to: FileSystem.documentDirectory + result.name
            }
            ).catch((e) => { alert(e) })
            setlocalfiles([...localfiles, exists])
        }
    };

    const getfileandrefresh = async () => {
        await getfile();
        // await getfiles();
        toTop();
    }

    /*
if online -> get firebase
compare with saved
compare with localfiles
save

if offline -> get saved
compare with localfiles
save

////////////////
get firebase



    */


    useEffect(() => {
        //database.goOnline()
        //database.goOffline()

        //setIsLoading(true)
        // console.log("useeffect");
        // toTop();
        //  getfiles();


        database.ref("users/" + user.uid + "/files/")
            .on('value', (snapshot) => {
                let data = snapshot.val() ? Object.values(snapshot.val()) : []
                if (data != locallist) {
                    console.log("new data")

                    setfirebasedata(data)

                } else {
                    setfirebasedata(null)
                }
            })
        //setIsLoading(false)



        database.ref(".info/connected").on("value", (snap) => {
            if (snap.val() === true) {
                // console.log("connected");
                setonlinestatus(true)

            } else {
                // console.log("not connected");
                setonlinestatus(false)

            }


        });

        getlocalfiles()


    }, [])

    const [firebasedata, setfirebasedata] = useState()

    //const [ocrresult,setocrresult]=useState([])

    async function ocrlist(list) {


        for (let i in list) {
            if(list[i].text=='default' || list[i].category!='other'){continue}
            let result
            result = await regex(/poci.g|pkp/gmi, list[i].text, 0)
            if (result == true) {
                list[i].category = 'train'
                setocrresult([...ocrresult,{"id":list[i].id,"destination":await regex(/\D+ — \D+(?= \nPrzez:)/gmi, list[i].text, 1)}])
                console.log(JSON.stringify(ocrresult))
            }
            result = await regex(/odlot./gmi, list[i].text, 0)
            if (result == true) {
                list[i].category = 'airplane'
            }
        }

       setlocallist([...locallist])

        async function regex(expression, string, type) {
            let regex = new RegExp(expression)
            if (type) {
                return regex.exec(string)
            } else {
                return regex.test(string)
            }
        }
    }

    useEffect(() => {
        //  console.log("useeffect");
        //setIsLoading(true)
        if (locallist.length != localfiles.length) {
            getlocalfiles()

        }

    }, [localfiles])

    useEffect(() => {
        //  console.log("useeffect");
        //setIsLoading(true)


        if (firebasedata !== locallist) {

            getlocalfiles()

        }



    }, [firebasedata])





    async function getfi() {
        let filesind = []
        let filest = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
        for (let file of filest) {
            if (file == "RCTAsyncLocalStorage") { continue } //iOS workaround
            let filei = await FileSystem.getInfoAsync(FileSystem.documentDirectory + file, { md5: true })
            let filename = filei.uri.slice(filei.uri.lastIndexOf('/') + 1)
            let filetype = filei.uri.slice(filei.uri.lastIndexOf('.') + 1)
            if (filetype == 'pdf') {
                filetype = 'application/pdf'
            } else if (filetype == 'jpg') {
                filetype = 'image/jpeg'
            } else if (filetype == 'png') {
                filetype = 'image/png'
            } else {
                filetype = 'application/octet-stream'
            }
            filesind.push({
                uri: filei.uri,
                size: filei.size,
                name: filename,
                type: filetype,
                text: 'default',
                category: 'other',
                id: filei.md5,
                isarchived: 'no',
                url: '',
                key: Date.now()
            })
            // writeUserData(filei.uri, filei.size, filename, filetype, filei.md5)
        }
        return filesind
    }

    async function getlocalfiles() {
        let filesind = await getfi()
        let merged = await mergelocalwithsaved(filesind)

        //console.log(firebasedata)
        await setlocallist(merged)


        if (firebasedata != null) {
            let newarr = merged.map((t1) => ({ ...t1, ...firebasedata.find((t2) => t2.id === t1.id) }));
//await ocrlist(newarr)
            await updatelist(newarr)
        } else {
            await updatelist(merged)
        }         /*   await uploadtofirebase(merged)*/

        setIsLoading(false)
        toTop()
    }



    async function mergelocalwithsaved(local) {
        let storage = await loadlist()
        if (storage != null) {
            let files = local.map(
                obj => storage.find(o => o.id === obj.id) || obj
            )
            //setlocallist(files)
            return files
        } else {
            return local
            // setlocallist(local)
        }

    }

    async function getfiles() {
        let files = await getlocalfiles()
        //alert("are we done yet?")
        await updatelist(files)
        toTop()
        setIsLoading(false)
    }

    async function updatelist(files) {
        await new Promise((resolve, reject) => {
            sendlisttoserver(files)
            savelist(files)
            resolve(setlocallist(files))
        })
    }


    useEffect(() => {
        if (locallist.length > 0) {
            for (let file of locallist) {
                if (file.url == '' && file.text == 'default') { uploadtofirebase(file) }
            }
        }
    }, [locallist])





    async function uploadtofirebase(result) {
        setIsLoading(true)
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
        upload.on('state_changed', // or 'state_changed'
            (snapshot) => {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                /*           switch (snapshot.state) {
                            case storage.TaskState.PAUSED: // or 'paused'
                              console.log('Upload is paused');
                              break;
                            case storage.TaskState.RUNNING: // or 'running'
                              console.log('Upload is running');
                              break;
                          } */
            },
            (error) => {
                // A full list of error codes is available at
                // https://firebase.google.com/docs/storage/web/handle-errors
                switch (error.code) {
                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        break;
                    case 'storage/canceled':
                        // User canceled the upload
                        break;

                    // ...

                    case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                }
            },
            () => {
                // Upload completed successfully, now we can get the download URL
                /*           upload.snapshot.ref.getDownloadURL().then((downloadURL) => {
                            console.log('File available at', downloadURL);
                          }); */
                console.log("file sent")
                setIsLoading(false)
            }
        );
    }


    /*     function writeUserData(uri, size, filename, filetype, md5) {
            console.log("here we go")
            database.ref("users/"+user.uid+"/files/"+md5).update({
                uri: uri,
                size: size,
                name: filename,
                type: filetype,
                text: 'default',
                category: 'other',
                id: md5,
                isarchived: 'no'
            }).then((data) => {
                //success callback
                console.log('data ', data)
            }).catch((error) => {
                //error callback
                console.log('error ', error)
            })
        } */






    return (

        <SafeAreaView style={styles.container}>

            {!onlinestatus ? <View style={{ position: 'absolute', top: 10, backgroundColor: styles.colors.accent, alignSelf: 'center', padding: 5, paddingHorizontal: 15, borderRadius: 10 }}><Text style={styles.buttonmaintext}>You're offline. Restart app.</Text></View> : null}

            {isLoading ? <Loading /> : null}
            <FlatList
                inverted
                ref={flatListRef}
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingTop: 85 }}
                ListEmptyComponent={() => (<View style={{ transform: [{ scaleY: -1 }], alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}><Ionicons style={{ position: 'absolute' }} name="cloud-circle-outline" size={256} color="#c9ada7" /><Text style={{ fontSize: 28, textTransform: 'uppercase', fontWeight: 'bold', color: '#d22b49' }}>Add your tickets :)</Text></View>)}
                data={locallist.sort((a, b) => a.key - b.key)}
                extraData={locallist}
                ItemSeparatorComponent={() => (<View style={{ flex: 1, marginVertical: -5 }}></View>)}
                renderItem={({ item }) => (
                    <List item={item} navigation={navigation} />
                )} />
            <Pressable onPress={() => getfileandrefresh()} style={{ position: 'absolute', bottom: 0, left: 0, zIndex: 999, margin: 20, width: 64, height: 64, borderRadius: 10, backgroundColor: styles.colors.secondary, elevation: 4 }}>
                <Ionicons style={{ marginHorizontal: 2, marginVertical: -2 }} name="md-add-circle-outline" size={64} color={styles.colors.accent} />
            </Pressable>

            {/*              <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%', backgroundColor: '#c9ada7' }}>
                    <Pressable style={styles.button} onPress={() => getfileandrefresh()}><Text>Add +</Text></Pressable>
                    <Pressable style={styles.button} onPress={() => getdirectory()}><Text>refr +</Text></Pressable>
                    <Pressable style={styles.button} onPress={() => clearAll()}><Text>clear</Text></Pressable>
                    <Pressable style={styles.button} onPress={() => postdata()}><Text>send</Text></Pressable>
                </View> */}

        </SafeAreaView>

    )
}
export default Main;
