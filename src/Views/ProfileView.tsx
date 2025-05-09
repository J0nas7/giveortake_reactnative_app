import { useEffect, useState } from 'react';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View } from 'react-native';

export const ProfileView = () => {
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
        <View style={{ alignItems: 'center', marginTop: 50 }}>
            <QRCode value={JSON.stringify({ accessToken })} size={200} />
        </View>
    );
}
