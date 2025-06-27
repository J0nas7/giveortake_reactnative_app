import { useBacklogsContext, useProjectsContext } from '@/src/Contexts';
import { LoadingState } from '@/src/Core-UI/LoadingState';
import useRoleAccess from '@/src/Hooks/useRoleAccess';
import { selectAuthUser, useTypedSelector } from '@/src/Redux';
import { Backlog, BacklogFields, MainStackParamList, ProjectStates } from '@/src/Types';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export const CreateBacklog: React.FC = () => {
    // ---- Hooks ----
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const { readProjectById, projectById } = useProjectsContext();
    const { addBacklog } = useBacklogsContext();
    const authUser = useTypedSelector(selectAuthUser);
    const route = useRoute();
    const { id: projectId } = route.params as { id: string };  // Get id as projectId from route params

    const { canManageProject } = useRoleAccess(
        projectById ? projectById.team?.organisation?.User_ID : undefined,
        'project',
        parseInt(projectId)
    );

    // ---- State ----
    const [newBacklog, setNewBacklog] = useState<Backlog>({
        Project_ID: parseInt(projectId),
        Backlog_Name: '',
        Backlog_Description: '',
        Backlog_IsPrimary: false,
        Backlog_StartDate: '',
        Backlog_EndDate: '',
    });

    // ---- Effects ----
    useEffect(() => {
        if (projectId) {
            readProjectById(parseInt(projectId));
        }
    }, [projectId]);

    useEffect(() => {
        if (projectById && authUser && !canManageProject) {
            // Redirect to project screen if unauthorized
            navigation.navigate('Project', { id: projectId.toString(), });
        }
    }, [projectById]);

    // ---- Methods ----
    const handleInputChange = (field: BacklogFields, value: string | boolean) => {
        setNewBacklog((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCreateBacklog = async () => {
        if (!projectById) return;

        if (!newBacklog.Backlog_Name.trim()) {
            Alert.alert('Validation Error', 'Please enter a backlog name.');
            return;
        }

        await addBacklog(parseInt(projectId), newBacklog);

        navigation.navigate('Project', { id: projectId.toString(), });
    };

    return (
        <CreateBacklogView
            projectById={projectById}
            canManageProject={canManageProject}
            newBacklog={newBacklog}
            handleInputChange={handleInputChange}
            handleCreateBacklog={handleCreateBacklog}
        />
    );
};

type CreateBacklogViewProps = {
    projectById: ProjectStates
    canManageProject: boolean | undefined;
    newBacklog: Backlog
    handleInputChange: (field: BacklogFields, value: string | boolean) => void
    handleCreateBacklog: () => Promise<void>;
};

const CreateBacklogView: React.FC<CreateBacklogViewProps> = ({
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

export default CreateBacklogView;
