// External
import { faCheckDouble, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Picker } from '@react-native-picker/picker';
import { TFunction } from 'i18next';
import React, { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Internal
import { useBacklogsContext, useTasksContext } from '@/src/Contexts';
import { LoadingState } from '@/src/Core-UI/LoadingState';
import useRoleAccess from '@/src/Hooks/useRoleAccess';
import { BacklogStates, Task, TaskFields, TeamUserSeat } from '@/src/Types';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export const BacklogPage = () => {
    // ---- Hooks ----
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { t } = useTranslation(['backlog'])
    const {
        backlogById: renderBacklog,
        readBacklogById
    } = useBacklogsContext()
    const {
        tasksById: renderTasks,
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
    const [statusUrlEditing, setStatusUrlEditing] = useState<boolean>(false)
    const [newTask, setNewTask] = useState<any>({});
    const [sortKey, setSortKey] = useState<string>('Task_ID');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // ---- Effects ----
    useEffect(() => {
        if (backlogId) {
            readBacklogById(parseInt(backlogId));
            readTasksByBacklogId(parseInt(backlogId));
        }
    }, [backlogId]);

    // ---- Methods ----
    // Handles the 'Enter' key press event to trigger task creation.
    const ifEnter = (e: React.KeyboardEvent) => (e.key === 'Enter') ? prepareCreateTask() : null

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

    const prepareCreateTask = async () => {
        if (!renderBacklog) return;

        const newEntry = {
            ...newTask,
            Task_ID: Date.now(),
            Backlog_ID: renderBacklog.Backlog_ID,
            Status_ID: newTask?.Status_ID || renderBacklog.statuses?.[0]?.Status_ID,
        };

        await readTasksByBacklogId(parseInt(backlogId), true)
    };

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

    return (
        <BacklogContainerView
            renderBacklog={renderBacklog}
            sortedTasks={sortedTasks}
            newTask={newTask}
            currentSort={currentSort}
            currentOrder={currentOrder}
            t={t}
            selectedTaskIds={selectedTaskIds}
            selectedStatusIds={selectedStatusIds}
            selectAll={selectAll}
            canAccessBacklog={canAccessBacklog}
            canManageBacklog={canManageBacklog}
            handleSort={handleSort}
            handleCreateTask={prepareCreateTask}
            ifEnter={ifEnter}
            handleChangeNewTask={handleChangeNewTask}
            setTaskDetail={setTaskDetail}
            handleCheckboxChange={handleCheckboxChange}
            handleSelectAllChange={handleSelectAllChange}
            statusUrlEditing={statusUrlEditing}
            setStatusUrlEditing={setStatusUrlEditing}
        />
    )
}

export interface BacklogContainerViewProps {
    renderBacklog?: BacklogStates;
    sortedTasks: Task[];
    newTask: Task | undefined;
    currentSort: string;
    currentOrder: string;
    t: TFunction
    selectedTaskIds: string[]
    selectedStatusIds: string[]
    selectAll: boolean
    canAccessBacklog: boolean | undefined
    canManageBacklog: boolean | undefined
    handleSort: (column: string) => void;
    handleCreateTask: () => void;
    ifEnter: (e: React.KeyboardEvent) => Promise<void> | null
    handleChangeNewTask: (field: TaskFields, value: string) => Promise<void>
    setTaskDetail: (task: Task) => void;
    handleCheckboxChange: (taskId: string) => void
    handleSelectAllChange: (checked: boolean) => void
    statusUrlEditing: boolean
    setStatusUrlEditing: React.Dispatch<React.SetStateAction<boolean>>
}

export const BacklogContainerView: React.FC<BacklogContainerViewProps> = ({
    renderBacklog,
    sortedTasks,
    currentSort,
    currentOrder,
    newTask,
    selectedTaskIds,
    selectedStatusIds,
    selectAll,
    canAccessBacklog,
    canManageBacklog,
    handleSort,
    handleCreateTask,
    ifEnter,
    handleChangeNewTask,
    setTaskDetail,
    handleCheckboxChange,
    handleSelectAllChange,
    statusUrlEditing,
    setStatusUrlEditing
}) => {
    const handleInputKeyPress = (e: any) => {
        if (e.nativeEvent.key === 'Enter') {
            ifEnter(e);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <LoadingState
                singular="Backlog"
                renderItem={renderBacklog}
                permitted={canAccessBacklog}
            >
                {renderBacklog && (
                    <>
                        <View style={styles.header}>
                            <Text style={styles.title}>Backlog</Text>
                            <Text style={styles.subtitle}>{renderBacklog.Backlog_Name}</Text>
                            <TouchableOpacity
                                onPress={() => setStatusUrlEditing(!statusUrlEditing)}
                                style={styles.link}
                            >
                                <FontAwesomeIcon icon={faCheckDouble} size={16} />
                                <Text style={styles.linkText}>Filter Statuses</Text>
                            </TouchableOpacity>
                        </View>

                        {/* New Task Row */}
                        <View style={styles.row}>
                            <TextInput
                                placeholder="New Task"
                                value={newTask?.Task_Title ?? ''}
                                onChangeText={(text) => handleChangeNewTask("Task_Title", text)}
                                onKeyPress={handleInputKeyPress}
                                style={styles.input}
                            />

                            {/* Status Picker */}
                            <Picker
                                selectedValue={newTask?.Status_ID}
                                onValueChange={(value) => handleChangeNewTask("Status_ID", value.toString())}
                                style={styles.picker}
                            >
                                {renderBacklog.statuses
                                    ?.sort((a, b) => (a.Status_Order || 0) - (b.Status_Order || 0))
                                    .map(status => (
                                        <Picker.Item key={status.Status_ID} label={status.Status_Name} value={status.Status_ID} />
                                    ))}
                            </Picker>

                            {/* Assignee Picker */}
                            <Picker
                                selectedValue={newTask?.Assigned_User_ID}
                                onValueChange={(value) => handleChangeNewTask("Assigned_User_ID", value.toString())}
                                style={styles.picker}
                            >
                                <Picker.Item label="Unassigned" value="" />
                                {renderBacklog?.project?.team?.user_seats?.map((userSeat: TeamUserSeat) => (
                                    <Picker.Item
                                        key={userSeat.user?.User_ID}
                                        label={`${userSeat.user?.User_FirstName} ${userSeat.user?.User_Surname}`}
                                        value={userSeat.user?.User_ID}
                                    />
                                ))}
                            </Picker>

                            <TouchableOpacity onPress={handleCreateTask} style={styles.createButton}>
                                <FontAwesomeIcon icon={faPlus} size={16} color="#fff" />
                                <Text style={styles.buttonText}>Create</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Task List */}
                        <FlatList
                            data={sortedTasks.filter((task) =>
                                selectedStatusIds.length === 0 || selectedStatusIds.includes(task.Status_ID.toString())
                            )}
                            keyExtractor={item => (item.Task_ID ?? "").toString()}
                            renderItem={({ item }) => {
                                const assignee = renderBacklog.project?.team?.user_seats?.find(
                                    (userSeat: TeamUserSeat) => userSeat.user?.User_ID === item.Assigned_User_ID
                                )?.user;

                                return (
                                    <TouchableOpacity onPress={() => setTaskDetail(item)} style={styles.taskRow}>
                                        <Switch
                                            value={selectedTaskIds.includes((item.Task_ID ?? "").toString())}
                                            onValueChange={() => handleCheckboxChange({ target: { value: item.Task_ID } } as any)}
                                        />
                                        <Text style={styles.taskKey}>
                                            {renderBacklog.project?.Project_Key}-{item.Task_Key}
                                        </Text>
                                        <Text style={styles.taskTitle}>{item.Task_Title}</Text>
                                        <Text>{renderBacklog.statuses?.find(s => s.Status_ID === item.Status_ID)?.Status_Name}</Text>
                                        <Text>{assignee ? `${assignee.User_FirstName} ${assignee.User_Surname}` : "Unassigned"}</Text>
                                        <Text>{item.Task_CreatedAt}</Text>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </>
                )}
            </LoadingState>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16
    },
    header: {
        marginBottom: 16
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold'
    },
    subtitle: {
        fontSize: 16,
        color: '#666'
    },
    link: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8
    },
    linkText: {
        marginLeft: 4,
        color: '#007bff'
    },
    row: {
        flexDirection: 'column',
        marginBottom: 16
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        marginBottom: 8
    },
    picker: {
        height: 50,
        marginBottom: 8
    },
    createButton: {
        backgroundColor: '#007bff',
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 4
    },
    buttonText: {
        color: '#fff',
        marginLeft: 4
    },
    taskRow: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#eee'
    },
    taskKey: {
        fontWeight: 'bold'
    },
    taskTitle: {
        fontSize: 16
    },
    message: {
        padding: 16,
        fontSize: 16,
        color: '#999'
    }
});

