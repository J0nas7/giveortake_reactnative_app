// External
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer, useNavigation, useNavigationState } from '@react-navigation/native'
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, AppState, AppStateStatus, Linking, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import SplashScreen from 'react-native-splash-screen'

// Internal
import { SnackBar } from '@/src/Components/SnackBar'
import { useNotifications } from '@/src/Hooks'
import {
    selectAuthUserTaskTimeTrack,
    selectIsLoggedIn,
    selectIsNotificationsDetermined,
    selectIsNotificationsSkipped,
    useAppDispatch,
    useAuthActions,
    useTypedSelector
} from '@/src/Redux'
import { GuestStackParamList, MainStackParamList } from '@/src/Types'
import {
    BacklogPage,
    CreateBacklog,
    DownloadedMediaFilesView,
    KanbanBoardView,
    MediaFileView,
    OrganisationDetailsView,
    ProfileView,
    ProjectDetailsView,
    SignInView,
    StartpageView,
    TaskDetailsView,
    TeamDetailsView,
    TimeTracksView
} from '@/src/Views'
import { BacklogsPage } from '@/src/Views/BacklogsView'
import { faBuilding, faClock, faGauge, faHouseChimney, faLightbulb, faList, faUsers, faWindowRestore } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { TaskTimeTrackPlayer } from '../Components/TaskTimeTrackPlayer'
import { useTaskTimeTrackContext } from '../Contexts'
import { HeadlineJumbotron } from '../Core-UI/HeadlineJumbotron'
import DashboardView from './DashboardView'

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
            { name: "CreateBacklog", component: CreateBacklog },
            { name: "Backlog", component: BacklogPage },
            { name: "Task", component: TaskDetailsView },
            { name: "Media", component: MediaFileView },
            { name: "Downloaded", component: DownloadedMediaFilesView },
            { name: "Profile", component: ProfileView }
        ];

        const routesInBottomNav: { name: keyof MainStackParamList; component: React.FC }[] = [
            { name: "Home", component: StartpageView },
            { name: "Dashboard", component: DashboardView },
            { name: "Backlogs", component: BacklogsPage },
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

            const ScreenWithJumbotron: React.FC<{ children: React.ReactNode }> = ({ children }) => {
                const { handleTaskTimeTrack } = useTaskTimeTrackContext();
                const taskTimeTrack = useTypedSelector(selectAuthUserTaskTimeTrack);

                useEffect(() => {
                    if (!taskTimeTrack) return;

                    const handleUrl = (event: { url: string }) => {
                        console.log('handleURL received', event.url)
                        if (event.url === 'giveortake://endLiveActivity') {
                            handleTaskTimeTrack('Stop', taskTimeTrack.task!)
                        }
                    };

                    const subscription = Linking.addEventListener('url', handleUrl);

                    // Check if app opened via link
                    Linking.getInitialURL().then((url) => {
                        console.log('getInitialURL received', url)
                        if (url === 'giveortake://endLiveActivity') {
                            handleTaskTimeTrack('Stop', taskTimeTrack.task!)
                        }
                    });

                    return () => subscription.remove()
                }, [taskTimeTrack]);

                return (
                    <>
                        <HeadlineJumbotron />
                        {children}
                        <TaskTimeTrackPlayer />
                        <SnackBar />
                    </>
                )
            };

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
                            } else if (route.name === 'Backlog' || route.name === 'Backlogs') {
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
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 40, fontWeight: 'bold' }}>Give or Take</Text>
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
                    <View style={cardStyles.cardContainer}>
                        <ActivityIndicator size="large" color="#000" />
                        <Text>Lorem ipsum</Text>
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
