// External
import React, { useEffect, useState } from 'react'
import SplashScreen from 'react-native-splash-screen'
import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native'

// Internal
import { useNotifications } from '@/src/Hooks'
import {
    BacklogView,
    KanbanBoardView,
    OrganisationDetailsView,
    ProjectDetailsView,
    SignInView,
    StartpageView,
    TaskDetailsView,
    TeamDetailsView,
    TimeTracksView
} from '@/src/Views'
import {
    selectIsLoggedIn,
    selectIsNotificationsDetermined,
    selectIsNotificationsSkipped,
    useAppDispatch,
    useAuthActions,
    useTypedSelector
} from '@/src/Redux'
import { GuestStackParamList, MainStackParamList } from '@/src/Types'
import { HeadlineJumbotron } from '../Core-UI/HeadlineJumbotron'
import { faHome } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import DashboardView from './DashboardView'

type MenuStackProps = { name: keyof MainStackParamList; component: React.FC<{}> }

const DeviceIsLoggedIn = () => {
    type NavigationProp = StackNavigationProp<MainStackParamList>

    const ReturnView = () => {
        const Tab = createBottomTabNavigator()
        const navigation = useNavigation<NavigationProp>()

        const isNotificationsDetermined = useTypedSelector(selectIsNotificationsDetermined)
        const isNotificationsSkipped = useTypedSelector(selectIsNotificationsSkipped)

        useEffect(() => {
            if (isNotificationsDetermined === false && isNotificationsSkipped === false) {
                navigation.navigate('NotificationsInstructionsView')
            } else {
                navigation.navigate('GoTFrontView')
            }
        }, [isNotificationsDetermined, isNotificationsSkipped, navigation])

        const MenuStackNavigator: React.FC<MenuStackProps> = ({ name, component }) => {
            const MainStack = createStackNavigator<MainStackParamList>()

            const ScreenWithJumbotron: React.FC<{ children: React.ReactNode }> = ({ children }) => (
                <>
                    <HeadlineJumbotron />
                    {children}
                </>
            )

            return (
                <MainStack.Navigator
                    initialRouteName="GoTFrontView"
                    screenOptions={{
                        headerShown: false,  // Global setting to hide the header
                    }}
                >
                    <MainStack.Screen name={name} component={component} />

                    <MainStack.Screen name="Organisation" component={() => (
                        <ScreenWithJumbotron>
                            <OrganisationDetailsView />
                        </ScreenWithJumbotron>
                    )} />
                    <MainStack.Screen name="Team" component={() => (
                        <ScreenWithJumbotron>
                            <TeamDetailsView />
                        </ScreenWithJumbotron>
                    )} />
                    <MainStack.Screen name="Project" component={() => (
                        <ScreenWithJumbotron>
                            <ProjectDetailsView />
                        </ScreenWithJumbotron>
                    )} />
                    <MainStack.Screen name="Task" component={() => (
                        <ScreenWithJumbotron>
                            <TaskDetailsView />
                        </ScreenWithJumbotron>
                    )} />

                    <MainStack.Screen name="Dashboard" component={() => (
                        <ScreenWithJumbotron>
                            <DashboardView />
                        </ScreenWithJumbotron>
                    )} />
                    <MainStack.Screen name="Backlog" component={() => (
                        <ScreenWithJumbotron>
                            <BacklogView />
                        </ScreenWithJumbotron>
                    )} />
                    <MainStack.Screen name="KanbanBoard" component={() => (
                        <ScreenWithJumbotron>
                            <KanbanBoardView />
                        </ScreenWithJumbotron>
                    )} />
                    <MainStack.Screen name="TimeTracks" component={() => (
                        <ScreenWithJumbotron>
                            <TimeTracksView />
                        </ScreenWithJumbotron>
                    )} />

                    <MainStack.Screen name="SignIn" component={SignInView} />
                </MainStack.Navigator>
            );
        };

        // Return other view based on active tab...
        return (
            <>
                <Tab.Navigator
                    initialRouteName="GoTFrontView"
                    screenOptions={({ route }) => ({
                        tabBarIcon: ({ focused, color, size }) => {
                            let iconName = faHome; // Default icon

                            return <FontAwesomeIcon icon={iconName} size={size} color={color} />;
                        },
                        tabBarActiveTintColor: '#0000FF',
                        tabBarInactiveTintColor: 'gray',
                        tabBarLabelStyle: {
                            fontSize: 12,
                            fontWeight: '600',
                        },
                        headerShown: false,  // Hide header title for all screens in this navigator
                    })}
                >
                    <Tab.Screen name="GoTFrontView">
                        {() => <MenuStackNavigator name="GoTFrontView" component={StartpageView} />}
                    </Tab.Screen>
                </Tab.Navigator>
            </>
        )
    }

    // Hooks
    const { } = useNotifications()

    return (
        <>
            <View style={contentStyles.contentContainer}>
                <ReturnView />
            </View>
        </>
    )
}

const contentStyles = StyleSheet.create({
    contentContainer: {
        flex: 1
    },
})

const DeviceNotLoggedIn = () => {
    const GuestStack = createStackNavigator<GuestStackParamList>()
    type NavigationProp = StackNavigationProp<GuestStackParamList>

    const navigation = useNavigation<NavigationProp>()
    useEffect(() => {
        // Dynamically navigate based on the selector values
        if (navigation.canGoBack()) {
            navigation.goBack()
        } else {
            navigation.navigate('SignInView')
        }
    }, [navigation])

    return (
        <GuestStack.Navigator
            initialRouteName="SignInView"
            screenOptions={{
                headerShown: false,  // Global setting to hide the header
            }}
        >
            <></>
            <GuestStack.Screen name="SignInView" component={SignInView} />
            {/* <GuestStack.Screen name="RegisterView" component={RegisterView} />
                <GuestStack.Screen name="ForgotPasswordView" component={ForgotPasswordView} /> */}
        </GuestStack.Navigator>
    )
}

export const cardStyles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
    },
})

const authStyles = StyleSheet.create({
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
})

export const ContentView: React.FC = () => {
    // Hooks
    const dispatch = useAppDispatch()
    const { fetchIsLoggedInStatus } = useAuthActions()

    // Redux
    const isLoggedIn = useTypedSelector(selectIsLoggedIn)

    useEffect(() => {
        const init = async () => await dispatch(fetchIsLoggedInStatus())
        init()
    }, [dispatch])

    useEffect(() => {
        if (isLoggedIn !== undefined) SplashScreen.hide()
    }, [isLoggedIn])

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
                    <View style={cardStyles.cardContainer}>
                        <ActivityIndicator size="large" color="#000" />
                    </View>
                </SafeAreaView>
            )}
        </NavigationContainer>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8', // Background color for the entire app
    },
    headlineContainer: {
        height: 80,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
    },
    headlineText: {
        fontSize: 24,
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'left',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8', // Content area background color
    },
    contentText: {
        fontSize: 18,
        color: '#333',
    },
    tabContainer: {
        flexDirection: 'row',
        height: 80,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        backgroundColor: '#ffffff',
        position: 'absolute', // Position the tab container
        bottom: 0, // Stick to the bottom
        left: 0,
        right: 0,
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeTabButton: {
        backgroundColor: 'gray',
    },
    tabText: {
        fontSize: 16,
        color: '#333',
    },
    activeTabText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
})
