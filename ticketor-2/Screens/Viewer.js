import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import React, { useState, useContext } from "react";

import { styledark, stylelight } from '../Styles'
import { Context } from '../App';


function Viewer({ navigation, route }) {
    const { item } = route.params;

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

    return (
        <WebView
            originWhitelist={["*"]}
            source={{ uri: item.uri }}
        />
    )
}

export default Viewer