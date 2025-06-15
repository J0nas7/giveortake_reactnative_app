import { NavigationProp, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import DraggableFlatList from "react-native-draggable-flatlist";
import { faLightbulb, faTrash, faWindowRestore } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";

import { useBacklogsContext, useTasksContext } from "@/src/Contexts";
import { Backlog, MainStackParamList, Status, Task } from "@/src/Types";
import { FlatList } from "react-native-gesture-handler";
import useMainViewJumbotron from "../Hooks/useMainViewJumbotron";

export const KanbanBoardView: React.FC = () => {
    // Hooks
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const route = useRoute<any>();
    const { id: backlogId } = route.params as { id: string };
    const { backlogById, readBacklogById } = useBacklogsContext();
    const {
        tasksById,
        readTasksByBacklogId,
        saveTaskChanges,
        removeTask,
        setTaskDetail,
    } = useTasksContext();
    const { handleScroll, handleFocusEffect } = useMainViewJumbotron({
        title: `Kanban Board`,
        faIcon: faWindowRestore,
        visibility: 100,
        rightIcon: faLightbulb,
        rightIconActionRoute: "Backlog",
        rightIconActionParams: { id: ((backlogById && backlogById?.Backlog_ID) ?? "").toString() },
    })

    // State
    const [backlog, setBacklog] = useState<Backlog | undefined>();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [kanbanColumns, setKanbanColumns] = useState<Status[] | undefined>(undefined)

    // Effects
    useEffect(() => {
        readBacklogById(parseInt(backlogId));
        readTasksByBacklogId(parseInt(backlogId));
    }, [backlogId]);

    useEffect(() => {
        if (backlogId && backlogById) {
            setBacklog(backlogById)
            setKanbanColumns(backlogById.statuses)
        }
    }, [backlogById]);

    useEffect(() => {
        setTasks(tasksById);
    }, [tasksById])

    useFocusEffect(
        useCallback(() => {
            if (typeof handleFocusEffect === "function") handleFocusEffect()
        }, [])
    )

    // Methods
    const handleArchive = async (task: Task) => {
        if (!task.Task_ID) return
        await removeTask(task.Task_ID, task.Backlog_ID, undefined);
        await readTasksByBacklogId(task.Backlog_ID, true);
    };

    // Moves a task to a new status and refreshes the task list.
    const handleMoveTask = async (task: Task, newStatus: number) => {
        await saveTaskChanges(
            { ...task, Status_ID: newStatus },
            task.Backlog_ID
        )

        await readTasksByBacklogId(parseInt(backlogId), true)
    };

    const renderTask = (task: Task, status: Status) => (
        <TouchableOpacity
            key={task.Task_ID}
            style={styles.taskCard}
            onPress={() => setTaskDetail(task)}
        >
            <Text style={styles.taskTitle}>{task.Task_Title}</Text>
            <TouchableOpacity onPress={() => handleArchive(task)}>
                <FontAwesomeIcon icon={faTrash} size={16} color="#FF3B30" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            {backlogById && <Text style={styles.title}>{backlogId} - {backlogById.Backlog_Name}</Text>}

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
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#F9FAFB",
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16
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
