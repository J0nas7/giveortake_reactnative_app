import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Alert } from 'react-native';

interface Notification {
    id: string;
    title: string;
    message: string;
    // Add any other relevant fields
}

interface NotificationsState {
    unreadNotifications: Notification[];
    unreadCounter: number;
    notificationEnabled: boolean;
    isNotificationsDetermined: boolean | undefined;
    isNotificationsDenied: boolean | undefined;
    isNotificationsSkipped: boolean | undefined;
    notificationData: { [key: string]: string } | boolean | undefined;
}

const initialState: NotificationsState = {
    unreadNotifications: [],
    unreadCounter: 0,
    notificationEnabled: false,
    isNotificationsDetermined: undefined,
    isNotificationsDenied: undefined,
    isNotificationsSkipped: undefined,
    notificationData: undefined,
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        setNotificationEnabled: (state, action: PayloadAction<boolean>) => {
            state.notificationEnabled = action.payload;
        },
        setIsNotificationsDetermined: (state, action: PayloadAction<boolean | undefined>) => {
            state.isNotificationsDetermined = action.payload;
        },
        setIsNotificationsDenied: (state, action: PayloadAction<boolean | undefined>) => {
            state.isNotificationsDenied = action.payload;
        },
        setIsNotificationsSkipped: (state, action: PayloadAction<boolean | undefined>) => {
            state.isNotificationsSkipped = action.payload;
        },
        addNotification: (state, action: PayloadAction<Notification>) => {
            state.unreadNotifications.push(action.payload);
            state.unreadCounter += 1;
        },
        markNotificationAsRead: (state, action: PayloadAction<string>) => {
            const index = state.unreadNotifications.findIndex(
                (notification) => notification.id === action.payload
            );
            if (index !== -1) {
                state.unreadNotifications.splice(index, 1);
                state.unreadCounter = Math.max(0, state.unreadCounter - 1);
            }
        },
        clearAllNotifications: (state) => {
            state.unreadNotifications = [];
            state.unreadCounter = 0;
        },
        setNotificationData: (state, action: PayloadAction<
            { [key: string]: string } | boolean
        >) => {
            state.notificationData = action.payload;
        },
    },
});

// Export actions and reducer
export const {
    setNotificationEnabled,
    setIsNotificationsDetermined,
    setIsNotificationsDenied,
    setIsNotificationsSkipped,
    addNotification,
    markNotificationAsRead,
    clearAllNotifications,
    setNotificationData
} = notificationSlice.actions;

export default notificationSlice.reducer;

// Selectors
export const selectUnreadNotifications = (state: RootState) => state.notifications.unreadNotifications;
export const selectUnreadCounter = (state: RootState) => state.notifications.unreadCounter;
export const selectNotificationEnabled = (state: RootState) => state.notifications.notificationEnabled;
export const selectIsNotificationsDetermined = (state: RootState) => state.notifications.isNotificationsDetermined
export const selectIsNotificationsDenied = (state: RootState) => state.notifications.isNotificationsDenied
export const selectIsNotificationsSkipped = (state: RootState) => state.notifications.isNotificationsSkipped
export const selectNotificationData = (state: RootState) => state.notifications.notificationData
