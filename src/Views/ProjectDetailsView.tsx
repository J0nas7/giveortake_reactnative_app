// External
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Redux
import {
    selectAuthUser,
    selectAuthUserSeatPermissions,
    setSnackMessage,
    useAppDispatch,
    useTypedSelector,
} from '@/src/Redux';

// Internal
import { ProjectBacklogsSection } from '@/src/Components/ProjectBacklogsSection';
import { useProjectsContext } from '@/src/Contexts';
import { LoadingState } from '@/src/Core-UI/LoadingState';
import useRoleAccess from '@/src/Hooks/useRoleAccess';
import { MainStackParamList, ProjectFields, ProjectStates } from '@/src/Types';

export const ProjectDetailsView: React.FC = () => {
    // ---- Hooks ----
    const dispatch = useAppDispatch();
    const route = useRoute();
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const { id: projectId } = route.params as { id: string };  // Get id as projectId from route params
    const { projectById, readProjectById, saveProjectChanges, removeProject } = useProjectsContext();

    const { canAccessProject, canManageProject } = useRoleAccess(
        projectById ? projectById.team?.organisation?.User_ID : undefined,
        'project',
        parseInt(projectId)
    );

    // ---- State ----
    const [showEditToggles, setShowEditToggles] = useState<boolean>(false)
    const [renderProject, setRenderProject] = useState<ProjectStates>(undefined);
    const authUser = useTypedSelector(selectAuthUser);
    const parsedPermissions = useTypedSelector(selectAuthUserSeatPermissions);
    // Calculate the number of accessible backlogs for the authenticated user using useMemo
    const accessibleBacklogsCount = useMemo(() => {
        if (!renderProject || !renderProject.backlogs) return 0;
        return renderProject.backlogs.filter(
            (backlog) =>
                authUser &&
                (
                    renderProject.team?.organisation?.User_ID === authUser.User_ID || // Check if the user owns the organisation
                    parsedPermissions?.includes(`accessBacklog.${backlog.Backlog_ID}`) // Check if the user has access permissions
                )
        ).length;
    }, [renderProject, authUser, parsedPermissions]);

    useEffect(() => {
        readProjectById(parseInt(projectId));
    }, [projectId]);

    useEffect(() => {
        if (projectById) setRenderProject(projectById);
    }, [projectById]);

    const handleProjectChange = (field: ProjectFields, value: string) => {
        if (!renderProject) return;
        setRenderProject({ ...renderProject, [field]: value });
    };

    const handleSaveChanges = async () => {
        if (renderProject) {
            const success = await saveProjectChanges(renderProject, renderProject.Team_ID);
            dispatch(setSnackMessage(success ? 'Changes saved!' : 'Failed to save changes.'));
        }
    };

    const handleDeleteProject = async () => {
        if (!renderProject || !renderProject.Project_ID) return

        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this project?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await removeProject(renderProject.Project_ID!, renderProject.Team_ID, `/team/${renderProject.Team_ID}`);
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    if (!renderProject) return <Text>Loading...</Text>;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <LoadingState
                singular="Project"
                renderItem={renderProject}
                permitted={canAccessProject}
            >
                <TouchableOpacity onPress={() => setShowEditToggles(!showEditToggles)}>
                    <Text style={{ color: 'blue', fontSize: 16 }}>{showEditToggles ? "OK" : "Edit"}</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Project Details</Text>

                {canManageProject && showEditToggles ? (
                    <>
                        <TextInput
                            style={inputStyle}
                            placeholder="Project Name"
                            value={renderProject.Project_Name}
                            onChangeText={(value) => handleProjectChange('Project_Name', value)}
                        />

                        <TextInput
                            style={inputStyle}
                            placeholder="Project Key"
                            value={renderProject.Project_Key}
                            onChangeText={(value) => handleProjectChange('Project_Key', value)}
                        />

                        <TextInput
                            style={styles.textArea}
                            placeholder="Project Description"
                            value={renderProject.Project_Description}
                            onChangeText={(value) => handleProjectChange('Project_Description', value)}
                            multiline
                            numberOfLines={4}
                        />

                        <TextInput
                            style={inputStyle}
                            placeholder="Start Date"
                            value={renderProject.Project_Start_Date || ''}
                            onChangeText={(value) => handleProjectChange('Project_Start_Date', value)}
                        />

                        <TextInput
                            style={inputStyle}
                            placeholder="End Date"
                            value={renderProject.Project_End_Date || ''}
                            onChangeText={(value) => handleProjectChange('Project_End_Date', value)}
                        />

                        <View style={styles.buttonRow}>
                            <Button title="Save Changes" onPress={handleSaveChanges} />
                            <Button title="Delete Project" onPress={handleDeleteProject} color="red" />
                        </View>
                    </>
                ) : (
                    <>
                        <Text style={styles.label}>Project Name: {renderProject.Project_Name}</Text>
                        <Text style={styles.label}>Project Key: {renderProject.Project_Key}</Text>
                        <Text style={styles.label}>Status: {renderProject.Project_Status}</Text>
                        <Text style={styles.label}>Description:</Text>
                        <Text style={styles.description}>{renderProject.Project_Description || 'N/A'}</Text>
                    </>
                )}

                <ProjectBacklogsSection
                    renderProject={renderProject}
                    canManageProject={canManageProject}
                    authUser={authUser}
                    accessibleBacklogsCount={accessibleBacklogsCount}
                />
            </LoadingState>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
        flexGrow: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 10,
        marginBottom: 12,
        height: 120,
        textAlignVertical: 'top',
    },
    label: {
        marginBottom: 6,
        fontWeight: '600',
    },
    description: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 6,
        marginBottom: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
});

const inputStyle = {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
};
