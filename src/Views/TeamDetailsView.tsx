// External
import { faBuilding, faLightbulb, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { NavigationProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Button,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Internal
import { useTeamsContext } from '@/src/Contexts';
import { LoadingState } from '@/src/Core-UI/LoadingState';
import useRoleAccess from '@/src/Hooks/useRoleAccess';
import { AppDispatch, selectAuthUser, setSnackMessage, useTypedSelector } from '@/src/Redux';
import { MainStackParamList, TeamFields, TeamStates } from '@/src/Types';
import { useDispatch } from 'react-redux';
import { ReadOnlyRow } from '../Components/ReadOnlyRow';
import useMainViewJumbotron from '../Hooks/useMainViewJumbotron';

const screenWidth = Dimensions.get('window').width;

export const TeamDetails: React.FC = () => {
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

    return (
        <TeamDetailsView
            team={localTeam}
            canManageTeamMembers={canManageTeamMembers}
            canModifyTeamSettings={canModifyTeamSettings}
            navigation={navigation}
            onChange={handleTeamChange}
            onSave={handleSaveChanges}
            onDelete={handleDeleteTeam}
            onScroll={handleScroll}
        />
    );
};

type TeamDetailsViewProps = {
    team: TeamStates;
    canManageTeamMembers: boolean | undefined
    canModifyTeamSettings: boolean | undefined
    navigation: NavigationProp<MainStackParamList>
    onChange: (field: TeamFields, value: string) => void;
    onSave: () => void;
    onDelete: () => void;
    onScroll?: (e: any) => void;
};

export const TeamDetailsView: React.FC<TeamDetailsViewProps> = ({
    team,
    navigation,
    canManageTeamMembers,
    canModifyTeamSettings,
    onChange,
    onSave,
    onDelete,
    onScroll,
}) => (
    <ScrollView style={styles.container} onScroll={onScroll}>
        <LoadingState singular="Team" renderItem={team} permitted={undefined}>
            {team && (
                <>
                    {canModifyTeamSettings ? (
                        <View style={styles.section}>
                            {canManageTeamMembers && (
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                    <TouchableOpacity
                                        onPress={() =>
                                            navigation.navigate("TeamRolesSeatsManager", {
                                                id: (team.Team_ID || "").toString(),
                                            })
                                        }
                                    >
                                        <FontAwesomeIcon icon={faUsers} size={20} />
                                    </TouchableOpacity>
                                </View>
                            )}

                            <Text style={styles.label}>Team Name</Text>
                            <TextInput
                                style={styles.input}
                                value={team.Team_Name}
                                onChangeText={(text) => onChange('Team_Name', text)}
                            />

                            <Text style={styles.label}>Team Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                multiline
                                numberOfLines={4}
                                value={team.Team_Description}
                                onChangeText={(text) => onChange('Team_Description', text)}
                            />

                            <View style={styles.buttonGroup}>
                                <Button title="Save Changes" onPress={onSave} />
                                <Button title="Delete Team" color="red" onPress={onDelete} />
                            </View>

                            <TouchableOpacity
                                style={styles.linkButton}
                                onPress={() => navigation.navigate('CreateProject', { id: (team.Team_ID ?? "").toString() })}
                            >
                                <FontAwesomeIcon icon={faLightbulb} size={16} />
                                <Text style={styles.linkText}> Create Project</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.section}>
                            <ReadOnlyRow label="Team Name" value={team.Team_Name} />
                            <ReadOnlyRow
                                label="Team Description"
                                value={team.Team_Description || 'No description available'}
                            />
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.title}>Projects Overview</Text>
                        {team.projects?.map((project) => (
                            <View key={project.Project_ID} style={styles.card}>
                                <Text
                                    style={styles.link}
                                    onPress={() =>
                                        navigation.navigate("Project", {
                                            id: (project.Project_ID || "").toString(),
                                        })
                                    }
                                >
                                    {project.Project_Name}
                                </Text>
                                <ReadOnlyRow
                                    label="Project Description"
                                    value={project.Project_Description || 'No description available'}
                                />
                                <Text>Status: {project.Project_Status}</Text>
                                <Text>Start: {project.Project_Start_Date || 'N/A'}</Text>
                                <Text>End: {project.Project_End_Date || 'N/A'}</Text>
                            </View>
                        ))}
                    </View>
                </>
            )}
        </LoadingState>
    </ScrollView>
);

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 12,
    },
    label: {
        fontWeight: '500',
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginTop: 6,
        borderRadius: 6,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    link: {
        color: '#007bff',
        marginBottom: 12,
    },
    card: {
        padding: 12,
        marginBottom: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    buttonGroup: {
        marginTop: 20,
        marginBottom: 16,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    linkText: {
        color: '#2563eb',
        fontSize: 16,
        marginLeft: 6,
    },
});
