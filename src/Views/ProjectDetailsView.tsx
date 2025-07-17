// External
import {
    selectAuthUser,
    selectAuthUserSeatPermissions,
    setSnackMessage,
    useAppDispatch,
    useTypedSelector,
} from '@/src/Redux';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

// Internal
import { ProjectDetails, ProjectDetailsProps } from '@/src/Components/Project';
import { useProjectsContext } from '@/src/Contexts';
import useRoleAccess from '@/src/Hooks/useRoleAccess';
import { MainStackParamList, ProjectFields, ProjectStates } from '@/src/Types';

export const ProjectDetailsView = () => {
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

    // ---- Effects ----
    useEffect(() => {
        readProjectById(parseInt(projectId));
    }, [projectId]);

    useEffect(() => {
        if (projectById) setRenderProject(projectById);
    }, [projectById]);

    // ---- Methods ----
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

    const projectDetailsProps: ProjectDetailsProps = {
        renderProject,
        showEditToggles,
        setShowEditToggles,
        togglerIsVisible,
        setTogglerIsVisible,
        canAccessProject,
        canManageProject,
        handleProjectChange,
        handleSaveChanges,
        handleDeleteProject,
        authUser,
        accessibleBacklogsCount
    }

    return <ProjectDetails {...projectDetailsProps} />
};
