// External
import React, { useEffect, useMemo, useState } from 'react';

// Internal
import { Backlog, BacklogProps } from '@/src/Components/Backlog';
import { useBacklogsContext, useTasksContext } from '@/src/Contexts';
import useRoleAccess from '@/src/Hooks/useRoleAccess';
import { MainStackParamList, Task } from '@/src/Types';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export const BacklogView = () => {
    // ---- Hooks ----
    const route = useRoute<any>();
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const { t } = useTranslation(['backlog'])
    const {
        backlogById: renderBacklog,
        readBacklogById
    } = useBacklogsContext()
    const {
        tasksById: renderTasks,
        newTask,
        readTasksByBacklogId,
        setTaskDetail,
        handleChangeNewTask,
        addTask,
        removeTask
    } = useTasksContext()
    const { canAccessBacklog, canManageBacklog } = useRoleAccess(
        renderBacklog ? renderBacklog.project?.team?.organisation?.User_ID : undefined,
        "backlog",
        renderBacklog ? renderBacklog.Backlog_ID : 0
    )

    // ---- State ----
    const { id: backlogId } = route.params as { id: string };
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
    const [selectedStatusIds, setSelectedStatusIds] = useState<string[]>([])
    const [selectAll, setSelectAll] = useState(false); // To track the "Select All" checkbox
    const [sortKey, setSortKey] = useState<string>('Task_ID');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [displaySubview, setDisplaySubview] = useState<string>("")
    const [backlogsViewRefreshing, setBacklogsViewRefreshing] = useState<boolean>(false)

    // ---- Effects ----
    useEffect(() => {
        if (backlogId) {
            readBacklogById(parseInt(backlogId));
            readTasksByBacklogId(parseInt(backlogId));
        }
    }, [backlogId]);

    // ---- Methods ----
    // Handles the 'Enter' key press event to trigger task creation.
    const ifEnter = (e: React.KeyboardEvent) => (e.key === 'Enter') ? handleCreateTask() : null

    const handleInputKeyPress = (e: any) => {
        if (e.nativeEvent.key === 'Enter') {
            ifEnter(e);
        }
    };

    // Handles the change event for a checkbox input, updating the selected task IDs and URL parameters.
    const handleCheckboxChange = (taskId: string) => {
        // For React Native Switch, we don't have event.target.value/checked, so adapt accordingly
        let updatedTaskIds: string[];
        if (selectedTaskIds.includes(taskId)) {
            updatedTaskIds = selectedTaskIds.filter(id => id !== taskId);
        } else {
            updatedTaskIds = [...selectedTaskIds, taskId];
        }
        setSelectedTaskIds(updatedTaskIds);
        // If you have updateURLParams or similar, call it here if needed
    };

    // Handles the change event for selecting or deselecting all tasks.
    const handleSelectAllChange = (checked: boolean) => {
        // For React Native, Switch onValueChange gives the boolean directly
        setSelectAll(checked);

        let updatedTaskIds = selectedTaskIds;

        if (checked) {
            // Select all task IDs
            updatedTaskIds = sortedTasks.map((task) => task.Task_ID!.toString());
        } else {
            // Deselect all task IDs
            updatedTaskIds = [];
        }
        setSelectedTaskIds(updatedTaskIds);
    };

    const handleCreateTask = async () => {
        if (!renderBacklog) return;

        setDisplaySubview("")

        const newTaskPlaceholder: Task = {
            ...newTask,
            Backlog_ID: parseInt(backlogId),
            Team_ID: renderBacklog?.project?.team?.Team_ID || 0,
            Task_Title: newTask?.Task_Title || "",
            Status_ID: newTask?.Status_ID || renderBacklog.statuses && renderBacklog.statuses?.
                // Status_Order low to high:
                sort((a, b) => (a.Status_Order || 0) - (b.Status_Order || 0))[0]
                ?.Status_ID || 0,
            Assigned_User_ID: newTask?.Assigned_User_ID
        }

        await addTask(parseInt(backlogId), newTaskPlaceholder)

        await readTasksByBacklogId(parseInt(backlogId), true)
    };

    const backlogViewRefresh = async () => {
        setBacklogsViewRefreshing(true)
        if (backlogId) await readBacklogById(parseInt(backlogId));
        setBacklogsViewRefreshing(false)
    }

    // ---- Special: Sorting ----
    const currentSort = "Task_ID";
    const currentOrder: string = "desc";
    const SORT_KEYS: Record<number, keyof Task> = {
        1: "Task_Title",
        2: "Status_ID",
        3: "Assigned_User_ID",
        4: "Task_CreatedAt",
    };
    // Default sorting field if an invalid key is used
    const DEFAULT_SORT_KEY: keyof Task = "Task_ID";

    const handleSort = (key: string) => {
        const newOrder = sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortKey(key);
        setSortOrder(newOrder);
    };

    const sortedTasks = useMemo(() => {
        if (!Array.isArray(renderTasks)) return []; // Ensure tasks is an array

        let arrayToSort: Task[] = renderTasks

        const sortField = SORT_KEYS[Number(currentSort)] || DEFAULT_SORT_KEY; // Convert number to field name

        return [...arrayToSort].sort((a, b) => {
            const aValue = a[sortField] ?? "";
            const bValue = b[sortField] ?? "";
            if (typeof aValue === "string" && typeof bValue === "string") {
                return currentOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            } else if (typeof aValue === "number" && typeof bValue === "number") {
                return currentOrder === "asc" ? aValue - bValue : bValue - aValue;
            }
            return 0;
        });
    }, [renderTasks, sortKey, sortOrder]);

    const backlogProps: BacklogProps = {
        renderBacklog,
        sortedTasks,
        currentSort,
        currentOrder,
        t,
        navigation,
        selectedTaskIds,
        setSelectedTaskIds,
        selectedStatusIds,
        selectAll,
        canAccessBacklog,
        canManageBacklog,
        backlogsViewRefreshing,
        handleSort,
        handleCreateTask,
        ifEnter,
        handleInputKeyPress,
        newTask,
        handleChangeNewTask,
        setTaskDetail,
        handleCheckboxChange,
        handleSelectAllChange,
        displaySubview,
        setDisplaySubview,
        backlogViewRefresh
    }

    return <Backlog {...backlogProps} />
}
