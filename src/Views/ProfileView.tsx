import { useEffect, useState } from 'react';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../Hooks';

export const ProfileView = () => {
    const { handleLogoutSubmit } = useAuth()
    const [accessToken, setAccessToken] = useState<string | null>(null);

    useEffect(() => {
        const loadToken = async () => {
            const token = await AsyncStorage.getItem('accessToken');
            setAccessToken(token);
        };
        loadToken();
    }, []);

    if (!accessToken) return <Text>Loading...</Text>;
    
    return (
        <View style={{ alignItems: 'center', marginTop: 50, display: 'flex', gap: 20 }}>
            <QRCode value={JSON.stringify({ accessToken })} size={200} />

            <TouchableOpacity onPress={handleLogoutSubmit} style={{ backgroundColor: "#1ab11f", borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 12 }}>
                <Text>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}
