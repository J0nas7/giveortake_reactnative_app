import { readonlyVsEditorStyles } from '@/src/Core-UI/ReadonlyVsEditorStyles';
import { Text, TouchableOpacity, View } from 'react-native';

type HeaderProps = {
    organisationName: string;
    canEdit: boolean;
    showEditToggles: boolean;
    setShowEditToggles: React.Dispatch<React.SetStateAction<boolean>>;
};

export const OrganisationHeader: React.FC<HeaderProps> = ({
    organisationName,
    canEdit,
    showEditToggles,
    setShowEditToggles
}) => (
    <View style={readonlyVsEditorStyles.headerRow}>
        <Text style={readonlyVsEditorStyles.title}>{organisationName}</Text>
        {canEdit && (
            <TouchableOpacity onPress={() => setShowEditToggles(!showEditToggles)}>
                <Text style={{ color: 'blue', fontSize: 16 }}>{showEditToggles ? 'OK' : 'Edit'}</Text>
            </TouchableOpacity>
        )}
    </View>
);
