import { MainStackParamList } from '@/src/Types'
import { NavigationProp } from '@react-navigation/native'
import { TFunction } from 'i18next'
import React, { Dispatch, RefObject, SetStateAction } from 'react'
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Camera, CameraDevice, CodeScanner } from 'react-native-vision-camera'

export type SignInProps = {
    device: CameraDevice | undefined
    cameraRef: RefObject<Camera | null>
    codeScanner: CodeScanner
    t: TFunction<[string], undefined>
    navigation: NavigationProp<MainStackParamList>
    userEmail: string
    setUserEmail: Dispatch<SetStateAction<string>>
    loginPending: boolean
    setLoginPending: Dispatch<SetStateAction<boolean>>
    userPassword: string
    setUserPassword: Dispatch<SetStateAction<string>>
    showPassword: boolean
    setShowPassword: Dispatch<SetStateAction<boolean>>
    doLogin: () => void
    doScanQR: () => void
}

export const SignIn: React.FC<SignInProps> = ({
    device,
    cameraRef,
    codeScanner,
    t,
    navigation,
    userEmail,
    setUserEmail,
    loginPending,
    setLoginPending,
    userPassword,
    setUserPassword,
    showPassword,
    setShowPassword,
    doLogin,
    doScanQR
}) => {
    if (device) {
        return (
            <Camera
                ref={cameraRef}
                style={styles.preview}
                device={device}
                isActive={true}
                codeScanner={codeScanner}
            />
        )
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

            <View style={{ width: "100%", display: "flex", alignItems: "center" }}>
                {loginPending ? (
                    <ActivityIndicator size="small" color="#000" />
                ) : (
                    <View style={{ width: "100%" }}>
                        <TouchableOpacity style={styles.button} onPress={doLogin} disabled={loginPending}>
                            <Text style={styles.buttonText}>{t('guest:forms:buttons:Login')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.button} onPress={doScanQR}>
                            <Text style={styles.buttonText}>{t('guest:forms:buttons:LoginByQR')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

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
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
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
