import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { Camera, CameraDevice, Code, useCameraDevices, useCodeScanner } from 'react-native-vision-camera';

// Internal
import { useAuth } from "@/src/Hooks";
import { faQrcode } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { MainStackParamList } from "../Types";

export const SignInView = () => {
    const { handleLoginSubmit, handleLoginByQR } = useAuth()
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();

    const { t } = useTranslation(['guest'])
    const [userEmail, setUserEmail] = useState<string>(
        __DEV__ ? 'buzz@givetake.net' : ''
        // __DEV__ ? 'charlie@givetake.net' : ''
    )
    const [userPassword, setUserPassword] = useState<string>(
        __DEV__ ? 'Lightyear' : ''
        // __DEV__ ? 'password123' : ''
    )
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [loginPending, setLoginPending] = useState<boolean>(false)

    const cameraRef = useRef<Camera>(null);
    const devices = useCameraDevices();
    const [device, setDevice] = useState<CameraDevice | undefined>(undefined)
    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: (codes) => {
            if (codes.length > 0) {
                onCodeScanned(codes);
            }
        }
    })

    // Methods
    const onCodeScanned = async (codes: Code[]) => {
        if (loginPending) return
        setLoginPending(true)
        const scannedToken = codes[0]?.value;
        if (!scannedToken) return;
        setDevice(undefined) // Stop scanning

        handleLoginByQR(scannedToken)
            .then((loginResult) => {
                if (loginResult) {
                    // Handle successful login
                    // You can use navigation to route after login
                }
            })
            .finally(() => {
                setLoginPending(false)
            })
    };

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

    const doScanQR = () => setDevice(devices.find((d) => d.position === "back"))

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
                            <FontAwesomeIcon icon={faQrcode} size={20} />
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
