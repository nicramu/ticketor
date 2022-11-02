import React, { useContext ,useState} from "react";
import { ActivityIndicator } from 'react-native';

import { styledark,stylelight } from '../Styles'
import { Context } from '../App';

function Loading() {
    const {
        width, height,
        isLoading, setIsLoading,
        styles,setstyles
    } = useContext(Context)

    return (
        <ActivityIndicator
            size='large'
            style={[styles.loadingspinner, { top: (height / 2) - 40 }]}
        />
    )
}

export default Loading