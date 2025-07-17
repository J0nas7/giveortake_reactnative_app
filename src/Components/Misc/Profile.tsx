import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export type ProfileProps = {
    accessToken: string | null
    handleLogoutSubmit: () => Promise<void>
}

export const Profile: React.FC<ProfileProps> = ({
    accessToken,
    handleLogoutSubmit
}) => accessToken && (
    <View style={{ alignItems: 'center', marginTop: 50, display: 'flex', gap: 20 }}>
        <QRCode value={JSON.stringify({ accessToken })} size={200} />

        <TouchableOpacity onPress={handleLogoutSubmit} style={{ backgroundColor: "#1ab11f", borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 12 }}>
            <Text>Logout</Text>
        </TouchableOpacity>
    </View>
);
