import { LoadingState } from '@/src/Core-UI/LoadingState';
import { Backlog, BacklogFields, ProjectStates } from '@/src/Types';
import { Button, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

export type BacklogCreateProps = {
    projectById: ProjectStates
    canManageProject: boolean | undefined;
    newBacklog: Backlog
    handleInputChange: (field: BacklogFields, value: string | boolean) => void
    handleCreateBacklog: () => Promise<void>;
};

export const BacklogCreate: React.FC<BacklogCreateProps> = ({
    projectById,
    canManageProject,
    newBacklog,
    handleInputChange,
    handleCreateBacklog,
}) => (
    <ScrollView contentContainerStyle={styles.container}>
        <LoadingState singular="Project" renderItem={projectById} permitted={canManageProject}>
            <Text style={styles.heading}>Create New Backlog</Text>

            <Text style={styles.label}>Backlog Name *</Text>
            <TextInput
                style={styles.input}
                value={newBacklog.Backlog_Name}
                onChangeText={(text) => handleInputChange('Backlog_Name', text)}
            />

            <Text style={styles.label}>Is Primary Backlog?</Text>
            <Switch
                value={newBacklog.Backlog_IsPrimary}
                onValueChange={(val) => handleInputChange('Backlog_IsPrimary', val)}
            />

            <Text style={styles.label}>Start Date *</Text>
            <TextInput
                style={styles.input}
                value={newBacklog.Backlog_StartDate}
                onChangeText={(text) => handleInputChange('Backlog_StartDate', text)}
                placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>End Date</Text>
            <TextInput
                style={styles.input}
                value={newBacklog.Backlog_EndDate}
                onChangeText={(text) => handleInputChange('Backlog_EndDate', text)}
                placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Backlog Description</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={5}
                value={newBacklog.Backlog_Description}
                onChangeText={(text) => handleInputChange('Backlog_Description', text)}
            />

            <View style={styles.buttonContainer}>
                <Button title="Create Backlog" onPress={handleCreateBacklog} />
            </View>
        </LoadingState>
    </ScrollView>
);

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    heading: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 20,
    },
    label: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 6,
        marginTop: 4,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        marginTop: 20,
    },
});
