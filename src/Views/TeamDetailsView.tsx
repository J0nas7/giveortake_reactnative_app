// External
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    ScrollView,
    StyleSheet,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, NavigationProp } from '@react-navigation/native';
import { Dimensions } from 'react-native';

// Internal
import { useTeamsContext } from '@/src/Contexts';
import { MainStackParamList, Team, TeamFields, User } from '@/src/Types';
import { useTypedSelector, selectAuthUser } from '@/src/Redux';
import { ReadOnlyRow } from '../Components/ReadOnlyRow';

const screenWidth = Dimensions.get('window').width;

export const TeamDetailsView: React.FC = () => {
    const route = useRoute();
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const { id: teamId } = route.params as { id: string };
    const { teamById, readTeamById, saveTeamChanges, removeTeam } = useTeamsContext();
    const authUser = useTypedSelector(selectAuthUser);

    const [renderTeam, setRenderTeam] = useState<Team | undefined>(undefined);

    useEffect(() => {
        readTeamById(parseInt(teamId));
    }, [teamId]);

    useEffect(() => {
        if (teamById) {
            setRenderTeam(teamById);
        }
    }, [teamById]);

    const handleTeamChange = (field: TeamFields, value: string) => {
        if (!renderTeam) return;

        setRenderTeam((prev) => ({
            ...prev!,
            [field]: value,
        }));
    };

    const handleSaveChanges = async () => {
        if (renderTeam) {
            await saveTeamChanges(renderTeam, renderTeam.Organisation_ID);
            Alert.alert('Saved', 'Team changes saved successfully!');
        }
    };

    const handleDeleteTeam = async () => {
        if (!renderTeam || !renderTeam.Team_ID) return;

        const removed = await removeTeam(renderTeam.Team_ID, renderTeam.Organisation_ID);
        if (removed) {
            navigation.navigate("Organisation", { id: renderTeam.Organisation_ID.toString() });
        }
    };

    if (!renderTeam) {
        return <Text>Loading...</Text>;
    }

    const isOwner = authUser && renderTeam.organisation?.User_ID === authUser.User_ID;

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity onPress={() => navigation.navigate("Organisation", { id: renderTeam.Organisation_ID.toString() })}>
                <Text style={styles.link}>&laquo; Go to Organisation</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Team Settings</Text>

            {isOwner ? (
                <View style={styles.section}>
                    <Text style={styles.label}>Team Name</Text>
                    <TextInput
                        style={styles.input}
                        value={renderTeam.Team_Name}
                        onChangeText={(text) => handleTeamChange('Team_Name', text)}
                    />

                    <Text style={styles.label}>Team Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        multiline
                        numberOfLines={4}
                        value={renderTeam.Team_Description}
                        onChangeText={(text) => handleTeamChange('Team_Description', text)}
                    />

                    <View style={styles.buttonGroup}>
                        <Button title="Save Changes" onPress={handleSaveChanges} />
                        <Button title="Delete Team" color="red" onPress={handleDeleteTeam} />
                    </View>
                </View>
            ) : (
                <View style={styles.section}>
                    <ReadOnlyRow label="Team Name" value={renderTeam.Team_Name} />

                    <ReadOnlyRow
                        label="Team Description"
                        value={renderTeam.Team_Description || 'No description available'}
                    />
                </View>
            )}

            {/* Projects Section */}
            <View style={styles.section}>
                <Text style={styles.title}>Projects Overview</Text>
                {renderTeam.projects?.map((project) => (
                    <View key={project.Project_ID} style={styles.card}>
                        <Text style={styles.link} onPress={() => navigation.navigate("Project", { id: (project.Project_ID ?? "").toString() })}>
                            {project.Project_Name}
                        </Text>
                        <ReadOnlyRow
                            label="Team Description"
                            value={renderTeam.Team_Description || 'No description available'}
                        />
                        <Text>Status: {project.Project_Status}</Text>
                        <Text>Start: {project.Project_Start_Date || 'N/A'}</Text>
                        <Text>End: {project.Project_End_Date || 'N/A'}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

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
        marginTop: 16,
        gap: 10,
    },
});
