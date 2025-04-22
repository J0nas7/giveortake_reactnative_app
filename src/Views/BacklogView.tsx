// External
import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Button,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { NavigationProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { faTrashCan } from '@fortawesome/free-regular-svg-icons';

// Internal
import { useProjectsContext, useTasksContext } from '@/src/Contexts';
import { useTypedSelector, selectAuthUser } from '@/src/Redux';
import { MainStackParamList, Task } from '../Types';
import useMainViewJumbotron from '../Hooks/useMainViewJumbotron';
import { faLightbulb, faList } from '@fortawesome/free-solid-svg-icons';

export const BacklogView = () => {
    // Hooks
    const { t } = useTranslation(['backlog']);
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const route = useRoute();
    const { id: projectId } = route.params as { id: string };
    const { projectById, readProjectById } = useProjectsContext();
    const {
        tasksById,
        readTasksByProjectId,
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
        rightIconActionRoute: "Project",
        rightIconActionParams: { id: ((projectById && projectById?.Project_ID) ?? "").toString() },
    })

    // State
    const authUser = useTypedSelector(selectAuthUser);
    const [renderProject, setRenderProject] = useState<any>();
    const [renderTasks, setRenderTasks] = useState<Task[]>([]);

    // Effects
    useEffect(() => {
        readProjectById(parseInt(projectId));
        readTasksByProjectId(parseInt(projectId));
    }, [projectId]);

    useEffect(() => {
        setRenderProject(projectById);
    }, [projectById]);

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
        const newTaskData = {
            Project_ID: parseInt(projectId),
            Team_ID: renderProject?.team?.Team_ID || 0,
            Task_Title: newTask?.Task_Title || '',
            Task_Status: newTask?.Task_Status || 'To Do',
            Assigned_User_ID: newTask?.Assigned_User_ID,
        };
        await addTask(parseInt(projectId), newTaskData);
        await readTasksByProjectId(parseInt(projectId), true);
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
                            projectKey: item.project?.Project_Key ?? "",
                            taskKey: (item.Task_Key ?? "").toString(),
                        })}
                    >
                        <Text style={styles.taskTitle}>{item.Task_Title}</Text>
                        <Text style={styles.taskStatus}>{item.Task_Status}</Text>
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
