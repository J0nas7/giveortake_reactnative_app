import { readonlyVsEditorStyles } from '@/src/Core-UI/ReadonlyVsEditorStyles';
import { Text, TouchableOpacity, View } from 'react-native';

type HeaderProps = {
    name: string;
    showEditToggles: boolean;
    setShowEditToggles: (val: boolean) => void;
    canManageProject: boolean | undefined;
};

export const ProjectHeader: React.FC<HeaderProps> = ({
    name,
    showEditToggles,
    setShowEditToggles,
    canManageProject
}) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={readonlyVsEditorStyles.title}>{name}</Text>
        {canManageProject && (
            <TouchableOpacity onPress={() => setShowEditToggles(!showEditToggles)}>
                <Text style={{ color: 'blue', fontSize: 16 }}>{showEditToggles ? 'OK' : 'Edit'}</Text>
            </TouchableOpacity>
        )}
    </View>
);
