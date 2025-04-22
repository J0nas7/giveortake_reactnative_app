// External
import React, { useEffect, useState } from 'react'
import SplashScreen from 'react-native-splash-screen'
import { getFocusedRouteNameFromRoute, NavigationContainer, useNavigation, useNavigationState } from '@react-navigation/native'
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
import { faBuilding, faClock, faGauge, faHouseChimney, faLightbulb, faList, faUsers, faWindowRestore } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import DashboardView from './DashboardView'
import { TaskTimeTrackPlayer } from '../Components/TaskTimeTrackPlayer'
import { current } from '@reduxjs/toolkit'

type MenuStackProps = { name: keyof MainStackParamList; component: React.FC<{}> }

const DeviceIsLoggedIn = () => {
    type NavigationProp = StackNavigationProp<MainStackParamList>

    const ReturnView = () => {
        const Tab = createBottomTabNavigator()
        const navigation = useNavigation<NavigationProp>()

        const currentRoute = useNavigationState((state) => {
            if (!state) return null; // Handle undefined state
            const tabRoute = state.routes[state.index];
            // If tabRoute has nested routes (like stacks), you may want to go deeper:
            const nestedRoute = tabRoute?.state?.routes?.[tabRoute.state.index ?? 0]?.name;
            return nestedRoute ?? tabRoute?.name;
        });

        const routesNotInBottomNav: { name: keyof MainStackParamList; component: React.FC }[] = [
            { name: "Organisation", component: OrganisationDetailsView },
            { name: "Team", component: TeamDetailsView },
            { name: "Project", component: ProjectDetailsView },
            { name: "Task", component: TaskDetailsView }
        ];

        const routesInBottomNav: { name: keyof MainStackParamList; component: React.FC }[] = [
            { name: "Home", component: StartpageView },
            { name: "Dashboard", component: DashboardView },
            { name: "Backlog", component: BacklogView },
            { name: "Kanban", component: KanbanBoardView },
            { name: "Time", component: TimeTracksView },
        ];

        const isNotificationsDetermined = useTypedSelector(selectIsNotificationsDetermined)
        const isNotificationsSkipped = useTypedSelector(selectIsNotificationsSkipped)

        useEffect(() => {
            if (isNotificationsDetermined === false && isNotificationsSkipped === false) {
                navigation.navigate('NotificationsInstructionsView')
            } else {
                navigation.navigate('Home')
            }
        }, [isNotificationsDetermined, isNotificationsSkipped, navigation])

        const MenuStackNavigator: React.FC<MenuStackProps> = ({ name, component }) => {
            const MainStack = createStackNavigator<MainStackParamList>()

            const ScreenWithJumbotron: React.FC<{ children: React.ReactNode }> = ({ children }) => (
                <>
                    <HeadlineJumbotron />
                    {children}
                    <TaskTimeTrackPlayer />
                </>
            );

            const withJumbotron = (Component: React.FC): React.FC => {
                return (props: any) => (
                    <ScreenWithJumbotron>
                        <Component {...props} />
                    </ScreenWithJumbotron>
                );
            };

            return (
                <MainStack.Navigator initialRouteName={name} screenOptions={{ headerShown: false }}>
                    <MainStack.Screen
                        name={name}
                        component={withJumbotron(component)}
                        initialParams={{ id: '1' }}
                    />
                    {routesNotInBottomNav.map(({ name: subname, component }) => {
                        // let initialParams: { id: string; projectKey?: string; taskKey?: string } = { id: '1' }
                        // if (subname === "Task") {
                        //     initialParams = { id: '', projectKey: '', taskKey: '' }
                        // }
                        
                        return (
                            <MainStack.Screen
                                key={subname}
                                name={subname}
                                component={withJumbotron(component)}
                                // initialParams={initialParams}
                            />
                        )
                    })}
                </MainStack.Navigator>
            );
        };

        // Return other view based on active tab...
        return (
            <>
                <Tab.Navigator
                    initialRouteName="Home"
                    screenOptions={({ route }) => ({
                        tabBarIcon: ({ focused, color, size }) => {
                            let iconName = faHouseChimney; // Default icon

                            if (route.name === 'Home') {
                                iconName = faHouseChimney
                            } else if (route.name === 'Organisation') {
                                iconName = faBuilding
                            } else if (route.name === 'Team') {
                                iconName = faUsers
                            } else if (route.name === 'Project') {
                                iconName = faLightbulb
                            } else if (route.name === 'Dashboard') {
                                iconName = faGauge
                            } else if (route.name === 'Backlog') {
                                iconName = faList
                            } else if (route.name === 'Kanban') {
                                iconName = faWindowRestore
                            } else if (route.name === 'Time') {
                                iconName = faClock
                            }

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
                    {routesInBottomNav.map(({ name, component }) => {
                        return (
                            <Tab.Screen name={name} key={name}>
                                {() => <MenuStackNavigator name={name} component={component} />}
                            </Tab.Screen>
                        )
                    })}
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
