import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    inputContainer: {
        padding: 10,
        backgroundColor: '#3F51B5'
    },
    searchButton: {
        marginTop: 10
    },
    autocompleteContainer: {
        flex: 1,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1
    },
    instructionList: {
        // marginTop: 10
    },
    inputBox: {
        backgroundColor: 'white',
        borderRadius: 4,
        margin: 2,
    },
    inputBoxText: {
        color: 'gray'
    },
    map: {
        height: 400,
        width: 400,
        justifyContent: 'flex-end',
        alignItems: 'center',
    }
})