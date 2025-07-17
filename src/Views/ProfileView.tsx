import { Profile, ProfileProps } from '@/src/Components/Misc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
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

    const profileProps: ProfileProps = {
        accessToken,
        handleLogoutSubmit
    }

    return <Profile {...profileProps} />
}
