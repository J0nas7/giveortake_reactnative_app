import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Camera, CameraDevice, Code, useCameraDevices, useCodeScanner } from 'react-native-vision-camera';

// Internal
import { SignIn } from '@/src/Components/Auth';
import { useAuth } from "@/src/Hooks";
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

    return (
        <SignIn
            device={device}
            cameraRef={cameraRef}
            codeScanner={codeScanner}
            t={t}
            navigation={navigation}
            userEmail={userEmail}
            setUserEmail={setUserEmail}
            loginPending={loginPending}
            setLoginPending={setLoginPending}
            userPassword={userPassword}
            setUserPassword={setUserPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            doLogin={doLogin}
            doScanQR={doScanQR}
        />
    )
}
