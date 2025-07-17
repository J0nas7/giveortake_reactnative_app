// External
import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";

// Internal
import { TeamCreate } from '@/src/Components/Team';
import { useOrganisationsContext, useTeamsContext } from "@/src/Contexts";
import useRoleAccess from '@/src/Hooks/useRoleAccess';
import { MainStackParamList, Team, TeamFields } from "@/src/Types";

export const CreateTeamView = () => {
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const route = useRoute();
    const { id: organisationId } = route.params as { id: string };

    const { addTeam } = useTeamsContext();
    const { organisationById, readOrganisationById } = useOrganisationsContext();
    const { canModifyOrganisationSettings } = useRoleAccess(
        organisationById ? organisationById?.User_ID : 0
    );

    const [newTeam, setNewTeam] = useState<Team>({
        Organisation_ID: parseInt(organisationId),
        Team_Name: "",
        Team_Description: "",
    });

    const handleInputChange = (field: TeamFields, value: string) => {
        setNewTeam((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCreateTeam = async () => {
        if (!organisationById) return
        if (!newTeam.Team_Name.trim()) {
            Alert.alert("Validation", "Please enter a team name.");
            return;
        }

        await addTeam(parseInt(organisationId), newTeam);
        navigation.navigate('Organisation', { id: (organisationById.Organisation_ID ?? "").toString() })
    };

    useEffect(() => {
        if (organisationId) {
            readOrganisationById(parseInt(organisationId));
        }
    }, [organisationId]);

    useEffect(() => {
        if (organisationById && !canModifyOrganisationSettings) {
            navigation.navigate('Organisation', { id: (organisationById.Organisation_ID ?? "").toString() })
        }
    }, [organisationById]);

    return (
        <TeamCreate
            newTeam={newTeam}
            organisationById={organisationById}
            navigation={navigation}
            canModifyOrganisationSettings={canModifyOrganisationSettings}
            handleInputChange={handleInputChange}
            handleCreateTeam={handleCreateTeam}
        />
    );
};
