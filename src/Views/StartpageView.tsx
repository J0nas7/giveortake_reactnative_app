import React, { useCallback, useEffect } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Platform,
    Button
} from "react-native"
import { NavigationProp, useFocusEffect, useNavigation } from "@react-navigation/native"
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"

import { useTypedSelector, selectAuthUser } from "@/src/Redux"
import { useOrganisationsContext } from "@/src/Contexts"
import { faBuilding, faUser } from "@fortawesome/free-regular-svg-icons"
import { MainStackParamList } from "../Types"
import useMainViewJumbotron from "../Hooks/useMainViewJumbotron"

export const StartpageView = () => {
    // Hooks
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const { organisationsById, readOrganisationsByUserId } = useOrganisationsContext()
    const { handleScroll, handleFocusEffect } = useMainViewJumbotron({
        title: `Give Or Take`,
        faIcon: undefined,
        visibility: 100,
        rightIcon: faUser,
        rightIconActionRoute: "Profile",
    })

    // State
    const authUser = useTypedSelector(selectAuthUser)

    // Effects
    useEffect(() => {
        if (authUser?.User_ID) readOrganisationsByUserId(authUser.User_ID)
    }, [authUser])

    useFocusEffect(
        useCallback(() => {
            handleFocusEffect()
        }, [])
    )

    return (
        <ScrollView style={styles.container}>
            {/* Welcome Section */}
            <View style={styles.headerBox}>
                <View>
                    <TouchableOpacity style={styles.headerRow} onPress={() => navigation.navigate("Profile" as never)}>
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
            {organisationsById?.length ? (
                organisationsById.map((org) => (
                    <View key={org.Organisation_ID} style={styles.card}>
                        <TouchableOpacity onPress={() => navigation.navigate("Organisation", { id: (org.Organisation_ID ?? "").toString() })}>
                            <Text style={styles.cardTitle}>{org.Organisation_Name}</Text>
                        </TouchableOpacity>
                        <Text style={styles.cardDescription}>{org.Organisation_Description || 'No description available'}</Text>

                        {/* Teams */}
                        {org.teams?.length ? (
                            <View style={styles.subsection}>
                                <Text style={styles.subheading}>Teams:</Text>
                                {org.teams.map((team) => (
                                    <View key={team.Team_ID} style={styles.teamBox}>
                                        <TouchableOpacity onPress={() => navigation.navigate("Team", { id: (team.Team_ID ?? "").toString() })}>
                                            <Text style={styles.teamName}>{team.Team_Name}</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.textSmall}>{team.Team_Description || 'No description available'}</Text>
                                        <Text style={styles.textSmMuted}>{team.user_seats?.length} team members</Text>

                                        {/* Projects */}
                                        {team.projects?.length ? (
                                            <View style={styles.projectSection}>
                                                <Text style={styles.projectHeading}>Projekter:</Text>
                                                {team.projects.map((project) => (
                                                    <TouchableOpacity
                                                        key={project.Project_ID}
                                                        style={styles.projectCard}
                                                        onPress={() => navigation.navigate("Project", { id: (project.Project_ID ?? "").toString() })}
                                                    >
                                                        <Text style={styles.projectTitle}>{project.Project_Name}</Text>
                                                        <Text style={styles.textSmall}>{project.Project_Description || 'No description available'}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        ) : (
                                            <Text style={styles.textSmMuted}>Ingen projekter tilgængelige.</Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.textSmMuted}>Ingen teams tilgængelige.</Text>
                        )}
                    </View>
                ))
            ) : (
                <Text style={styles.textSmMuted}>Ingen organisationer fundet.</Text>
            )}
        </ScrollView>
    )
}

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
