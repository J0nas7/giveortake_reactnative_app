// External
import { faBuilding } from '@fortawesome/free-regular-svg-icons';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { NavigationProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Internal
import { useOrganisationsContext } from '@/src/Contexts';
import { LoadingState } from '@/src/Core-UI/LoadingState';
import useRoleAccess from '@/src/Hooks/useRoleAccess';
import { selectAuthUser, useTypedSelector } from '@/src/Redux';
import { CreatedAtToTimeSince } from '../Components/CreatedAtToTimeSince';
import useMainViewJumbotron from '../Hooks/useMainViewJumbotron';
import { MainStackParamList, Organisation, OrganisationStates } from '../Types';

export const OrganisationDetails = () => {
    // Hooks
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const route = useRoute();
    const { id: organisationId } = route.params as { id: string };
    const { organisationById, readOrganisationById, saveOrganisationChanges, removeOrganisation } = useOrganisationsContext();
    const { handleScroll, handleFocusEffect } = useMainViewJumbotron({
        title: `Organisation Settings`,
        faIcon: faBuilding,
        visibility: 100,
    })
    const { canModifyOrganisationSettings } = useRoleAccess(
        organisationById ? organisationById.User_ID : 0,
        "organisation",
        organisationById ? organisationById.Organisation_ID : 0
    )

    // State
    const authUser = useTypedSelector(selectAuthUser);
    const [organisation, setOrganisation] = useState<Organisation>();

    useEffect(() => {
        readOrganisationById(parseInt(organisationId));
    }, [organisationId]);

    useEffect(() => {
        if (organisationById) {
            setOrganisation(organisationById);
        }
    }, [organisationById]);

    useFocusEffect(
        useCallback(() => {
            handleFocusEffect()
        }, [])
    )

    const handleOrganisationChange = (field: string, value: string) => {
        setOrganisation((prev: any) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSaveChanges = async () => {
        if (organisation) {
            await saveOrganisationChanges(organisation, organisation.User_ID);
            Alert.alert('Changes saved');
        }
    };

    const handleDeleteOrganisation = async () => {
        if (!organisation || !organisation.Organisation_ID) return

        const confirmed = await removeOrganisation(organisation.Organisation_ID, organisation.User_ID, undefined);
        // if (confirmed) {
        //     Alert.alert('Organisation deleted');
        //     navigation.navigate('Home');
        // }
    };

    return (
        <OrganisationDetailsView
            organisation={organisation}
            canModifyOrganisationSettings={canModifyOrganisationSettings}
            navigation={navigation}
            handleOrganisationChange={handleOrganisationChange}
            handleSaveChanges={handleSaveChanges}
            handleDeleteOrganisation={handleDeleteOrganisation}
        />
    )
}

type OrganisationDetailsViewProps = {
    organisation: OrganisationStates
    canModifyOrganisationSettings: boolean | undefined
    navigation: NavigationProp<MainStackParamList>
    handleOrganisationChange: (field: string, value: string) => void
    handleSaveChanges: () => Promise<void>
    handleDeleteOrganisation: () => Promise<void>
}

export const OrganisationDetailsView: React.FC<OrganisationDetailsViewProps> = ({
    organisation,
    canModifyOrganisationSettings,
    navigation,
    handleOrganisationChange,
    handleSaveChanges,
    handleDeleteOrganisation
}) => {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <LoadingState singular="Organisation" renderItem={organisation} permitted={undefined}>
                {canModifyOrganisationSettings && organisation && (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Organisation Name"
                            value={organisation.Organisation_Name}
                            onChangeText={(text) => handleOrganisationChange('Organisation_Name', text)}
                        />

                        <TextInput
                            style={[styles.input, { height: 120 }]}
                            multiline
                            placeholder="Organisation Description"
                            value={organisation.Organisation_Description}
                            onChangeText={(text) => handleOrganisationChange('Organisation_Description', text)}
                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                                <Text style={styles.buttonText}>Save Changes</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteOrganisation}>
                                <Text style={styles.buttonText}>Delete Organisation</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => navigation.navigate('CreateTeam', { id: (organisation.Organisation_ID ?? "").toString() })}
                        >
                            <FontAwesomeIcon icon={faUsers} size={16} />
                            <Text style={styles.linkText}> Create Team</Text>
                        </TouchableOpacity>
                    </>
                )}

                {organisation && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Teams Overview</Text>
                        {organisation.teams?.map((team: any) => (
                            <View key={team.Team_ID} style={styles.card}>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Team', { id: (team.Team_ID ?? "").toString() })}
                                >
                                    <Text style={styles.teamName}>{team.Team_Name}</Text>
                                </TouchableOpacity>
                                <Text style={styles.description}>
                                    {team.Team_Description || 'No description available'}
                                </Text>
                                <Text style={styles.meta}>Created: <CreatedAtToTimeSince dateCreatedAt={team.Team_CreatedAt} /></Text>
                                <Text style={styles.meta}>Members: {team.user_seats?.length || 0}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </LoadingState>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    loading: {
        padding: 20,
        fontSize: 18,
    },
    container: {
        padding: 16,
        backgroundColor: '#fff',
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    saveButton: {
        backgroundColor: '#2563eb',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginRight: 5,
    },
    deleteButton: {
        backgroundColor: '#ef4444',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginLeft: 5,
    },
    buttonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: '600',
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
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
    },
    card: {
        padding: 12,
        backgroundColor: '#f3f4f6',
        borderRadius: 10,
        marginBottom: 12,
    },
    teamName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#2563eb',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 6,
    },
    meta: {
        fontSize: 12,
        color: '#6b7280',
    },
});
