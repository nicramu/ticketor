import { StyleSheet, Platform } from 'react-native';

export const stylelight = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2e9e4',
    },
    buttonmain: {
        padding: 20,
        backgroundColor: '#d22b49',
        borderRadius: 10,
        elevation: 10,
        marginVertical: 5
    },
    buttonmaintext: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    buttonsecond: {
        padding: 20,
        backgroundColor: '#fff',
        textAlign: 'center',
        borderRadius: 10,
        elevation: 10,
        marginVertical: 5
    },
    buttonsecondtext: {
        color: '#d22b49',
        textAlign: 'center',
        fontWeight: 'normal'
    },
    headertext: {
        fontSize: 18,
        color: '#000'
    },
    loadingspinner: {
        backgroundColor: 'rgba(255,255,255,0.7)',
        padding: 20,
        zIndex: 999,
        borderRadius: 10,
        position: 'absolute',
        alignSelf: 'center',
    },
    colors: {
        main: '#f2e9e4',
        secondary: '#c9ada7',
        background: '#4a4e69',
        accent: '#d22b49',
        text: '#000',
        ticketbg: '#fff',
    },
    tile: {
        backgroundColor: '#fff',
        borderRadius: 5,
        elevation: 10,
        padding: 10,
        marginVertical: 5
    },
    inner: {
        flex: 1,
        padding: 20,
        maxWidth: Platform.OS === 'web' ? 500 : null,
        width: Platform.OS === 'web' ? '100%' : null,
        alignSelf: Platform.OS === 'web' ? 'center' : null,
    },
    borderdashed: {
        borderColor: '#c9ada7',
        borderStyle: 'dashed'
    },
    button: { //debug
        padding: 20,
        margin: 10,
        backgroundColor: '#d22b49',
    },
    inputs: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginHorizontal: -10,
        borderWidth: 0,
        padding: Platform.OS === 'web' ? 10 : null,
    }
});

export const styledark = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    buttonmain: {
        padding: 20,
        backgroundColor: '#A64355',
        borderRadius: 10,
        elevation: 10,
        marginVertical: 5
    },
    buttonmaintext: {
        color: '#ccc',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    buttonsecond: {
        padding: 20,
        backgroundColor: '#1f1d3c',
        textAlign: 'center',
        borderRadius: 10,
        elevation: 10,
        marginVertical: 5
    },
    buttonsecondtext: {
        color: '#A64355',
        textAlign: 'center',
        fontWeight: 'normal'
    },
    headertext: {
        fontSize: 18,
        color: '#ccc'
    },
    loadingspinner: {
        backgroundColor: 'rgba(255,255,255,0.7)',
        padding: 20,
        zIndex: 999,
        borderRadius: 10,
        position: 'absolute',
        alignSelf: 'center',
    },
    colors: {
        main: '#000',
        secondary: '#1f1d3c',
        background: '#4a4e69',
        accent: '#A64355',
        text: '#ccc',
        ticketbg: '#1f1d3c',
    },
    tile: {
        backgroundColor: '#1f1d3c',
        borderRadius: 5,
        elevation: 10,
        padding: 10,
        marginVertical: 5
    },
    inner: {
        flex: 1,
        padding: 20,
        maxWidth: Platform.OS === 'web' ? 500 : null,
        width: Platform.OS === 'web' ? '100%' : null,
        alignSelf: Platform.OS === 'web' ? 'center' : null,
    },
    borderdashed: {
        borderColor: '#c9ada7',
        borderStyle: 'dashed'
    },
    button: { //debug
        padding: 20,
        margin: 10,
        backgroundColor: '#A64355',
    },
    inputs: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginHorizontal: -10,
        borderWidth: 0,
        padding: Platform.OS === 'web' ? 10 : null,
    }
});