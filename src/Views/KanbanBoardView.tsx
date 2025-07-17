import { NavigationProp, useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
// import DraggableFlatList from "react-native-draggable-flatlist";
import { faLightbulb, faWindowRestore } from "@fortawesome/free-solid-svg-icons";

import { KanbanBoard } from '@/src/Components/Backlog';
import { useBacklogsContext, useTasksContext } from "@/src/Contexts";
import { Backlog, MainStackParamList, Status, Task } from "@/src/Types";
import useMainViewJumbotron from "../Hooks/useMainViewJumbotron";

export const KanbanBoardView = () => {
    // Hooks
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const route = useRoute();
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

    return (
        <KanbanBoard
            backlogId={backlogId}
            backlogById={backlogById}
            kanbanColumns={kanbanColumns}
            tasks={tasks}
            navigation={navigation}
        />
    );
};
