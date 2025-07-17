import { BacklogStates, MainStackParamList } from '@/src/Types';
import { NavigationProp } from '@react-navigation/native';
import { Text, TouchableOpacity, View } from 'react-native';

type HeaderProps = {
    canAccessBacklog: boolean | undefined
    localBacklog: BacklogStates;
    navigation: NavigationProp<MainStackParamList>
}

export const BacklogHeader: React.FC<Partial<HeaderProps>> = ({
    canAccessBacklog,
    localBacklog,
    navigation
}) => localBacklog && navigation && (
    <View>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
            {localBacklog?.Backlog_Name || 'Backlog'}
        </Text>

        {canAccessBacklog && localBacklog && (
            <View style={{ flexDirection: 'row', gap: 10, marginVertical: 10 }}>
                <TouchableOpacity onPress={() =>
                    navigation.navigate("Backlog", { id: (localBacklog.Backlog_ID || "").toString() })
                }>
                    <Text style={{ color: 'blue' }}>Go to Backlog</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() =>
                    navigation.navigate("Project", { id: (localBacklog.Project_ID || "").toString() })
                }>
                    <Text style={{ color: 'blue' }}>Go to Project</Text>
                </TouchableOpacity>
            </View>
        )}
    </View>
);
