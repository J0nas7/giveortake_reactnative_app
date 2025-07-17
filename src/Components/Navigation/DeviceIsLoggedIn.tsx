import { SnackBar } from '@/src/Components/SnackBar';
import { TaskTimeTrackPlayer } from '@/src/Components/TaskTimeTrackPlayer';
import { useTaskTimeTrackContext } from '@/src/Contexts';
import { HeadlineJumbotron } from '@/src/Core-UI/HeadlineJumbotron';
import { useNotifications } from '@/src/Hooks';
import { selectAuthUserTaskTimeTrack, selectIsNotificationsDetermined, selectIsNotificationsSkipped, useTypedSelector } from '@/src/Redux';
import { MainStackParamList } from '@/src/Types';
import {
    BacklogDetailsView,
    BacklogsView,
    BacklogView,
    CreateBacklogView,
    CreateProjectView,
    CreateTeamView,
    DashboardView,
    DownloadedMediaFilesView,
    KanbanBoardView,
    MediaFileView,
    OrganisationDetailsView,
    ProfileView,
    ProjectDetailsView,
    StartpageView,
    TaskDetailsView,
    TeamDetailsView,
    TeamRolesSeatsView,
    TimeTracksView
} from '@/src/Views';
import { faBuilding, faClock, faGauge, faHouseChimney, faLightbulb, faList, faUsers, faWindowRestore } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { useEffect } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

type MenuStackProps = { name: keyof MainStackParamList; component: React.FC<{}> }

export const DeviceIsLoggedIn = () => {
    type NavigationProp = StackNavigationProp<MainStackParamList>

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
        { name: "CreateTeam", component: CreateTeamView },
        { name: "TeamRolesSeatsManager", component: TeamRolesSeatsView },
        { name: "Project", component: ProjectDetailsView },
        { name: "CreateProject", component: CreateProjectView },
        { name: "CreateBacklog", component: CreateBacklogView },
        { name: "Backlogs", component: BacklogsView },
        { name: "BacklogDetails", component: BacklogDetailsView },
        { name: "Task", component: TaskDetailsView },
        { name: "Media", component: MediaFileView },
        { name: "Downloaded", component: DownloadedMediaFilesView },
        { name: "Profile", component: ProfileView }
    ]

    const routesInBottomNav: { tab: keyof MainStackParamList; name: keyof MainStackParamList; component: React.FC<any> }[] = [
        { tab: "Home", name: "HomeTab", component: StartpageView },
        { tab: "Dashboard", name: "DashboardTab", component: DashboardView },
        { tab: "Backlog", name: "BacklogTab", component: BacklogView },
        { tab: "Kanban", name: "KanbanTab", component: KanbanBoardView },
        { tab: "Time", name: "TimeTab", component: TimeTracksView },
    ]

    const isNotificationsDetermined = useTypedSelector(selectIsNotificationsDetermined)
    const isNotificationsSkipped = useTypedSelector(selectIsNotificationsSkipped)

    // useEffect(() => {
    //     // TODO
    //     if (isNotificationsDetermined === false && isNotificationsSkipped === false) {
    //         navigation.navigate('NotificationsInstructionsView')
    //     } else {
    //         navigation.navigate('Home')
    //     }
    // }, [isNotificationsDetermined, isNotificationsSkipped, navigation])

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
            return function WrappedWithJumbotron(props) {
                console.log("withJumbotron ROUTE PARAM:", props)
                return (
                    <ScreenWithJumbotron>
                        <Component {...props} />
                    </ScreenWithJumbotron>
                );
            };
        };

        return (
            <MainStack.Navigator initialRouteName={name} screenOptions={{ headerShown: false }}>
                <MainStack.Screen
                    name={name}
                    // component={(props: any) => withJumbotron(component)({ ...props })}
                    component={withJumbotron(component)}
                // initialParams={{ id: '' }}
                />
                {routesNotInBottomNav.map(({ name: subname, component }) => {
                    return (
                        <MainStack.Screen
                            key={subname}
                            name={subname}
                            // component={(props: any) => withJumbotron(component)({ ...props })}
                            component={withJumbotron(component)}
                        />
                    )
                })}
            </MainStack.Navigator>
        );
    };

    // Hooks
    const { } = useNotifications()

    return (
        <View style={loggedInStyles.contentContainer}>
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
                {routesInBottomNav.map(({ tab, name, component }) => {
                    return (
                        <Tab.Screen name={tab} key={tab}>
                            {() => <MenuStackNavigator name={name} component={component} />}
                        </Tab.Screen>
                    )
                })}
            </Tab.Navigator>
        </View>
    )
}

const loggedInStyles = StyleSheet.create({
    contentContainer: {
        flex: 1
    },
})
