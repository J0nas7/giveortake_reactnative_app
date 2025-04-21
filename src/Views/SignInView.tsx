import React, { FormEvent, useEffect, useState } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Keyboard,
    StyleSheet,
    Platform,
    Alert
} from "react-native"
import { useTranslation } from "react-i18next"
import { NavigationProp, useNavigation } from "@react-navigation/native"

// Internal
import { useAuth } from "@/src/Hooks"
import { MainStackParamList } from "../Types"

export const SignInView = () => {
    const { handleLoginSubmit } = useAuth()
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();

    const { t } = useTranslation(['guest'])
    const [userEmail, setUserEmail] = useState<string>(
        __DEV__ ? 'buzz@givetake.net' : ''
    )
    const [userPassword, setUserPassword] = useState<string>(
        __DEV__ ? 'Lightyear' : ''
    )
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [loginPending, setLoginPending] = useState<boolean>(false)

    // Methods
    const doLogin = () => {
        if (loginPending) return
        setLoginPending(true)

        handleLoginSubmit(userEmail, userPassword)
            .then((loginResult) => {
                if (loginResult) {
                    // Handle successful login
                    // You can use navigation to route after login
                }
            })
            .finally(() => {
                setLoginPending(false)
            })
    }

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder={t('guest:forms:Email')}
                value={userEmail}
                onChangeText={setUserEmail}
                autoCapitalize="none"
                editable={!loginPending}
                onSubmitEditing={doLogin}
                keyboardType="email-address"
            />

            <View style={styles.passwordWrapper}>
                <TextInput
                    style={styles.input}
                    placeholder={t('guest:forms:Password')}
                    value={userPassword}
                    onChangeText={setUserPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!loginPending}
                    onSubmitEditing={doLogin}
                />
                <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                    <Text style={styles.toggleText}>
                        {showPassword ? t('guest:forms:Hide') : t('guest:forms:Show')}
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={doLogin} disabled={loginPending}>
                <Text style={styles.buttonText}>{t('guest:forms:buttons:Login')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword' as never)}>
                <Text style={styles.link}>{t('guest:links:Did-you-forget-your-password')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('RegisterAccount' as never)}>
                <Text style={styles.link}>{t('guest:links:Create-a-new-account')}</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center"
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 12,
        marginVertical: 8
    },
    passwordWrapper: {
        position: "relative"
    },
    toggleText: {
        color: "#1ab11f",
        fontWeight: "bold",
        position: "absolute",
        right: 10,
        top: 15
    },
    button: {
        backgroundColor: "#1ab11f",
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 12
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold"
    },
    link: {
        color: "#1ab11f",
        fontWeight: "bold",
        marginTop: 12,
        textAlign: "center"
    }
})
