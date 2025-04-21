// External
import { useEffect, useState } from 'react'
import { Alert, AppState, AppStateStatus, Platform, PermissionsAndroid } from 'react-native'
import firebase from '@react-native-firebase/app'
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging'
import PushNotification from 'react-native-push-notification'
import { Notification, NotificationBackgroundFetchResult, NotificationCompletion, Notifications } from 'react-native-notifications';
import DeviceInfo from 'react-native-device-info'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Internal
import { NotificationContent } from '@/src/Types'
import {
    selectIsNotificationsDenied,
    selectUnreadCounter,
    selectUnreadNotifications,
    setIsNotificationsDenied,
    setIsNotificationsDetermined,
    setIsNotificationsSkipped,
    setNotificationData,
    useAppDispatch,
    useTypedSelector
} from '@/src/Redux'
import { useAuth, useAxios } from '@/src/Hooks'

const firebaseConfig = {
    apiKey: 'AIzaSyBYyLZC8-l67ucU3obIsKDzYguScl2rfpw',
    authDomain: 'funler-ai.firebaseapp.com',
    databaseURL: 'https://funler-ai.firebaseio.com',
    projectId: 'funler-ai',
    storageBucket: 'funler-ai.firebasestorage.app',
    messagingSenderId: '570894669025',
    appId: '1:570894669025:ios:76bbbae9c85b30adaa13a0',
    measurementId: 'G-XXXXXXX'
}

// Initialize Firebase (only once)
const initializeFirebase = () => {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig)
    }
}

interface SaveFCMTokenArgs {
    firebaseToken: string
    deviceId: string
    deviceName: string
}

export const useNotifications = () => {
    // Hooks
    const dispatch = useAppDispatch()
    const { httpPostWithData } = useAxios()
    const { handleLogoutSubmit } = useAuth()

    // Redux
    const unreadNotifications = useTypedSelector(selectUnreadNotifications)
    const isNotificationsDenied = useTypedSelector(selectIsNotificationsDenied)
    const unreadCounter = useTypedSelector(selectUnreadCounter)

    // Request notification permissions when hook is used
    useEffect(() => {
        // Initialize Firebase app
        initializeFirebase()

        // Check notification settings on mount
        checkNotificationSettings().then(settings => {
            const authorized = settings.authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED
            const denied = Platform.OS === 'android'
                ? settings.authorizationStatus !== messaging.AuthorizationStatus.AUTHORIZED
                : settings.authorizationStatus === messaging.AuthorizationStatus.DENIED

            if (authorized) requestFCMToken()

            dispatch(setIsNotificationsDetermined(authorized))
            dispatch(setIsNotificationsDenied(denied))
        })

        checkNotificationsSkipped()

        // Set up Firebase messaging delegate and notification handler
        messaging().onMessage(async remoteMessage => {
            if (remoteMessage.notification && remoteMessage.notification.title && remoteMessage.notification.body) {
                handleNotification({
                    title: remoteMessage.notification.title,
                    message: remoteMessage.notification.body,
                })
            }
        })

        // App state change listener (equivalent to `UIApplication.didBecomeActiveNotification` in Swift)
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                checkNotificationSettings().then(settings => {
                    const authorized = settings.authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED

                    setIsNotificationsDetermined(authorized)

                    if (authorized) requestNotificationPermissions()
                })
            }
        }

        // Add the AppState listener
        const subscription = AppState.addEventListener('change', handleAppStateChange)

        // Remove the listener when the component unmounts
        return () => subscription.remove()
    }, [dispatch])

    useEffect(() => {
        // Handle notification tapped when the app is killed or app is opened from the notification
        Notifications.getInitialNotification().then(async (remoteMessage: Notification | undefined) => {
            if (remoteMessage?.payload && remoteMessage?.payload.cid && remoteMessage?.payload.type) {
                const filteredData = {
                    cid: remoteMessage.payload.cid,
                    type: remoteMessage.payload.type
                };
                // Alert.alert("useNotification received cid and type:", JSON.stringify(filteredData));
                dispatch(setNotificationData(filteredData));
            } else {
                // Handle cold start logic here (App opened directly, not from a notification)
                dispatch(setNotificationData(false))
            }
        }).catch(err => {
            // Alert.alert("useNotification catch error", JSON.stringify(err));
        });

        // Handle notifications when the app is in the foreground
        const foregroundSubscription = Notifications.events().registerNotificationReceivedForeground(
            (notification: Notification, completion: (response: NotificationCompletion) => void) => {
                if (notification?.payload?.data) {
                    const filteredData = {
                        cid: notification?.payload?.cid,
                        type: notification?.payload?.type
                    }
                    
                    if (filteredData) {
                        dispatch(setNotificationData(filteredData));
                    }
                }
                
                // Show a native banner notification
                Notifications.postLocalNotification(notification)

                // Ensure completion is called with a response
                completion({ alert: true }); // You can set alert: false if you don't want the alert to be shown
            }
        );

        // Handle notifications when the app is in the background
        const backgroundSubscription = Notifications.events().registerNotificationReceivedBackground(
            (notification: Notification, completion: (response: NotificationBackgroundFetchResult) => void) => {
                if (notification?.payload?.data) {
                    const filteredData = {
                        cid: notification?.payload?.cid,
                        type: notification?.payload?.type
                    }
                    if (filteredData) {
                        dispatch(setNotificationData(filteredData));
                    }
                }
                // Ensure completion is called with a response
                completion(NotificationBackgroundFetchResult.NEW_DATA); // You can use NoData or Failed if applicable
            }
        );

        // Cleanup function to unsubscribe when the component is unmounted
        return () => {
            foregroundSubscription.remove(); // Remove foreground listener
            backgroundSubscription.remove(); // Remove background listener
        };
    }, [dispatch]);

    // Check notification settings (equivalent to `checkNotificationSettings` in Swift)
    const checkNotificationSettings = async () => {
        let authorizationStatus

        if (Platform.OS === 'ios') {
            // iOS: Use Firebase to check notification permission status
            authorizationStatus = await messaging().hasPermission()
        } else if (Platform.OS === 'android') {
            if (Platform.Version >= 33) {
                // Android 13+: Check if POST_NOTIFICATIONS permission is granted
                const hasPermission = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                )
                authorizationStatus = hasPermission
                    ? messaging.AuthorizationStatus.AUTHORIZED
                    : messaging.AuthorizationStatus.NOT_DETERMINED
            } else {
                // Android < 13: Assume notifications are authorized
                authorizationStatus = messaging.AuthorizationStatus.AUTHORIZED
            }
        }

        return { authorizationStatus }
    }

    const checkNotificationsSkipped = async () => {
        const token = await AsyncStorage.getItem('notificationsSkipped')

        dispatch(setIsNotificationsSkipped(
            token ? true : false
        ))
    }

    const getAPNSToken = async () => {
        while (true) {
            const apnsToken = await messaging().getAPNSToken()
            console.log(apnsToken)
            if (apnsToken !== null) return apnsToken
            await new Promise((resolve) => setTimeout(resolve, 1000))
        }
    }

    // Request FCM token and save it
    const requestFCMToken = async () => {
        try {
            if (Platform.OS === 'ios') {
                await messaging().requestPermission()
                const apnsTokenAvailable = await getAPNSToken()
                console.log("APNs token Available: ", apnsTokenAvailable)

                if (!apnsTokenAvailable) return

                await messaging().setAPNSToken(apnsTokenAvailable)
            } else if (Platform.OS === 'android' && Platform.Version >= 33) {
                // Check if permission is already granted
                const hasPermission = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                )

                if (!hasPermission) {
                    // Request the permission
                    const status = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                    )

                    if (status === PermissionsAndroid.RESULTS.GRANTED) {
                        console.log('Notification permission granted')
                    } else {
                        console.log('Notification permission denied')
                        return // Exit if permission is denied
                    }
                } else {
                    console.log('Notification permission already granted')
                }
            }

            const firebaseToken = await messaging().getToken()
            if (firebaseToken) {
                const deviceId = await DeviceInfo.getUniqueId()
                const deviceName = DeviceInfo.getDeviceId()
                // Save the FCM token to Redux or API as needed
                saveFCMToken({
                    firebaseToken,
                    deviceId,
                    deviceName
                })
                console.log('FCM token', firebaseToken)
            }
        } catch (error) {
            console.error('Failed to get FCM token:', error)
        }
    }

    const saveFCMToken = async (
        { firebaseToken, deviceId, deviceName }: SaveFCMTokenArgs
    ) => {
        try {
            const subscribeData = {
                firebaseToken,
                deviceId,
                deviceName
            }

            // Perform the HTTP POST request
            const result = await httpPostWithData('subscribe', subscribeData)
            console.log('FCM token saved:', result)
        } catch (error: any) {
            if (error?.response?.data?.error === "TOKEN_EXPIRED") {
                handleLogoutSubmit()
                return
            }

            console.error('Error saving FCM token:', error)
        }
    }

    // Request notification permissions
    const requestNotificationPermissions = async () => {
        try {
            let enabled = false

            if (Platform.OS === 'ios') {
                // iOS: Request permission using Firebase
                const authStatus = await messaging().requestPermission()
                enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED
            } else if (Platform.OS === 'android') {
                if (Platform.Version >= 33) {
                    // Android 13+: Check and request POST_NOTIFICATIONS permission
                    const hasPermission = await PermissionsAndroid.check(
                        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                    )

                    if (!hasPermission) {
                        const status = await PermissionsAndroid.request(
                            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                        )

                        enabled = status === PermissionsAndroid.RESULTS.GRANTED
                    } else {
                        enabled = true // Permission already granted
                    }
                } else {
                    // Android < 13: No explicit permission needed, consider notifications enabled
                    enabled = true
                }
            }

            if (enabled) {
                dispatch(setIsNotificationsDetermined(true))
                await requestFCMToken() // Request FCM token after permissions are granted
            } else {
                console.log('Notification permissions not granted')
            }
        } catch (error) {
            console.error('Error requesting notification permissions:', error)
        }
    }

    // Save user skipped notifications to AsyncStorage
    const setNotificationsSkipped = async () => {
        await AsyncStorage.setItem('notificationsSkipped', 'true')
        dispatch(setIsNotificationsSkipped(true))
    }

    // Handle incoming notifications
    const handleNotification = (notification: NotificationContent) => {
        if (notification.date) {
            // PushNotification.localNotification({
            //     title: notification.title,
            //     message: notification.message,
            //     when: notification.date,
            // })
        }
    }

    /**
     * Schedules a local notification
     * @param {NotificationContent} content - The notification content (title, message, etc.)
     * @param {number} timeInterval - Time interval in seconds after which the notification will be triggered
     */
    const scheduleNotification = (content: NotificationContent, timeInterval: number) => {
        // PushNotification.localNotificationSchedule({
        //     title: content.title,
        //     message: content.message,
        //     date: new Date(Date.now() + timeInterval * 1000),
        // })
    }

    return {
        isNotificationsDenied,
        unreadNotifications,
        unreadCounter,
        notificationEnabled: unreadCounter > 0,
        scheduleNotification,

        requestNotificationPermissions,
        setNotificationsSkipped
    }
}
