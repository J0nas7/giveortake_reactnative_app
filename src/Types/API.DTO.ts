import { NavigatorScreenParams } from '@react-navigation/native';

export type apiResponseDTO = {
    success: boolean,
    message: string,
    data: any
}

export type axiosHeaders = {
    Accept: string;
    Authorization: string;
    "Content-Type"?: string;
}

export interface NotificationContent {
    title: string;
    message: string;
    soundName?: string; // Optional path or name of the sound file
    category?: string;  // Optional identifier for the notification category
    date?: number;        // Optional date for scheduling the notification
}

export type MainStackParamList = {
    Home: undefined; // No params
    HomeTab: undefined; // No params
    NotificationsInstructionsView: undefined; // No params
    Organisation: { id: string }; // Requires an id parameter
    Team: { id: string }; // Requires an id parameter
    CreateTeam: { id: string }; // Requires an id parameter
    Project: { id: string }; // Requires an id parameter
    Backlogs: { id: string }; // Requires an id parameter
    BacklogsTab: { id: string }; // Requires an id parameter
    Task: { projectKey: string; taskKey: string }; // Requires projectKey and taskKey parameters
    Media: { projectKey: string; taskKey: string, mediaID: string }; // Requires projectKey and taskKey parameters

    Dashboard: { id: string }; // Requires an id parameter
    DashboardTab: { id: string }; // Requires an id parameter
    Backlog: { id: string }; // Requires an id parameter
    CreateBacklog: { id: string }; // Requires an id parameter
    Kanban: { id: string }; // Requires an id parameter
    KanbanTab: { id: string }; // Requires an id parameter
    Time: { id: string }; // Requires an id parameter
    TimeTab: { id: string }; // Requires an id parameter

    Downloaded: undefined; // No params
    Profile: undefined; // No params
    SignIn: undefined; // No params
};

type BottomTabParamListType = NavigatorScreenParams<MainStackParamList>

export type BottomTabParamList = {
    HomeTab: BottomTabParamListType;
    DashboardTab: BottomTabParamListType;
    BacklogsTab: BottomTabParamListType;
    KanbanTab: BottomTabParamListType;
    TimeTab: BottomTabParamListType;
}

export type GuestStackParamList = {
    ForgotPasswordView: undefined; // No params
    RegisterView: undefined; // No params
    SignInView: undefined; // No params
};

export type postContent = { [key: string]: any }
