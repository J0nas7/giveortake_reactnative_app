import { editorStyles, inputStyle } from '@/src/Components/ModalToggler';
import { readonlyVsEditorStyles } from '@/src/Core-UI/ReadonlyVsEditorStyles';
import { MainStackParamList, TeamFields, TeamStates } from '@/src/Types';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { NavigationProp } from '@react-navigation/native';
import { Button, Text, TextInput, TouchableOpacity, View } from 'react-native';

type EditorProps = {
    team: TeamStates;
    onChange: (field: TeamFields, value: string) => void;
    onSave: () => void;
    onDelete: () => void;
    navigation: NavigationProp<MainStackParamList>;
};

export const TeamEditor: React.FC<EditorProps> = ({
    team,
    onChange,
    onSave,
    onDelete,
    navigation
}) => team && (
    <View style={readonlyVsEditorStyles.section}>
        <View style={editorStyles.formGroup}>
            <Text style={editorStyles.label}>Name *</Text>
            <TextInput
                style={[inputStyle, editorStyles.formGroupItemToggler]}
                placeholder="Project Name"
                value={team.Team_Name}
                onChangeText={(value) => onChange("Team_Name", value)}
            />
        </View>

        <View style={editorStyles.formGroup}>
            <Text style={[editorStyles.label, { width: "100%" }]}>Description *</Text>
        </View>
        <TextInput
            style={[readonlyVsEditorStyles.input, readonlyVsEditorStyles.textArea]}
            placeholder="Team Description"
            value={team.Team_Description}
            onChangeText={(value) => onChange("Team_Description", value)}
            multiline
            numberOfLines={4}
        />

        <View style={readonlyVsEditorStyles.buttonGroup}>
            <Button title="Save Changes" onPress={onSave} />
            <Button title="Delete Team" color="red" onPress={onDelete} />
        </View>

        <TouchableOpacity
            style={readonlyVsEditorStyles.linkButton}
            onPress={() => navigation.navigate("CreateProject", { id: (team.Team_ID ?? "").toString() })}
        >
            <FontAwesomeIcon icon={faPlus} size={16} style={{ marginRight: 6 }} />
            <Text style={readonlyVsEditorStyles.linkText}> Create Project</Text>
        </TouchableOpacity>
    </View>
);
