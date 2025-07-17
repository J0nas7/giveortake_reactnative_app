// External
import { faBuilding, faUsers } from '@fortawesome/free-solid-svg-icons';
import { NavigationProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';

// Internal
import { TeamDetails, TeamDetailsProps } from '@/src/Components/Team';
import { useTeamsContext } from '@/src/Contexts';
import useRoleAccess from '@/src/Hooks/useRoleAccess';
import { AppDispatch, selectAuthUser, setSnackMessage, useTypedSelector } from '@/src/Redux';
import { MainStackParamList, TeamFields, TeamStates } from '@/src/Types';
import { useDispatch } from 'react-redux';
import useMainViewJumbotron from '../Hooks/useMainViewJumbotron';

export const TeamDetailsView = () => {
    // Hooks
    const dispatch = useDispatch<AppDispatch>()
    const route = useRoute();
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const { id: teamId } = route.params as { id: string };
    const { teamById, readTeamById, saveTeamChanges, removeTeam } = useTeamsContext();
    const { canManageTeamMembers, canModifyTeamSettings } = useRoleAccess(teamById ? teamById.organisation?.User_ID : undefined)
    const { handleScroll, handleFocusEffect } = useMainViewJumbotron({
        title: `Team Settings`,
        faIcon: faUsers,
        visibility: 100,
        rightIcon: faBuilding,
        rightIconActionRoute: "Organisation",
        rightIconActionParams: { id: ((teamById && teamById.Organisation_ID) ?? "").toString() },
    })

    // State
    const [showEditToggles, setShowEditToggles] = useState<boolean>(false)
    const authUser = useTypedSelector(selectAuthUser);
    const [localTeam, setLocalTeam] = useState<TeamStates>(undefined);

    // Effects
    useEffect(() => {
        readTeamById(parseInt(teamId));
    }, [teamId]);

    useEffect(() => {
        if (teamById) {
            setLocalTeam(teamById)
        }
    }, [teamById]);

    useFocusEffect(
        useCallback(() => {
            handleFocusEffect()
        }, [])
    )

    // Methods
    const handleTeamChange = (field: TeamFields, value: string) => {
        if (!localTeam) return;

        setLocalTeam({
            ...localTeam,
            [field]: value,
        });
    };

    const handleSaveChanges = async () => {
        if (localTeam) {
            await saveTeamChanges(localTeam, localTeam.Organisation_ID);
            dispatch(setSnackMessage('Team changes saved successfully!'));
        }
    };

    const handleDeleteTeam = async () => {
        if (!localTeam || !localTeam.Team_ID) return;

        const removed = await removeTeam(localTeam.Team_ID, localTeam.Organisation_ID, undefined);
        navigation.navigate("Organisation", { id: localTeam.Organisation_ID.toString() });
    };

    const teamDetailsProps: TeamDetailsProps = {
        localTeam,
        canManageTeamMembers,
        canModifyTeamSettings,
        navigation,
        showEditToggles,
        setShowEditToggles,
        handleTeamChange,
        handleSaveChanges,
        handleDeleteTeam,
        handleScroll
    }

    return <TeamDetails {...teamDetailsProps} />
};
