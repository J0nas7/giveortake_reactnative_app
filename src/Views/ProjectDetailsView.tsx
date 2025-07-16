// External
import DateTimePicker from '@react-native-community/datetimepicker';
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
import { editorStyles, ModalToggler } from '@/src/Components/ModalToggler';
import { ProjectBacklogsSection } from '@/src/Components/ProjectBacklogsSection';
import { ReadOnlyRow } from '@/src/Components/ReadOnlyRow';
import { useProjectsContext } from '@/src/Contexts';
import { LoadingState } from '@/src/Core-UI/LoadingState';
import useRoleAccess from '@/src/Hooks/useRoleAccess';
import { MainStackParamList, ProjectFields, ProjectStates } from '@/src/Types';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

export const ProjectDetails: React.FC = () => {
    // ---- Hooks ----
    const dispatch = useAppDispatch();
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const route = useRoute();
    const { id: projectId } = route.params as { id: string };  // Get id as projectId from route params
    const { projectById, readProjectById, saveProjectChanges, removeProject } = useProjectsContext();

    const { canAccessProject, canManageProject } = useRoleAccess(
        projectById ? projectById.team?.organisation?.User_ID : undefined,
        'project',
        parseInt(projectId)
    );

    // ---- State ----
    const [showEditToggles, setShowEditToggles] = useState<boolean>(false)
    const [togglerIsVisible, setTogglerIsVisible] = useState<false | string>(false)
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

    return (
        <ProjectDetailsView
            project={renderProject}
            showEditToggles={showEditToggles}
            setShowEditToggles={setShowEditToggles}
            togglerIsVisible={togglerIsVisible}
            setTogglerIsVisible={setTogglerIsVisible}
            canAccessProject={canAccessProject}
            canManageProject={canManageProject}
            onFieldChange={handleProjectChange}
            onSave={handleSaveChanges}
            onDelete={handleDeleteProject}
            authUser={authUser}
            accessibleBacklogsCount={accessibleBacklogsCount}
        />
    );
};

type ProjectDetailsViewProps = {
    project: ProjectStates;
    showEditToggles: boolean;
    setShowEditToggles: (show: boolean) => void;
    togglerIsVisible: false | string;
    setTogglerIsVisible: React.Dispatch<React.SetStateAction<string | false>>
    canAccessProject: boolean | undefined;
    canManageProject: boolean | undefined;
    onFieldChange: (field: ProjectFields, value: string) => void;
    onSave: () => void;
    onDelete: () => void;
    authUser: any;
    accessibleBacklogsCount: number;
};

export const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({
    project,
    showEditToggles,
    setShowEditToggles,
    togglerIsVisible,
    setTogglerIsVisible,
    canAccessProject,
    canManageProject,
    onFieldChange,
    onSave,
    onDelete,
    authUser,
    accessibleBacklogsCount
}) => (
    <>
        <ScrollView contentContainerStyle={styles.container}>
            <LoadingState singular="Project" renderItem={project} permitted={canAccessProject}>
                {project && (
                    <>
                        <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={styles.title}>{project.Project_Name}</Text>
                            {canManageProject && (
                                <TouchableOpacity onPress={() => setShowEditToggles(!showEditToggles)}>
                                    <Text style={{ color: 'blue', fontSize: 16 }}>{showEditToggles ? "OK" : "Edit"}</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {canManageProject && showEditToggles ? (
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
                                        onPress={() => setTogglerIsVisible("ProjectStatus")}
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
                                    <Text style={[editorStyles.label, { width: "100%" }]}>Description *</Text>
                                </View>
                                <TextInput
                                    style={styles.textArea}
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
                                        onPress={() => setTogglerIsVisible("ProjectStartDate")}
                                    >
                                        <Text>{project.Project_Start_Date}</Text>
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </TouchableOpacity>
                                </View>

                                <View style={editorStyles.formGroup}>
                                    <Text style={editorStyles.label}>End Date</Text>
                                    <TouchableOpacity
                                        style={editorStyles.formGroupItemToggler}
                                        onPress={() => setTogglerIsVisible("ProjectEndDate")}
                                    >
                                        <Text>{project.Project_End_Date}</Text>
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.buttonRow}>
                                    <Button title="Save Changes" onPress={onSave} />
                                    <Button title="Delete Project" onPress={onDelete} color="red" />
                                </View>
                            </>
                        ) : (
                            <>
                                <ReadOnlyRow label="Key" value={project.Project_Key} />
                                <ReadOnlyRow label="Status" value={project.Project_Status} />
                                <Text style={styles.label}>Description:</Text>
                                <Text style={styles.description}>{project.Project_Description || 'N/A'}</Text>
                                <ReadOnlyRow label="Start Date" value={project.Project_Start_Date} />
                                <ReadOnlyRow label="End Date" value={project.Project_End_Date} />
                            </>
                        )}

                        {!showEditToggles && (
                            <ProjectBacklogsSection
                                renderProject={project}
                                canManageProject={canManageProject}
                                authUser={authUser}
                                accessibleBacklogsCount={accessibleBacklogsCount}
                            />
                        )}
                    </>
                )}
            </LoadingState>
        </ScrollView>

        <ModalToggler visibility={togglerIsVisible} callback={setTogglerIsVisible}>
            {project && (
                <>
                    {togglerIsVisible === "ProjectStatus" ? (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            {['Planned', 'Active', 'Completed', 'On Hold'].map((status) => (
                                <View key={status} style={{ width: '48%', marginBottom: 4 }}>
                                    <Button
                                        title={status}
                                        onPress={() => onFieldChange('Project_Status', status)}
                                        color={project.Project_Status === status ? '#007AFF' : '#ccc'}
                                    />
                                </View>
                            ))}
                        </View>
                    ) : togglerIsVisible === "ProjectStartDate" ? (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={new Date(project.Project_Start_Date || Date.now())}
                            mode="date"
                            is24Hour={true}
                            display="spinner"
                            onChange={(event, selectedDate) => {
                                if (selectedDate) {
                                    onFieldChange('Project_Start_Date', selectedDate.toISOString());
                                }
                            }}
                        />
                    ) : togglerIsVisible === "ProjectEndDate" ? (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={new Date(project.Project_End_Date || Date.now())}
                            mode="date"
                            is24Hour={true}
                            display="spinner"
                            onChange={(event, selectedDate) => {
                                if (selectedDate) {
                                    onFieldChange('Project_End_Date', selectedDate.toISOString());
                                }
                            }}
                        />
                    ) : null}
                </>
            )}
        </ModalToggler>
    </>
);

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
