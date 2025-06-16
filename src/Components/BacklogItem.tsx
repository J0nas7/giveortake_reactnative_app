import useRoleAccess from '@/src/Hooks/useRoleAccess'
import { BacklogStates, MainStackParamList, Project, User } from '@/src/Types'
import { faGauge, faList, faWindowRestore } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import React, { useMemo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export interface BacklogItemProps {
    backlog: BacklogStates
    renderProject: Project
    authUser: User | undefined
}

export const BacklogItem: React.FC<BacklogItemProps> = ({
    backlog,
    renderProject,
    authUser
}) => {
    const { canAccessBacklog, canManageBacklog } = useRoleAccess(
        renderProject.team?.organisation?.User_ID,
        "backlog",
        backlog ? backlog.Backlog_ID : 0
    )

    const statusCounters = useMemo(() => {
        if (!backlog || !Array.isArray(backlog.statuses)) return []

        return backlog.statuses.map(status => {
            const count = backlog.tasks?.filter(task => task.Status_ID === status.Status_ID).length || 0
            const total = backlog.tasks?.length || 1
            return {
                name: status.Status_Name,
                counter: count,
                percentage: ((count / total) * 100).toFixed(0)
            }
        })
    }, [backlog])

    if (!canAccessBacklog) return null
    if (!backlog) return null

    return (
        <View style={styles.card}>
            <Text style={styles.title}>{backlog.Backlog_Name}</Text>
            <Text>{backlog.Backlog_Description || 'No description available'}</Text>

            <View style={styles.linkRow}>
                <ProjectNavButton icon={faGauge} label="Dashboard" route="Dashboard" routeId={backlog.Backlog_ID?.toString()} />
                <ProjectNavButton icon={faList} label="Backlog" route="Backlog" routeId={backlog.Backlog_ID?.toString()} />
                <ProjectNavButton icon={faWindowRestore} label="Kanban" route="Kanban" routeId={backlog.Backlog_ID?.toString()} />
            </View>

            <Text>Number of Tasks: {backlog.tasks?.length || 0}</Text>
            {statusCounters.map(({ name, counter, percentage }) => (
                <Text key={name}>{name}: {counter} ({percentage}%)</Text>
            ))}

            <Text>Start: {backlog.Backlog_StartDate || 'N/A'}</Text>
            <Text>End: {backlog.Backlog_EndDate || 'N/A'}</Text>

            {canManageBacklog && (
                <View>
                    <Text style={styles.edit}>Edit Backlog</Text>
                    {backlog.Backlog_IsPrimary ? (
                        <Text style={styles.disabled}>Primary Backlog</Text>
                    ) : (
                        <Text style={styles.red}>Finish Backlog</Text>
                    )}
                </View>
            )}
        </View>
    )
}

const ProjectNavButton = ({
    icon,
    label,
    route,
    routeId
}: {
    icon: any;
    label: string;
    route: keyof MainStackParamList;
    routeId?: string;
}) => {
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
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
            disabled={!routeId}
            onPress={() => {
                if (!routeId) return;
                console.log("Navigating to:", route, "with id:", routeId);
                navigation.navigate(
                    "Dashboard",
                    { id: "2" }
                )
            }}
        >
            <FontAwesomeIcon icon={icon} size={16} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 16, color: routeId ? "#007AFF" : "#aaa" }}>
                {label}{routeId ? `/${routeId}` : ''}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#f8f8f8',
        padding: 12,
        marginBottom: 12,
        borderRadius: 8,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 6,
    },
    linkRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
        marginVertical: 4,
        marginBottom: 20,
    },
    link: {
        color: '#1E90FF',
        fontSize: 12,
    },
    edit: {
        color: '#1E90FF',
        marginTop: 8,
    },
    disabled: {
        color: '#aaa',
    },
    red: {
        color: 'red',
    }
})
