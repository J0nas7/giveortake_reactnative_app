import { readonlyVsEditorStyles } from '@/src/Core-UI/ReadonlyVsEditorStyles';
import { MainStackParamList } from '@/src/Types';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { NavigationProp } from '@react-navigation/native';
import { Text, TouchableOpacity, View } from 'react-native';

type HeaderProps = {
    teamName: string;
    teamId?: string | number;
    canModifyTeamSettings?: boolean;
    canManageTeamMembers?: boolean;
    showEditToggles: boolean;
    setShowEditToggles: React.Dispatch<React.SetStateAction<boolean>>;
    navigation: NavigationProp<MainStackParamList>;
};

export const TeamHeader: React.FC<HeaderProps> = ({
    teamName,
    teamId,
    canModifyTeamSettings,
    canManageTeamMembers,
    showEditToggles,
    setShowEditToggles,
    navigation,
}) => (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={readonlyVsEditorStyles.title}>{teamName}</Text>
        {canModifyTeamSettings && (
            <View style={{ flexDirection: "row", gap: 12 }}>
                {canManageTeamMembers && showEditToggles && (
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate("TeamRolesSeatsManager", {
                                id: (teamId || "").toString(),
                            })
                        }
                    >
                        <FontAwesomeIcon icon={faUsers} size={20} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setShowEditToggles(!showEditToggles)}>
                    <Text style={{ color: "blue", fontSize: 16 }}>{showEditToggles ? "OK" : "Edit"}</Text>
                </TouchableOpacity>
            </View>
        )}
    </View>
);
