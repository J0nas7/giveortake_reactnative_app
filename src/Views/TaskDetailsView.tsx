// External
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { NavigationProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

// Internal
import { CommentsArea, CtaButtons, DescriptionArea, MediaFilesArea, TaskInfoArea, TitleArea } from '@/src/Components/Partials/TaskDetails';
import { useTasksContext } from '@/src/Contexts';
import { MainStackParamList, Task } from '@/src/Types';
import useMainViewJumbotron from '../Hooks/useMainViewJumbotron';

export const TaskDetailsView = () => {
    // Hooks
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const route = useRoute();
    const { projectKey, taskKey } = route.params as { projectKey: string; taskKey: string };
    const { taskByKeys, readTaskByKeys, setTaskDetail } = useTasksContext();
    const { handleScroll, handleFocusEffect } = useMainViewJumbotron({
        title: `Task Details`,
        faIcon: undefined,
        visibility: 100,
        rightIcon: faLightbulb,
        rightIconActionRoute: "Backlog",
        rightIconActionParams: { id: (taskByKeys?.Backlog_ID ?? "").toString() }
    })

    // State
    const [theTask, setTheTask] = useState<Task | undefined>(undefined);

    // Effects
    useEffect(() => {
        const fetchTask = async () => {
            if (projectKey && taskKey) {
                setTheTask(undefined);
                await readTaskByKeys(projectKey, taskKey);
            }
        };

        fetchTask();
    }, [projectKey, taskKey]);

    useEffect(() => {
        if (taskByKeys) setTheTask(taskByKeys);
    }, [taskByKeys]);

    useFocusEffect(
        useCallback(() => {
            handleFocusEffect()
        }, [])
    )

    // Methods
    if (!theTask) {
        return (
            <View style={styles.pageContent}>
                <Text>Task not found</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.pageContent}>
            <View style={styles.wrapper}>
                <View style={styles.content}>
                    <TitleArea task={theTask} />
                    <DescriptionArea task={theTask} />
                    <MediaFilesArea task={theTask} />
                    <CommentsArea task={theTask} />
                    <CtaButtons task={theTask} />
                    <TaskInfoArea task={theTask} />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    pageContent: {
        padding: 16,
        backgroundColor: '#fff',
        flexGrow: 1,
    },
    wrapper: {
        flex: 1,
        gap: 16,
    },
    link: {
        color: '#007bff',
        fontSize: 16,
    },
    content: {
        flexDirection: 'column',
        gap: 16,
        flex: 1,
    },
});
