// External
import { NavigationProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Internal
import { useBacklogsContext, useTasksContext } from '@/src/Contexts';
import { selectAuthUser, useTypedSelector } from '@/src/Redux';
import { faLightbulb, faList } from '@fortawesome/free-solid-svg-icons';
import useMainViewJumbotron from '../Hooks/useMainViewJumbotron';
import { Backlog, MainStackParamList, Status, Task } from '../Types';

export const BacklogView = () => {
    // Hooks
    const { t } = useTranslation(['backlog']);
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const route = useRoute();
    const { id: backlogId } = route.params as { id: string };
    const { backlogById, readBacklogById } = useBacklogsContext();
    const {
        tasksById,
        readTasksByBacklogId,
        newTask,
        handleChangeNewTask,
        addTask,
        removeTask,
    } = useTasksContext();
    const { handleScroll, handleFocusEffect } = useMainViewJumbotron({
        title: `Backlog`,
        faIcon: faList,
        visibility: 100,
        rightIcon: faLightbulb,
        rightIconActionRoute: "Backlog",
        rightIconActionParams: { id: ((backlogById && backlogById.Backlog_ID) ?? "").toString() },
    })

    // State
    const authUser = useTypedSelector(selectAuthUser);
    const [renderBacklog, setRenderBacklog] = useState<Backlog | undefined>(undefined);
    const [renderTasks, setRenderTasks] = useState<Task[]>([]);

    // Effects
    useEffect(() => {
        readBacklogById(parseInt(backlogId));
        readTasksByBacklogId(parseInt(backlogId));
    }, [backlogId]);

    useEffect(() => {
        setRenderBacklog(backlogById);
    }, [backlogById]);

    useEffect(() => {
        setRenderTasks(tasksById);
    }, [tasksById]);

    useFocusEffect(
        useCallback(() => {
            handleFocusEffect()
        }, [])
    )

    // Methods
    const handleCreateTask = async () => {
        if (!renderBacklog) return

        const newTaskData: Task = {
            Backlog_ID: parseInt(backlogId),
            Team_ID: renderBacklog?.project?.team?.Team_ID ? renderBacklog?.project?.team?.Team_ID : 0,
            Task_Title: newTask?.Task_Title || '',
            Status_ID: newTask?.Status_ID || renderBacklog.statuses && renderBacklog.statuses?.
                // Status_Order low to high:
                sort((a: Status, b: Status) => (a.Status_Order || 0) - (b.Status_Order || 0))[0]
                ?.Status_ID || 0,
            Assigned_User_ID: newTask?.Assigned_User_ID
        };
        await addTask(parseInt(backlogId), newTaskData);
        await readTasksByBacklogId(parseInt(backlogId), true);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={renderTasks}
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
                        <Text style={styles.taskStatus}>
                            {renderBacklog?.statuses?.find(status => status.Status_ID === item.Status_ID)?.Status_Name}
                        </Text>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f9fafb',
        flex: 1,
    },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    addContainer: {
        marginBottom: 20,
    },
    input: {
        borderColor: '#d1d5db',
        borderWidth: 1,
        padding: 8,
        borderRadius: 8,
        marginBottom: 8,
    },
    picker: {
        borderColor: '#d1d5db',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 8,
    },
    taskCard: {
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
        flexDirection: 'column',
        gap: 4,
        alignItems: 'center',
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    taskStatus: {
        fontSize: 14,
        color: '#6b7280',
    },
    listContainer: {
        paddingBottom: 20,
    },
});
