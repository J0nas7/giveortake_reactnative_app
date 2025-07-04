// External
import { faBuilding, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Internal
import { useOrganisationsContext, useTeamsContext } from "@/src/Contexts";
import { LoadingState } from '@/src/Core-UI/LoadingState';
import useRoleAccess from '@/src/Hooks/useRoleAccess';
import { MainStackParamList, OrganisationStates, Team, TeamFields } from "@/src/Types";

export const CreateTeam = () => {
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
        <CreateTeamView
            newTeam={newTeam}
            organisationById={organisationById}
            navigation={navigation}
            canModifyOrganisationSettings={canModifyOrganisationSettings}
            handleInputChange={handleInputChange}
            handleCreateTeam={handleCreateTeam}
        />
    );
};

type CreateTeamViewProps = {
    newTeam: Team;
    organisationById: OrganisationStates
    navigation: NavigationProp<MainStackParamList>
    canModifyOrganisationSettings: boolean | undefined
    handleInputChange: (field: TeamFields, value: string) => void;
    handleCreateTeam: () => void;
};

export const CreateTeamView: React.FC<CreateTeamViewProps> = ({
    newTeam,
    organisationById,
    navigation,
    canModifyOrganisationSettings,
    handleInputChange,
    handleCreateTeam
}) => (
    <ScrollView style={styles.container}>
        <LoadingState singular="Organisation" renderItem={organisationById} permitted={canModifyOrganisationSettings}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <FontAwesomeIcon icon={faUsers} size={20} />
                    <Text style={styles.title}>Create New Team</Text>
                </View>

                {organisationById && (
                    <TouchableOpacity
                        onPress={() => {
                            navigation.navigate("Organisation", {
                                id: (organisationById.Organisation_ID ?? 0).toString(),
                            });
                        }}
                        style={styles.linkRow}
                    >
                        <FontAwesomeIcon icon={faBuilding} size={16} />
                        <Text style={styles.linkText}>Go to Organisation</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Team Name</Text>
                <TextInput
                    placeholder="Enter team name"
                    value={newTeam.Team_Name}
                    onChangeText={(text) => handleInputChange("Team_Name", text)}
                    style={styles.input}
                />

                <Text style={styles.label}>Team Description</Text>
                <TextInput
                    placeholder="Enter description"
                    value={newTeam.Team_Description}
                    onChangeText={(text) => handleInputChange("Team_Description", text)}
                    multiline
                    style={[styles.input, styles.textArea]}
                />

                <Button title="Create Team" onPress={handleCreateTeam} />
            </View>
        </LoadingState>
    </ScrollView>
)

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#f9fafb",
        flex: 1,
    },
    header: {
        marginBottom: 24,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: "600",
        marginLeft: 8,
    },
    linkRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    linkText: {
        marginLeft: 6,
        color: "#2563eb",
        fontSize: 14,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        backgroundColor: "#fff",
    },
    textArea: {
        height: 120,
        textAlignVertical: "top",
    },
});
