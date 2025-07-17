import { GuestStackParamList } from '@/src/Types'
import { SignInView } from '@/src/Views'
import { useNavigation } from '@react-navigation/native'
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack'
import { useEffect } from 'react'

export const DeviceNotLoggedIn = () => {
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
