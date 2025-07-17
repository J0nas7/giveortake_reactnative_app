import { BacklogItem } from '@/src/Components/BacklogItem'
import { MainStackParamList, ProjectStates, User } from '@/src/Types'
import { faClock, faList, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

type ProjectBacklogsSectionProps = {
    renderProject: ProjectStates
    canManageProject: boolean | undefined
    authUser: User | undefined
    accessibleBacklogsCount: number
}

export const ProjectBacklogsSection: React.FC<ProjectBacklogsSectionProps> = ({
    renderProject,
    canManageProject,
    authUser,
    accessibleBacklogsCount,
}) => renderProject && (
    <View style={styles.container}>
        <Text style={styles.sectionTitle}>Backlogs</Text>
        <Text style={styles.subtitle}>
            {accessibleBacklogsCount} backlog{accessibleBacklogsCount === 1 ? '' : 's'}
        </Text>

        <View style={styles.actions}>
            {canManageProject && (
                <ProjectNavButton icon={faPlus} label="Create Backlog" route="CreateBacklog" routeId={renderProject.Project_ID} />
            )}
            <ProjectNavButton icon={faClock} label="Time Entries" route="Time" routeId={renderProject.Project_ID} />
            <ProjectNavButton icon={faList} label="Backlogs & Tasks" route="Backlogs" routeId={renderProject.Project_ID} />
        </View>

        {renderProject.backlogs?.map((backlog) => (
            <BacklogItem
                key={backlog.Backlog_ID}
                backlog={backlog}
                renderProject={renderProject}
                authUser={authUser}
            />
        ))}
    </View>
)

const ProjectNavButton = ({
    icon,
    label,
    route,
    routeId
}: {
    icon: any;
    label: string;
    route: keyof MainStackParamList;
    routeId?: number;
}) => {
    // const navigation = useNavigation<NavigationProp<MainStackParamList>>();
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
            onPress={() => {
                if (route == "Time") {
                    navigation.navigate(route, {
                        screen: `${route}Tab`,
                        params: { id: routeId }
                    })
                } else {
                    navigation.navigate(route as any, { id: routeId })
                }
            }}
        >
            <FontAwesomeIcon icon={icon} size={16} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 16, color: "#007AFF" }}>{label}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
        marginVertical: 4,
        marginBottom: 20,
        gap: 4,
    },
})
