import { ReadOnlyRow } from '@/src/Components/ReadOnlyRow';
import { readonlyVsEditorStyles } from '@/src/Core-UI/ReadonlyVsEditorStyles';
import { MainStackParamList, TeamStates } from '@/src/Types';
import { NavigationProp } from '@react-navigation/native';
import { Text, View } from 'react-native';

type ProjectsOverviewProps = {
    team: TeamStates;
    navigation: NavigationProp<MainStackParamList>;
};

export const TeamProjectsOverview: React.FC<ProjectsOverviewProps> = ({
    team,
    navigation
}) => team && (
    <View style={readonlyVsEditorStyles.section}>
        <Text style={readonlyVsEditorStyles.title}>Projects Overview</Text>
        {team.projects?.map((project) => (
            <View key={project.Project_ID} style={readonlyVsEditorStyles.card}>
                <Text
                    style={readonlyVsEditorStyles.link}
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
                    value={project.Project_Description || "No description available"}
                />
                <Text>Status: {project.Project_Status}</Text>
                <Text>Start: {project.Project_Start_Date || "N/A"}</Text>
                <Text>End: {project.Project_End_Date || "N/A"}</Text>
            </View>
        ))}
    </View>
);
