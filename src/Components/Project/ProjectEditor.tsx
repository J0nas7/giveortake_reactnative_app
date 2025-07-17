import { editorStyles, inputStyle } from '@/src/Components/ModalToggler';
import { readonlyVsEditorStyles } from '@/src/Core-UI/ReadonlyVsEditorStyles';
import { ProjectFields, ProjectStates } from '@/src/Types';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Button, Text, TextInput, TouchableOpacity, View } from 'react-native';

type EditorProps = {
    project: ProjectStates;
    onFieldChange: (field: ProjectFields, value: string) => void;
    onSave: () => void;
    onDelete: () => void;
    setTogglerIsVisible: React.Dispatch<React.SetStateAction<string | false>>;
};

export const ProjectEditor: React.FC<EditorProps> = ({
    project,
    onFieldChange,
    onSave,
    onDelete,
    setTogglerIsVisible
}) => project && (
    <>
        <View style={editorStyles.formGroup}>
            <Text style={editorStyles.label}>Name *</Text>
            <TextInput
                style={[inputStyle, editorStyles.formGroupItemToggler]}
                placeholder="Project Name"
                value={project.Project_Name}
                onChangeText={(value) => onFieldChange('Project_Name', value)}
            />
        </View>

        <View style={editorStyles.formGroup}>
            <Text style={editorStyles.label}>Status *</Text>
            <TouchableOpacity
                style={editorStyles.formGroupItemToggler}
                onPress={() => setTogglerIsVisible('ProjectStatus')}
            >
                <Text>{project.Project_Status}</Text>
                <FontAwesomeIcon icon={faChevronRight} />
            </TouchableOpacity>
        </View>

        <View style={editorStyles.formGroup}>
            <Text style={editorStyles.label}>Key *</Text>
            <TextInput
                style={[inputStyle, editorStyles.formGroupItemToggler]}
                placeholder="Project Key"
                value={project.Project_Key}
                onChangeText={(value) => onFieldChange('Project_Key', value)}
            />
        </View>

        <View style={editorStyles.formGroup}>
            <Text style={[editorStyles.label, { width: '100%' }]}>Description *</Text>
        </View>
        <TextInput
            style={readonlyVsEditorStyles.textArea}
            placeholder="Project Description"
            value={project.Project_Description}
            onChangeText={(value) => onFieldChange('Project_Description', value)}
            multiline
            numberOfLines={4}
        />

        <View style={editorStyles.formGroup}>
            <Text style={editorStyles.label}>Start Date *</Text>
            <TouchableOpacity
                style={editorStyles.formGroupItemToggler}
                onPress={() => setTogglerIsVisible('ProjectStartDate')}
            >
                <Text>{project.Project_Start_Date}</Text>
                <FontAwesomeIcon icon={faChevronRight} />
            </TouchableOpacity>
        </View>

        <View style={editorStyles.formGroup}>
            <Text style={editorStyles.label}>End Date</Text>
            <TouchableOpacity
                style={editorStyles.formGroupItemToggler}
                onPress={() => setTogglerIsVisible('ProjectEndDate')}
            >
                <Text>{project.Project_End_Date}</Text>
                <FontAwesomeIcon icon={faChevronRight} />
            </TouchableOpacity>
        </View>

        <View style={readonlyVsEditorStyles.buttonRow}>
            <Button title="Save Changes" onPress={onSave} />
            <Button title="Delete Project" onPress={onDelete} color="red" />
        </View>
    </>
);
