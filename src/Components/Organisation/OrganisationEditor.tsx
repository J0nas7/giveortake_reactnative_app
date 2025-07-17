import { editorStyles, inputStyle } from '@/src/Components/ModalToggler';
import { readonlyVsEditorStyles } from '@/src/Core-UI/ReadonlyVsEditorStyles';
import { MainStackParamList, OrganisationStates } from '@/src/Types';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { NavigationProp } from '@react-navigation/native';
import { Button, Text, TextInput, TouchableOpacity, View } from 'react-native';

type EditorProps = {
    organisation: OrganisationStates;
    onChange: (field: string, value: string) => void;
    onSave: () => void;
    onDelete: () => void;
    navigation: NavigationProp<MainStackParamList>;
};

export const OrganisationEditor: React.FC<EditorProps> = ({
    organisation,
    onChange,
    onSave,
    onDelete,
    navigation
}) => organisation && (
    <View style={readonlyVsEditorStyles.section}>
        <View style={editorStyles.formGroup}>
            <Text style={editorStyles.label}>Name *</Text>
            <TextInput
                style={[inputStyle, editorStyles.formGroupItemToggler]}
                placeholder="Project Name"
                value={organisation.Organisation_Name}
                onChangeText={(value) => onChange('Organisation_Name', value)}
            />
        </View>

        <View style={editorStyles.formGroup}>
            <Text style={[editorStyles.label, { width: "100%" }]}>Description *</Text>
        </View>
        <TextInput
            style={[readonlyVsEditorStyles.input, readonlyVsEditorStyles.textArea]}
            placeholder="Team Description"
            value={organisation.Organisation_Description}
            onChangeText={(value) => onChange('Organisation_Description', value)}
            multiline
            numberOfLines={4}
        />

        <View style={readonlyVsEditorStyles.buttonGroup}>
            <Button title="Save Changes" onPress={onSave} />
            <Button title="Delete Organisation" color="red" onPress={onDelete} />
        </View>

        <TouchableOpacity
            style={readonlyVsEditorStyles.linkButton}
            onPress={() =>
                navigation.navigate('CreateTeam', { id: (organisation.Organisation_ID || "").toString() })
            }
        >
            <FontAwesomeIcon icon={faPlus} size={16} style={{ marginRight: 6 }} />
            <Text style={readonlyVsEditorStyles.linkText}> Create Team</Text>
        </TouchableOpacity>
    </View>
);
