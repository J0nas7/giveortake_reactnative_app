// External
import { NavigationContainer } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, AppState, AppStateStatus, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import SplashScreen from 'react-native-splash-screen'

// Internal
import { DeviceIsLoggedIn, DeviceNotLoggedIn } from '@/src/Components/Navigation'
import {
    selectIsLoggedIn,
    useAppDispatch,
    useAuthActions,
    useTypedSelector
} from '@/src/Redux'

export const ContentView: React.FC = () => {
    // Hooks
    const dispatch = useAppDispatch()
    const { fetchIsLoggedInStatus } = useAuthActions()

    // State and Constants
    const isLoggedIn = useTypedSelector(selectIsLoggedIn)
    const [showLogoScreen, setShowLogoScreen] = useState<boolean>(false)
    const appState = useRef(AppState.currentState)

    useEffect(() => {
        const init = async () => await dispatch(fetchIsLoggedInStatus())
        init()
    }, [dispatch])

    useEffect(() => {
        if (isLoggedIn !== undefined) SplashScreen.hide()
    }, [isLoggedIn])

    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (isLoggedIn === undefined) return

            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                // Handle the case when the app comes to the foreground
                setShowLogoScreen(false)
            } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
                // Handle the case when the app goes to the background
                setShowLogoScreen(true)
            }
            appState.current = nextAppState
        }

        const subscription = AppState.addEventListener('change', handleAppStateChange)

        return () => subscription.remove()
    }, [isLoggedIn])

    if (showLogoScreen) {
        return (
            <SafeAreaView style={[styles.container, styles.logoScreen]}>
                <Text style={styles.logoText}>Give or Take</Text>
            </SafeAreaView>
        )
    }

    return (
        <NavigationContainer>
            {isLoggedIn ? (
                <DeviceIsLoggedIn />
            ) : isLoggedIn === false ? (
                <SafeAreaView style={styles.container}>
                    <DeviceNotLoggedIn />
                </SafeAreaView>
            ) : (
                <SafeAreaView style={styles.container}>
                    <View style={styles.cardContainer}>
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                </SafeAreaView>
            )}
        </NavigationContainer>
    )
}

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
    },
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8', // Background color for the entire app
    },
    logoScreen: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    logoText: {
        fontSize: 40,
        fontWeight: 'bold'
    }
})
