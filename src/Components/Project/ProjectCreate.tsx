import { LoadingState } from '@/src/Core-UI/LoadingState';
import { Project, ProjectFields, TeamStates } from '@/src/Types';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export type CreateProps = {
    teamById: TeamStates | undefined;
    newProject: Project;
    canModifyTeamSettings: boolean | undefined
    handleInputChange: (field: ProjectFields, value: string) => void;
    handleCreateProject: () => void;
};

export const ProjectCreate: React.FC<CreateProps> = ({
    teamById,
    newProject,
    canModifyTeamSettings,
    handleInputChange,
    handleCreateProject,
}) => (
    <ScrollView contentContainerStyle={styles.container}>
        <LoadingState singular="Team" renderItem={teamById} permitted={canModifyTeamSettings}>
            <View style={styles.header}>
                <FontAwesomeIcon icon={faLightbulb} size={24} />
                <Text style={styles.headerText}>Create New Project</Text>
            </View>

            {teamById && (
                <Text style={styles.subHeader}>
                    Team: {teamById.Team_Name}
                </Text>
            )}

            <Text style={styles.label}>Project Name *</Text>
            <TextInput
                style={styles.input}
                value={newProject.Project_Name}
                onChangeText={(text) => handleInputChange('Project_Name', text)}
            />

            <Text style={styles.label}>Project Status *</Text>
            {/* Use a select box instead of TextInput */}
            <View style={styles.input}>
                {['Planned', 'Active', 'Completed', 'On Hold'].map((status) => (
                    <View key={status} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Button
                            title={status}
                            onPress={() => handleInputChange('Project_Status', status)}
                            color={newProject.Project_Status === status ? '#007AFF' : '#ccc'}
                        />
                    </View>
                ))}
            </View>

            <Text style={styles.label}>Project Key *</Text>
            <TextInput
                style={styles.input}
                value={newProject.Project_Key}
                onChangeText={(text) => handleInputChange('Project_Key', text)}
            />

            <Text style={styles.label}>Start Date *</Text>
            <TextInput
                style={styles.input}
                value={newProject.Project_Start_Date}
                onChangeText={(text) => handleInputChange('Project_Start_Date', text)}
                placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>End Date</Text>
            <TextInput
                style={styles.input}
                value={newProject.Project_End_Date}
                onChangeText={(text) => handleInputChange('Project_End_Date', text)}
                placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Project Description</Text>
            <TextInput
                style={[styles.input, styles.descriptionInput]}
                multiline
                value={newProject.Project_Description}
                onChangeText={(text) => handleInputChange('Project_Description', text)}
            />

            <View style={styles.buttonWrapper}>
                <Button title="Create Project" onPress={handleCreateProject} />
            </View>
        </LoadingState>
    </ScrollView>
);

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    headerText: {
        fontSize: 20,
        fontWeight: '600',
    },
    subHeader: {
        fontSize: 16,
        marginBottom: 16,
    },
    label: {
        marginTop: 12,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginTop: 6,
        borderRadius: 6,
    },
    descriptionInput: {
        height: 120,
        textAlignVertical: 'top',
    },
    buttonWrapper: {
        marginTop: 24,
    },
});
