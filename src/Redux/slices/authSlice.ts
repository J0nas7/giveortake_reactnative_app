// External
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Internal
import { RootState } from '@/src/Redux';
import { MainStackParamList, Organisation, TaskTimeTrack, TeamUserSeat, User } from '@/src/Types';

export type MainViewJumbotronType = {
    faIcon?: IconDefinition;
    htmlIcon?: string;
    title: string;
    iconAction?: Function,
    visibility: number;
    rightIcon?: IconDefinition;
    rightIconActionRoute?: keyof MainStackParamList;
    rightIconActionParams?: any;
}

export interface AuthState {
    isLoggedIn: boolean | undefined,
    adminLoggedIn: string,
    authUser: User | undefined,
    authUserSeat: TeamUserSeat | undefined,
    authUserSeatPermissions: string[] | undefined,
    authUserOrganisation: Organisation | undefined,
    authUserTaskTimeTrack: TaskTimeTrack | undefined,
    accessToken: string,
    refreshToken: string,
    loginResponse: Object,
    axiosGet: string,
    mainViewJumbotron: MainViewJumbotronType
}

const initialState = {
    isLoggedIn: undefined,
    adminLoggedIn: '',
    authUser: undefined,
    authUserSeat: undefined,
    authUserSeatPermissions: undefined,
    authUserOrganisation: undefined,
    authUserTaskTimeTrack: undefined,
    accessToken: '',
    refreshToken: '',
    loginResponse: {},
    axiosGet: '',
    mainViewJumbotron: { title: 'GiveorTake', visibility: 100 }
} as AuthState

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setIsLoggedIn: (state: AuthState, action: PayloadAction<any>) => {
            state.isLoggedIn = action.payload
        },
        setAuthUser: (state: AuthState, action: PayloadAction<any>) => {
            state.authUser = action.payload
        },
        setAuthUserSeat: (state: AuthState, action: PayloadAction<any>) => {
            state.authUserSeat = action.payload
        },
        setAuthUserSeatPermissions: (state: AuthState, action: PayloadAction<any>) => {
            state.authUserSeatPermissions = action.payload
        },
        setAuthUserOrganisation: (state: AuthState, action: PayloadAction<any>) => {
            state.authUserOrganisation = action.payload
        },
        setAuthUserTaskTimeTrack: (state: AuthState, action: PayloadAction<any>) => {
            state.authUserTaskTimeTrack = action.payload
        },
        setAccessToken: (state: AuthState, action: PayloadAction<any>) => {
            state.accessToken = action.payload
        },
        setRefreshToken: (state: AuthState, action: PayloadAction<any>) => {
            state.refreshToken = action.payload
        },
        setLoginResponse: (state: AuthState, action: PayloadAction<any>) => {
            state.loginResponse = action.payload
        },
        setAxiosGet: (state: AuthState, action: PayloadAction<any>) => {
            state.axiosGet = action.payload
        },
        setMainViewJumbotron: (state, action: PayloadAction<MainViewJumbotronType>) => {
            const { visibility } = action.payload;
            if (visibility < 0) {
                action.payload.visibility = 0
            } else if (visibility > 100) {
                action.payload.visibility = 100
            }

            state.mainViewJumbotron = action.payload;
        }
    }
})

const { actions } = authSlice
export const {
    setIsLoggedIn,
    setAuthUser,
    setAuthUserSeat,
    setAuthUserSeatPermissions,
    setAuthUserOrganisation,
    setAuthUserTaskTimeTrack,
    setAccessToken,
    setRefreshToken,
    setLoginResponse,
    setAxiosGet,
    setMainViewJumbotron
} = actions

export default authSlice.reducer

export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn
export const selectAuthUser = (state: RootState) => state.auth.authUser
export const selectAuthUserSeat = (state: RootState) => state.auth.authUserSeat
export const selectAuthUserSeatPermissions = (state: RootState) => state.auth?.authUserSeatPermissions ?? []; // Return empty array if undefined
export const selectAuthUserOrganisation = (state: RootState) => state.auth.authUserOrganisation
export const selectAuthUserTaskTimeTrack = (state: RootState) => state.auth.authUserTaskTimeTrack
export const selectAccessToken = (state: RootState) => state.auth.accessToken
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken
export const selectLoginResponse = (state: RootState) => state.auth.loginResponse
export const selectAxiosGet = (state: RootState) => state.auth.axiosGet
export const selectMainViewJumbotron = (state: RootState) => state.auth.mainViewJumbotron
