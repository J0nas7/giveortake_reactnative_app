// External
import { faBuilding, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { NavigationProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Internal
import { editorStyles } from '@/src/Components/ModalToggler';
import { ReadOnlyRow } from '@/src/Components/ReadOnlyRow';
import { useOrganisationsContext } from '@/src/Contexts';
import { LoadingState } from '@/src/Core-UI/LoadingState';
import useRoleAccess from '@/src/Hooks/useRoleAccess';
import { selectAuthUser, useTypedSelector } from '@/src/Redux';
import { CreatedAtToTimeSince } from '../Components/CreatedAtToTimeSince';
import useMainViewJumbotron from '../Hooks/useMainViewJumbotron';
import { MainStackParamList, OrganisationStates } from '../Types';

export const OrganisationDetails = () => {
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const route = useRoute();
    const { id: organisationId } = route.params as { id: string };

    const { organisationById, readOrganisationById, saveOrganisationChanges, removeOrganisation } = useOrganisationsContext();
    const { handleScroll, handleFocusEffect } = useMainViewJumbotron({
        title: `Organisation Settings`,
        faIcon: faBuilding,
        visibility: 100,
    });

    const { canModifyOrganisationSettings } = useRoleAccess(
        organisationById ? organisationById?.User_ID : 0,
        "organisation",
        organisationById ? organisationById?.Organisation_ID : 0
    );

    const authUser = useTypedSelector(selectAuthUser);
    const [organisation, setOrganisation] = useState<OrganisationStates>();
    const [showEditToggles, setShowEditToggles] = useState<boolean>(false);

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
            handleFocusEffect();
        }, [])
    );

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
        if (!organisation || !organisation?.Organisation_ID) return;
        await removeOrganisation(organisation.Organisation_ID, organisation.User_ID, undefined);
        navigation.navigate('Home');
    };

    return (
        <OrganisationDetailsView
            organisation={organisation}
            canModifyOrganisationSettings={canModifyOrganisationSettings}
            showEditToggles={showEditToggles}
            setShowEditToggles={setShowEditToggles}
            navigation={navigation}
            handleOrganisationChange={handleOrganisationChange}
            handleSaveChanges={handleSaveChanges}
            handleDeleteOrganisation={handleDeleteOrganisation}
            onScroll={handleScroll}
        />
    );
};

type OrganisationDetailsViewProps = {
    organisation: OrganisationStates;
    canModifyOrganisationSettings: boolean | undefined;
    showEditToggles: boolean;
    setShowEditToggles: React.Dispatch<React.SetStateAction<boolean>>;
    navigation: NavigationProp<MainStackParamList>;
    handleOrganisationChange: (field: string, value: string) => void;
    handleSaveChanges: () => void;
    handleDeleteOrganisation: () => void;
    onScroll?: (e: any) => void;
};

export const OrganisationDetailsView: React.FC<OrganisationDetailsViewProps> = ({
    organisation,
    canModifyOrganisationSettings,
    showEditToggles,
    setShowEditToggles,
    navigation,
    handleOrganisationChange,
    handleSaveChanges,
    handleDeleteOrganisation,
    onScroll
}) => (
    <ScrollView style={styles.container} onScroll={onScroll}>
        <LoadingState singular="Organisation" renderItem={organisation} permitted={undefined}>
            {organisation && (
                <>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>{organisation.Organisation_Name}</Text>
                        {canModifyOrganisationSettings && (
                            <TouchableOpacity onPress={() => setShowEditToggles(!showEditToggles)}>
                                <Text style={{ color: 'blue', fontSize: 16 }}>
                                    {showEditToggles ? 'OK' : 'Edit'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {canModifyOrganisationSettings && showEditToggles ? (
                        <View style={styles.section}>
                            <View style={editorStyles.formGroup}>
                                <Text style={editorStyles.label}>Name *</Text>
                                <TextInput
                                    style={[inputStyle, editorStyles.formGroupItemToggler]}
                                    placeholder="Project Name"
                                    value={organisation.Organisation_Name}
                                    onChangeText={(value) => handleOrganisationChange('Organisation_Name', value)}
                                />
                            </View>

                            <View style={editorStyles.formGroup}>
                                <Text style={[editorStyles.label, { width: "100%" }]}>Description *</Text>
                            </View>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Team Description"
                                value={organisation.Organisation_Description}
                                onChangeText={(value) => handleOrganisationChange('Organisation_Description', value)}
                                multiline
                                numberOfLines={4}
                            />

                            <View style={styles.buttonGroup}>
                                {/* <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                                    <Text style={styles.buttonText}>Save Changes</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteOrganisation}>
                                    <Text style={styles.buttonText}>Delete Organisation</Text>
                                </TouchableOpacity> */}
                                <Button title="Save Changes" onPress={handleSaveChanges} />
                                <Button title="Delete Organisation" color="red" onPress={handleDeleteOrganisation} />
                            </View>

                            <TouchableOpacity
                                style={styles.linkButton}
                                onPress={() =>
                                    navigation.navigate('CreateTeam', { id: (organisation.Organisation_ID || "").toString() })
                                }
                            >
                                <FontAwesomeIcon icon={faPlus} size={16} style={{ marginRight: 6 }} />
                                <Text style={styles.linkText}> Create Team</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.section}>
                            <ReadOnlyRow label="Name" value={organisation.Organisation_Name} />
                            <ReadOnlyRow label="Description" value={organisation.Organisation_Description || 'No description available'} />
                        </View>
                    )}

                    {!showEditToggles && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Teams Overview</Text>
                            {organisation.teams?.map((team) => (
                                <View key={team.Team_ID} style={styles.card}>
                                    <Text
                                        style={styles.link}
                                        onPress={() =>
                                            navigation.navigate('Team', { id: (team.Team_ID || "").toString() })
                                        }
                                    >
                                        {team.Team_Name}
                                    </Text>
                                    <Text style={styles.description}>
                                        {team.Team_Description || 'No description available'}
                                    </Text>
                                    {team.Team_CreatedAt && (
                                        <Text style={styles.meta}>
                                            Created: <CreatedAtToTimeSince dateCreatedAt={team.Team_CreatedAt} />
                                        </Text>
                                    )}
                                    <Text style={styles.meta}>Members: {team.user_seats?.length || 0}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </>
            )}
        </LoadingState>
    </ScrollView>
);

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
    },
    section: {
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 12,
    },
    headerRow: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    label: {
        fontWeight: '500',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 6,
        marginBottom: 12,
        backgroundColor: '#f9f9f9',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    buttonGroup: {
        marginTop: 20,
        marginBottom: 16,
        flexDirection: "row",
        justifyContent: "space-between",
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
        width: "48%",
        backgroundColor: "#EFEFFF",
        padding: 10,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8
    },
    linkText: {
        fontSize: 16,
        color: "#007AFF"
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    card: {
        padding: 12,
        marginBottom: 16,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    description: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 4,
    },
    meta: {
        fontSize: 12,
        color: '#6b7280',
    },
    readOnlyText: {
        fontSize: 16,
        marginBottom: 8,
    },
    link: {
        color: '#2563eb',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 6,
    },
});

const inputStyle = {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
};
