import { BacklogStates, MainStackParamList, Status, Task } from '@/src/Types';
import { NavigationProp } from '@react-navigation/native';
import React from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type KanbanBoardProps = {
    backlogId: string
    backlogById: BacklogStates
    kanbanColumns: Status[] | undefined
    tasks: Task[]
    navigation: NavigationProp<MainStackParamList>
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
    backlogId,
    backlogById,
    kanbanColumns,
    tasks,
    navigation
}) => (
    <ScrollView style={styles.container}>
        <Text style={styles.title}>Kanban Board</Text>
        <Text style={styles.subtitle}>{backlogId} - {backlogById && backlogById.Backlog_Name}</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {kanbanColumns?.
                // Status_Order low to high:
                sort((a: Status, b: Status) => (a.Status_Order || 0) - (b.Status_Order || 0))
                .map(status => (
                    <View key={status.Status_ID} style={styles.column}>
                        <Text style={styles.columnTitle}>{status.Status_Name}</Text>
                        <FlatList
                            data={tasks.filter((t) => t.Status_ID === status.Status_ID)}
                            keyExtractor={(item) => (item.Task_ID ?? "").toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.taskCard}
                                    onPress={() => navigation.navigate('Task', {
                                        projectKey: item.backlog?.project?.Project_Key ?? "",
                                        taskKey: (item.Task_Key ?? "").toString(),
                                    })}
                                >
                                    <Text style={styles.taskTitle}>{item.Task_Title}</Text>
                                    {/* <TouchableOpacity onPress={() => handleArchive(item)}>
                                        <FontAwesomeIcon icon={faTrash} size={16} color="#FF3B30" />
                                    </TouchableOpacity> */}
                                </TouchableOpacity>
                            )}
                        /* onDragEnd={({ data }) => {
                             data.forEach((task) => handleMoveTask(task, status));
                        }}*/
                        />
                    </View>
                ))
            }
        </ScrollView>
    </ScrollView>
)

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#F9FAFB",
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 16,
    },
    column: {
        width: 300,
        padding: 12,
        marginRight: 10,
        backgroundColor: "#fff",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    columnTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 10,
        color: "#333",
    },
    taskCard: {
        backgroundColor: "#EFF6FF",
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    taskTitle: {
        fontSize: 16,
        color: "#1E3A8A",
    },
});
