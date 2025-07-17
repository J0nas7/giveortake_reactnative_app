import { MainStackParamList, Organisation, TeamUserSeat, User } from '@/src/Types'
import { faBuilding, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { NavigationProp } from '@react-navigation/native'
import React from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

type StartpageProps = {
    navigation: NavigationProp<MainStackParamList>
    authUser: User | undefined
    organisationsById: Organisation[]
    approvePending: (mySeat: TeamUserSeat) => Promise<void>
    removeTeamUserSeat: (itemId: number, parentId: number, redirect: string | undefined) => Promise<void>
}

export const Startpage: React.FC<StartpageProps> = ({
    navigation,
    authUser,
    organisationsById,
    approvePending,
    removeTeamUserSeat
}) => (
    <ScrollView style={styles.container}>
        {/* Welcome Section */}
        <View style={styles.headerBox}>
            <View>
                <TouchableOpacity style={styles.headerRow} onPress={() => navigation.navigate("Profile")}>
                    <FontAwesomeIcon icon={faUser} size={20} color="#1ab11f" />
                    <Text style={styles.headerText}>Hej {authUser?.User_FirstName}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => navigation.navigate("CreateOrganisation" as never)}
                >
                    <FontAwesomeIcon icon={faBuilding} size={16} color="#1ab11f" />
                    <Text style={styles.createButtonText}>Create Organisation</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("Downloaded")}>
                <Text style={styles.createButtonText}>Downloads</Text>
            </TouchableOpacity>
        </View>

        <Text style={styles.sectionIntro}>
            Din GiveOrTake-bruger har adgang til følgende organisationer:
        </Text>

        {/* Organisation List */}
        <OrganisationListView
            organisationsById={organisationsById}
            authUser={authUser}
            navigation={navigation}
            approvePending={approvePending}
            removeTeamUserSeat={removeTeamUserSeat}
        />
    </ScrollView>
)

type OrganisationListProps = {
    organisationsById: Organisation[]
    authUser: User | undefined
    navigation: NavigationProp<MainStackParamList>
    approvePending: (mySeat: TeamUserSeat) => Promise<void>
    removeTeamUserSeat: (itemId: number, parentId: number, redirect: string | undefined) => Promise<void>
}

export const OrganisationListView: React.FC<OrganisationListProps> = ({
    organisationsById,
    authUser,
    navigation,
    approvePending,
    removeTeamUserSeat
}) => (
    <>
        {organisationsById?.length ? (
            organisationsById.map((organisation) => {
                // Find current user's seat in first team (or you can adjust logic for other teams if needed)
                const seat = organisation.teams && organisation.teams[0].user_seats?.find(seat => seat.User_ID === authUser?.User_ID);

                // Skip organisations where user's seat is inactive
                if (seat?.Seat_Status === "Inactive") return null;

                // Render pending approval card
                if (seat?.Seat_Status === "Pending") {
                    return (
                        <View key={organisation.Organisation_ID} style={[organisationListStyles.card, organisationListStyles.pendingCard]}>
                            <Text style={organisationListStyles.pendingTitle}>{organisation.Organisation_Name}</Text>
                            <Text style={organisationListStyles.pendingMessage}>Your access is pending your approval.</Text>
                            <View style={organisationListStyles.pendingButtons}>
                                <TouchableOpacity onPress={() => approvePending(seat)}>
                                    <Text style={organisationListStyles.approveButton}>Approve</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => removeTeamUserSeat(seat.Seat_ID ?? 0, seat.Team_ID, "/")}>
                                    <Text style={organisationListStyles.declineButton}>Decline</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }

                // Normal active seats render full organisation info
                return (
                    <View key={organisation.Organisation_ID} style={organisationListStyles.card}>
                        {/* Organisation Name */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Organisation", { id: (organisation.Organisation_ID ?? "").toString() })}
                        >
                            <Text style={organisationListStyles.cardTitle}>{organisation.Organisation_Name}</Text>
                        </TouchableOpacity>

                        <Text style={organisationListStyles.cardDescription}>
                            {organisation.Organisation_Description || 'No description available'}
                        </Text>

                        {/* Teams */}
                        {organisation.teams?.length ? (
                            <View style={organisationListStyles.subsection}>
                                <Text style={organisationListStyles.subheading}>Teams:</Text>
                                {organisation.teams.map((team) => (
                                    <View key={team.Team_ID} style={organisationListStyles.teamBox}>
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate("Team", { id: (team.Team_ID ?? "").toString() })}
                                        >
                                            <Text style={organisationListStyles.teamName}>{team.Team_Name}</Text>
                                        </TouchableOpacity>
                                        <Text style={organisationListStyles.textSmall}>{team.Team_Description || 'No description available'}</Text>
                                        <Text style={organisationListStyles.textSmMuted}>{team.user_seats?.length} team members</Text>

                                        {/* Projects */}
                                        {team.projects?.length ? (
                                            <View style={organisationListStyles.projectSection}>
                                                <Text style={organisationListStyles.projectHeading}>Projekter:</Text>
                                                {team.projects.map((project) => (
                                                    <TouchableOpacity
                                                        key={project.Project_ID}
                                                        style={organisationListStyles.projectCard}
                                                        onPress={() => navigation.navigate("Backlogs", { id: (project.Project_ID ?? "").toString() })}
                                                    >
                                                        <Text style={organisationListStyles.projectTitle}>{project.Project_Name}</Text>
                                                        <Text style={organisationListStyles.textSmall}>{project.Project_Description || 'No description available'}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        ) : (
                                            <Text style={organisationListStyles.textSmMuted}>Ingen projekter tilgængelige.</Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text style={organisationListStyles.textSmMuted}>Ingen teams tilgængelige.</Text>
                        )}
                    </View>
                );
            })
        ) : (
            <Text style={organisationListStyles.textSmMuted}>Ingen organisationer fundet.</Text>
        )}
    </>
)

const organisationListStyles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#fff",
        flex: 1
    },
    card: {
        padding: 15,
        marginBottom: 20,
        borderRadius: 12,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1ab11f"
    },
    cardDescription: {
        fontSize: 14,
        color: "#555",
        marginTop: 4
    },
    subsection: {
        marginTop: 12
    },
    subheading: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 6
    },
    teamBox: {
        padding: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#1ab11f",
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        marginBottom: 12
    },
    teamName: {
        fontSize: 16,
        fontWeight: "500",
        color: "#1ab11f"
    },
    textSmall: {
        fontSize: 13,
        color: "#555"
    },
    textSmMuted: {
        fontSize: 12,
        color: "#999",
        marginTop: 4
    },
    projectSection: {
        marginTop: 10
    },
    projectHeading: {
        fontSize: 13,
        fontWeight: "600",
        color: "#444",
        marginBottom: 6
    },
    projectCard: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1
    },
    projectTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1ab11f"
    },
    // Pending seat styles
    pendingCard: {
        backgroundColor: "#FEF3C7",
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        shadowColor: "#F59E0B",
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3
    },
    pendingTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#B45309"
    },
    pendingMessage: {
        fontSize: 14,
        color: "#92400E",
        marginTop: 6
    },
    pendingButtons: {
        flexDirection: "row",
        marginTop: 12,
        gap: 15
    },
    approveButton: {
        color: "#2563EB",
        fontWeight: "600",
        marginRight: 20
    },
    declineButton: {
        color: "#DC2626",
        fontWeight: "600"
    }
});

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#fff",
        flex: 1
    },
    link: {
        color: "#1ab11f",
        fontWeight: "bold",
        marginBottom: 20
    },
    headerBox: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        padding: 15,
        borderRadius: 10,
        backgroundColor: "#f0fdf4"
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 10
    },
    headerText: {
        fontSize: 20,
        fontWeight: "bold"
    },
    createButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    createButtonText: {
        color: "#1ab11f",
        fontWeight: "600"
    },
    sectionIntro: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 16
    },
    card: {
        padding: 15,
        marginBottom: 20,
        borderRadius: 12,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1ab11f"
    },
    cardDescription: {
        fontSize: 14,
        color: "#555",
        marginTop: 4
    },
    subsection: {
        marginTop: 12
    },
    subheading: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 6
    },
    teamBox: {
        padding: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#1ab11f",
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        marginBottom: 12
    },
    teamName: {
        fontSize: 16,
        fontWeight: "500",
        color: "#1ab11f"
    },
    textSmall: {
        fontSize: 13,
        color: "#555"
    },
    textSmMuted: {
        fontSize: 12,
        color: "#999",
        marginTop: 4
    },
    projectSection: {
        marginTop: 10
    },
    projectHeading: {
        fontSize: 13,
        fontWeight: "600",
        color: "#444",
        marginBottom: 6
    },
    projectCard: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1
    },
    projectTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1ab11f"
    }
})
