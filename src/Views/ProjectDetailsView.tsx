import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, Button, TouchableOpacity } from "react-native";
import { NavigationProp, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faGauge, faList, faWindowRestore, faClock, faLightbulb, faUsers } from "@fortawesome/free-solid-svg-icons";

// Internal
import { useProjectsContext } from "@/src/Contexts";
import { MainStackParamList, Project, ProjectFields } from "@/src/Types";
import { selectAuthUser, useTypedSelector } from "@/src/Redux";
import { ReadOnlyRow } from "../Components/ReadOnlyRow";
import useMainViewJumbotron from "../Hooks/useMainViewJumbotron";

export const ProjectDetailsView: React.FC = () => {
    // Hooks
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const route = useRoute();
    const { projectById, readProjectById, saveProjectChanges, removeProject } = useProjectsContext();
    const { handleScroll, handleFocusEffect } = useMainViewJumbotron({
        title: `Project Info`,
        faIcon: faLightbulb,
        visibility: 100,
        rightIcon: faUsers,
        rightIconActionRoute: "Team",
        rightIconActionParams: { id: ((projectById && projectById?.team?.Team_ID) ?? "").toString() },
    })

    // State
    const { id: projectId } = route.params as { id: string };  // Get id as projectId from route params
    const authUser = useTypedSelector(selectAuthUser);
    const [renderProject, setRenderProject] = useState<Project | undefined>(undefined);

    // Effects
    useEffect(() => {
        if (projectId) {
            readProjectById(parseInt(projectId));
        }
    }, [projectId]);

    useEffect(() => {
        if (projectById) {
            setRenderProject(projectById);
        }
    }, [projectById]);

    useFocusEffect(
        useCallback(() => {
            handleFocusEffect()
        }, [])
    )

    // Methods
    const handleProjectChange = (field: ProjectFields, value: string) => {
        setRenderProject((prev) =>
            prev ? { ...prev, [field]: value } : undefined
        );
    };

    const handleSaveChanges = async () => {
        if (renderProject) {
            await saveProjectChanges(renderProject, renderProject.Team_ID);
        }
    };

    const handleDeleteProject = async () => {
        if (renderProject?.Project_ID) {
            const removed = await removeProject(renderProject.Project_ID, renderProject.Team_ID);
            if (removed) {
                navigation.navigate("Team", { id: (renderProject.Team_ID ?? "").toString() });
            }
        }
    };

    if (!renderProject) return <Text>Loading...</Text>;

    const isOwner = authUser?.User_ID === renderProject.team?.organisation?.User_ID;

    return (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
            {/* Navigation Links */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20 }}>
                <ProjectNavButton icon={faGauge} label="Dashboard" route="Dashboard" projectId={renderProject.Project_ID} />
                <ProjectNavButton icon={faList} label="Backlog" route="Backlog" projectId={renderProject.Project_ID} />
                <ProjectNavButton icon={faWindowRestore} label="Kanban Board" route="Kanban" projectId={renderProject.Project_ID} />
                <ProjectNavButton icon={faClock} label="Time Entries" route="Time" projectId={renderProject.Project_ID} />
            </View>

            {/* Content */}
            {isOwner ? (
                <>
                    <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>Edit Project Details</Text>

                    <TextInput
                        placeholder="Project Name"
                        value={renderProject.Project_Name}
                        onChangeText={(text) => handleProjectChange("Project_Name", text)}
                        style={inputStyle}
                    />

                    <TextInput
                        placeholder="Project Key"
                        value={renderProject.Project_Key}
                        onChangeText={(text) => handleProjectChange("Project_Key", text)}
                        style={inputStyle}
                    />

                    <TextInput
                        placeholder="Project Description"
                        value={renderProject.Project_Description}
                        multiline
                        numberOfLines={5}
                        onChangeText={(text) => handleProjectChange("Project_Description", text)}
                        style={[inputStyle, { textAlignVertical: "top" }]}
                    />

                    <TextInput
                        placeholder="Start Date"
                        value={renderProject.Project_Start_Date || ""}
                        onChangeText={(text) => handleProjectChange("Project_Start_Date", text)}
                        style={inputStyle}
                    />

                    <TextInput
                        placeholder="End Date"
                        value={renderProject.Project_End_Date || ""}
                        onChangeText={(text) => handleProjectChange("Project_End_Date", text)}
                        style={inputStyle}
                    />

                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
                        <Button title="Save Changes" onPress={handleSaveChanges} color="#007AFF" />
                        <Button title="Delete Project" onPress={handleDeleteProject} color="#FF3B30" />
                    </View>
                </>
            ) : (
                <>
                    <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>Project Details</Text>
                    <ReadOnlyRow label="Project Name" value={renderProject.Project_Name} />
                    <ReadOnlyRow label="Project Status" value={renderProject.Project_Status} />
                    <ReadOnlyRow label="Project Key" value={`${renderProject.Project_Key}-0`} />
                    <ReadOnlyRow label="Description" value={renderProject.Project_Description} />
                    <ReadOnlyRow label="Start Date" value={renderProject.Project_Start_Date} />
                    <ReadOnlyRow label="End Date" value={renderProject.Project_End_Date} />
                </>
            )}
        </ScrollView>
    );
};

const inputStyle = {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
};

const ProjectNavButton = ({
    icon,
    label,
    route,
    projectId
}: {
    icon: any;
    label: string;
    route: keyof MainStackParamList;
    projectId?: number;
}) => {
    const navigation = useNavigation<any>();
    return (
        <TouchableOpacity
            style={{
                width: "48%",
                backgroundColor: "#EFEFFF",
                padding: 10,
                borderRadius: 10,
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8
            }}
            onPress={() => navigation.navigate(route, { id: projectId })}
        >
            <FontAwesomeIcon icon={icon} size={16} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 16, color: "#007AFF" }}>{label}</Text>
        </TouchableOpacity>
    );
};
