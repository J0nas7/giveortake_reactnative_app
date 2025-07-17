import { BacklogCreate, BacklogCreateProps } from '@/src/Components/Backlog';
import { useBacklogsContext, useProjectsContext } from '@/src/Contexts';
import useRoleAccess from '@/src/Hooks/useRoleAccess';
import { selectAuthUser, useTypedSelector } from '@/src/Redux';
import { Backlog, BacklogFields, MainStackParamList } from '@/src/Types';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export const CreateBacklogView = () => {
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

    const backlogCreateProps: BacklogCreateProps = {
        projectById,
        canManageProject,
        newBacklog,
        handleInputChange,
        handleCreateBacklog
    }

    return <BacklogCreate {...backlogCreateProps} />
};
