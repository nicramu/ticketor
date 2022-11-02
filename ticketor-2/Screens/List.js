import { View, Text, Pressable, Alert, Animated, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';

import Ionicons from '@expo/vector-icons/Ionicons';
import 'react-native-gesture-handler';
import React, { useState, useRef, useContext } from "react";
import Swipeable from 'react-native-gesture-handler/Swipeable';


import { styledark, stylelight } from '../Styles'
import { Context } from '../App';

function List({ navigation, item }) {
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
        deletefromserver

    } = useContext(Context)


    const leftactions = () => {
        return (
            <View style={{ backgroundColor: styles.colors.accent, justifyContent: 'center', flex: 1, borderRadius: 5, padding: 10, marginVertical: 10, alignItems: 'flex-end', marginHorizontal: 28 }}>
                <Ionicons name="trash-bin" size={32} color="#fff" />
            </View>
        )
    }

    const rightactions = () => {
        return (
            <View style={{ backgroundColor: styles.colors.secondary, justifyContent: 'center', flex: 1, padding: 10, marginVertical: 10, borderRadius: 5, alignItems: 'flex-start', marginHorizontal: 28 }}>
                <Ionicons name="archive" size={32} color="#fff" />
            </View>
        )
    }

    const swipeableRef = useRef(null);


    const confirmdelete = async (item) => {
        Alert.alert(
            item.name,
            "Are sure you want to delete ticket " + item.name + "?",
            [
                {
                    text: "Yes",
                    onPress: () => deleteonswipe(item),
                },
                {
                    text: "No",
                    onPress: () => swipeableRef.current.close(),
                    style: "cancel",
                },
            ]
        );
    }

    const deleteonswipe = async (item) => {
        await FileSystem.deleteAsync(item.uri);
        let index = localfiles.map(x => {
            return x.md5;
        }).indexOf(item.id);
        deletefromserver(item.id)
        localfiles.splice(index, 1);
        /*         let saved = await loadlist()
               let saved2 = saved.splice(index,1)
               savelist(saved2) */
        setlocalfiles([...localfiles])
    }


    //console.log(JSON.stringify(ocrresult))

    return (
        <Swipeable
            ref={swipeableRef}
            key={item.id}
            renderLeftActions={rightactions}
            onSwipeableLeftOpen={() => deleteonswipe(item)}
            renderRightActions={leftactions}
            onSwipeableRightOpen={() => confirmdelete(item)}
        >
            <View style={{
                elevation: 5, backgroundColor: styles.colors.ticketbg, borderRadius: 5,
                flex: 1, justifyContent: 'space-between',
                padding: 10, marginVertical: 10,
                width: '85%',
                height: 100,
                flexDirection: 'row', alignSelf: 'center',
            }}>
                <View style={[{ alignItems: 'center', alignContent: 'flex-start', marginLeft: -10, alignSelf: 'stretch', justifyContent: 'center', width: 64, borderRightWidth: 2 }, styles.borderdashed]}>
                    <Text style={{ color: styles.colors.text, fontSize:12 }}>{item.category}</Text>
                </View>
                <Pressable style={{ flexDirection: 'column', paddingHorizontal: 10, justifyContent: 'center', flex: 1 }}
                    onPress={() => {
                        if (Platform.OS === 'ios') {
                            navigation.navigate('Viewer', {
                                item: item
                            });
                        } else if (Platform.OS === 'android') {
                            FileSystem.getContentUriAsync(item.uri).then(cUri => {
                                console.log(cUri);
                                IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                                    data: cUri,
                                    flags: 1,
                                });
                            });
                        } else {
                            /*                                 window.open(
                                                                `https://docs.google.com/viewer?url=${item.url}`,
                                                                '_blank'
                                                            ); */
                            window.open(
                                `${item.url}`,
                                '_blank'
                            );
                        };

                    }
                    }
                >

                    <Text numberOfLines={1} style={{ color: styles.colors.text, fontWeight: 'bold' }}>{item.url ? <Ionicons name="cloud-done" size={14} color={styles.colors.text} /> : <Ionicons name="cloud-offline" size={14} color={styles.colors.text} />} {item.name}</Text>
                    {item.ocr != null ?
                        <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                            <View style={{}}><Text style={{ color: styles.colors.text, fontSize: 12 }}>{item.ocr?.destination}</Text></View>
                            <View style={{}}><Text style={{ color: styles.colors.text, fontSize: 12 }}>{item.ocr?.carrier}</Text></View>
                        </View>
                        :
                        <View style={{ flexDirection: 'row', alignItems: 'center', }}><Ionicons name="eye-off" size={14} color={styles.colors.text} /><Text style={{ color: styles.colors.text }}> not OCRed</Text></View>}

                </Pressable>


                <View style={[{ width: 48, marginRight: -10, alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center', borderLeftWidth: 2 }, styles.borderdashed]}>

                    <View style={{ justifyContent: 'center' }}>
                        <Pressable onPress={() => {
                            navigation.navigate('Edit', {
                                item: item
                            })
                        }}>
                            <Ionicons name="pencil-sharp" size={32} color={styles.colors.text} />
                        </Pressable>
                    </View>
                </View>


            </View>
        </Swipeable>
    )
}
export default List;