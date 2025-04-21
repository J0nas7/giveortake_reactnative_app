import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
// import DraggableFlatList from "react-native-draggable-flatlist";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faTrash, faWindowRestore } from "@fortawesome/free-solid-svg-icons";

import { useProjectsContext, useTasksContext } from "@/src/Contexts";
import { Task, Project, MainStackParamList } from "@/src/Types";
import { FlatList } from "react-native-gesture-handler";

const STATUSES = ["To Do", "In Progress", "Waiting for Review", "Done"] as const;

type Status = typeof STATUSES[number];

export const KanbanBoardView: React.FC = () => {
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const route = useRoute<any>();
    const { id: projectId } = route.params as { id: string };

    const { projectById, readProjectById } = useProjectsContext();
    const {
        tasksById,
        readTasksByProjectId,
        saveTaskChanges,
        removeTask,
        setTaskDetail,
    } = useTasksContext();

    const [project, setProject] = useState<Project | undefined>();
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        readProjectById(parseInt(projectId));
        readTasksByProjectId(parseInt(projectId));
    }, [projectId]);

    useEffect(() => {
        if (projectById) setProject(projectById);
    }, [projectById]);

    useEffect(() => {
        setTasks(tasksById);
    }, [tasksById]);

    const handleArchive = async (task: Task) => {
        if (!task.Task_ID) return
        await removeTask(task.Task_ID, task.Project_ID);
        await readTasksByProjectId(task.Project_ID, true);
    };

    const handleMoveTask = async (task: Task, newStatus: Status) => {
        await saveTaskChanges({ ...task, Task_Status: newStatus }, task.Project_ID);
        await readTasksByProjectId(task.Project_ID, true);
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
            <Text style={styles.title}>
                <FontAwesomeIcon icon={faWindowRestore} /> Kanban: {project?.Project_Name}
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {STATUSES.map((status) => (
                    <View key={status} style={styles.column}>
                        <Text style={styles.columnTitle}>{status}</Text>
                        <FlatList
                            data={tasks.filter((t) => t.Task_Status === status)}
                            keyExtractor={(item) => (item.Task_ID ?? "").toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.taskCard}
                                    onPress={() => navigation.navigate('Task', {
                                        projectKey: item.project?.Project_Key ?? "",
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
                ))}
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
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 12,
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
