// External
import { useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useDispatch } from "react-redux"
import { useNavigation } from "@react-navigation/native"

// Internal
import { useAxios } from './'
import { apiResponseDTO, User } from "@/src/Types"
import {
    setIsLoggedIn,
    setAccessToken,
    setAuthUser,
    AppDispatch,
    useAuthActions,
} from '@/src/Redux'
import { StackNavigationProp } from "@react-navigation/stack"
import { MainStackParamList } from "@/src/Types"
import { Alert } from "react-native"
import { env, paths } from "../env"
import axios from "axios"

export const useAuth = () => {
    const { httpPostWithData } = useAxios()
    const { fetchIsLoggedInStatus } = useAuthActions()

    const dispatch = useDispatch<AppDispatch>()
    const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();

    const [errorMsg, setErrorMsg] = useState<string>('')
    const [status, setStatus] = useState<string>('')

    const saveLoginSuccess = async (loginData: any) => {
        const newAccessToken = loginData.accessToken
        const newAuthUser = loginData.user

        console.log("saveLoginSuccess", newAccessToken, newAuthUser)
        await AsyncStorage.setItem("accessToken", newAccessToken)

        dispatch(setAccessToken(newAccessToken))
        dispatch(setIsLoggedIn(true))
        dispatch(setAuthUser(newAuthUser))

        navigation.navigate("Home")
        return true
    }

    const processResult = (fromAction: string, theResult: apiResponseDTO) => {
        if (fromAction !== 'login') return false

        setStatus('resolved')

        if (theResult.success === true) {
            console.log("User logged in:", theResult.data)
            return saveLoginSuccess(theResult.data)
        }

        console.log("Login failed", theResult)
        setErrorMsg(theResult.message || "Login failed.")
        return false
    }

    const handleLoginSubmit = async (emailInput: string, passwordInput: string): Promise<boolean> => {
        setStatus('resolving')
        let errorData: apiResponseDTO
        let error = false

        if (!emailInput || !passwordInput) {
            errorData = {
                success: false,
                message: "Missing necessary credentials.",
                data: false,
            }
            error = true
        }

        const loginVariables = {
            User_Email: emailInput,
            password: passwordInput,
        }

        try {
            if (!error) {
                const data = await httpPostWithData("auth/login", loginVariables)
                return processResult("login", data)
            }
        } catch (e) {
            console.log("useAuth login error", e)
            errorData = {
                success: false,
                message: "Login failed. Try again.",
                data: false,
            }
            error = true
        }

        processResult("login", errorData!)
        return false
    }

    const handleLoginByQR = async (scannedToken: string): Promise<boolean> => {
        try {
            let axiosUrl = `${env.url.API_URL + paths.API_ROUTE + "auth/clone-token"}`
            const response = await axios.post(
                axiosUrl,
                {}, // No body needed in this case
                {
                    headers: {
                        Authorization: `Bearer ${scannedToken}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );

            const data = response.data;

            if (data.success) {
                const newAccessToken = data.data.accessToken;
                await AsyncStorage.setItem('accessToken', newAccessToken);
                console.log("Token clone success:", data);

                return processResult("login", data)
            } else {
                console.warn('Token clone failed', data.error || data.message);
            }
        } catch (error: any) {
            console.error('Clone token request failed:', error.response?.data || error.message);
        }
        return false
    }

    const handleLogoutSubmit = async () => {
        // Clear user data
        await AsyncStorage.removeItem("accessToken")
        dispatch(setAccessToken(""))
        dispatch(setIsLoggedIn(false))
        dispatch(setAuthUser(undefined))
        navigation.navigate("SignIn")  // Navigate to sign-in screen after logout
    }

    // Check if the user is logged in when the app starts
    useEffect(() => {
        const checkLoginStatus = async () => {
            const accessToken = await AsyncStorage.getItem("accessToken")
            if (accessToken) {
                dispatch(setAccessToken(accessToken))
                dispatch(setIsLoggedIn(true))
                dispatch(fetchIsLoggedInStatus())
            } else {
                dispatch(setAccessToken(""))
                dispatch(setIsLoggedIn(false))
            }
        }

        checkLoginStatus()
    }, [dispatch])

    return {
        saveLoginSuccess,
        handleLoginSubmit,
        handleLoginByQR,
        handleLogoutSubmit,
        errorMsg,
        status,
    }
}
