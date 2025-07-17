// External
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { NavigationProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';

// Internal
import { TaskDetails, TaskDetailsProps } from '@/src/Components/Task/TaskDetails';
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

    const taskDetailsProps: TaskDetailsProps = {
        theTask
    }

    return <TaskDetails {...taskDetailsProps} />
};
