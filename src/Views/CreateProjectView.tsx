// External
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';

// Internal
import { ProjectCreate } from '@/src/Components/Project';
import { useProjectsContext, useTeamsContext } from '@/src/Contexts';
import useRoleAccess from '@/src/Hooks/useRoleAccess';
import { selectAuthUser, useTypedSelector } from '@/src/Redux';
import { MainStackParamList, Project, ProjectFields } from '@/src/Types';

export const CreateProjectView = () => {
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const route = useRoute();
    const { id: teamId } = route.params as { id: string };

    const { addProject } = useProjectsContext();
    const { teamById, readTeamById } = useTeamsContext();
    const authUser = useTypedSelector(selectAuthUser);
    const { canModifyTeamSettings } = useRoleAccess(teamById ? teamById.organisation?.User_ID : 0);

    const [newProject, setNewProject] = useState<Project>({
        Team_ID: parseInt(teamId),
        Project_Name: '',
        Project_Key: '',
        Project_Description: '',
        Project_Status: 'Planned',
        Project_Start_Date: '',
        Project_End_Date: '',
    });

    useEffect(() => {
        if (teamId) readTeamById(parseInt(teamId));
    }, [teamId]);

    useEffect(() => {
        if (teamById && authUser && !canModifyTeamSettings) {
            navigation.navigate('Team', { id: teamId.toString() });
        }
    }, [teamById]);

    const handleInputChange = (field: ProjectFields, value: string) => {
        setNewProject((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCreateProject = async () => {
        if (!newProject.Project_Name.trim()) {
            Alert.alert('Validation', 'Please enter a project name.');
            return;
        }
        if (!newProject.Project_Key.trim()) {
            Alert.alert('Validation', 'Please enter a project key.');
            return;
        }

        await addProject(parseInt(teamId), newProject);
        navigation.navigate('Team', { id: teamId.toString() });
    };

    return (
        <ProjectCreate
            teamById={teamById}
            newProject={newProject}
            canModifyTeamSettings={canModifyTeamSettings}
            handleInputChange={handleInputChange}
            handleCreateProject={handleCreateProject}
        />
    );
};
