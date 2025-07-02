// External
import { faCheckDouble, faChevronRight, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
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
import { editorStyles, ModalToggler, modalTogglerStyles } from '@/src/Components/ModalToggler';
import { TaskBulkActionMenu } from '@/src/Components/TaskBulkActionMenu';
import { useBacklogsContext, useTasksContext } from '@/src/Contexts';
import { LoadingState } from '@/src/Core-UI/LoadingState';
import useRoleAccess from '@/src/Hooks/useRoleAccess';
import { BacklogStates, MainStackParamList, Task, TaskFields } from '@/src/Types';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { RefreshControl } from 'react-native-gesture-handler';

export const BacklogPage = () => {
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
    const ifEnter = (e: React.KeyboardEvent) => (e.key === 'Enter') ? prepareCreateTask() : null

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

    const prepareCreateTask = async () => {
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

    return (
        <BacklogContainerView
            renderBacklog={renderBacklog}
            sortedTasks={sortedTasks}
            currentSort={currentSort}
            currentOrder={currentOrder}
            t={t}
            navigation={navigation}
            selectedTaskIds={selectedTaskIds}
            setSelectedTaskIds={setSelectedTaskIds}
            selectedStatusIds={selectedStatusIds}
            selectAll={selectAll}
            canAccessBacklog={canAccessBacklog}
            canManageBacklog={canManageBacklog}
            backlogsViewRefreshing={backlogsViewRefreshing}
            handleSort={handleSort}
            handleCreateTask={prepareCreateTask}
            ifEnter={ifEnter}
            handleInputKeyPress={handleInputKeyPress}
            newTask={newTask}
            handleChangeNewTask={handleChangeNewTask}
            setTaskDetail={setTaskDetail}
            handleCheckboxChange={handleCheckboxChange}
            handleSelectAllChange={handleSelectAllChange}
            displaySubview={displaySubview}
            setDisplaySubview={setDisplaySubview}
            backlogViewRefresh={backlogViewRefresh}
        />
    )
}

export interface BacklogContainerViewProps {
    renderBacklog?: BacklogStates;
    sortedTasks: Task[];
    currentSort: string;
    currentOrder: string;
    t: TFunction
    navigation: NavigationProp<MainStackParamList>
    selectedTaskIds: string[]
    setSelectedTaskIds: React.Dispatch<React.SetStateAction<string[]>>
    selectedStatusIds: string[]
    selectAll: boolean
    canAccessBacklog: boolean | undefined
    canManageBacklog: boolean | undefined
    backlogsViewRefreshing: boolean
    handleSort: (column: string) => void;
    handleCreateTask: () => void;
    ifEnter: (e: React.KeyboardEvent) => Promise<void> | null
    handleInputKeyPress: (e: any) => void
    newTask: Task | undefined
    handleChangeNewTask: (field: TaskFields, value: string) => Promise<void>
    setTaskDetail: (task: Task) => void;
    handleCheckboxChange: (taskId: string) => void
    handleSelectAllChange: (checked: boolean) => void
    displaySubview: string
    setDisplaySubview: React.Dispatch<React.SetStateAction<string>>
    backlogViewRefresh: () => Promise<void>
}

export const BacklogContainerView: React.FC<BacklogContainerViewProps> = ({
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
}) => !backlogsViewRefreshing && (
    <LoadingState singular="Backlog" renderItem={renderBacklog} permitted={canAccessBacklog}>
        {displaySubview === "CreateTask" && renderBacklog ? (
            <CreateTaskView
                renderBacklog={renderBacklog}
                newTask={newTask}
                handleChangeNewTask={handleChangeNewTask}
                handleInputKeyPress={handleInputKeyPress}
                handleCreateTask={handleCreateTask}
                setDisplaySubview={setDisplaySubview}
                backlogsViewRefreshing={backlogsViewRefreshing}
                backlogViewRefresh={backlogViewRefresh}
            />
        ) : displaySubview === "FilterStatuses" && renderBacklog ? (
            <>

            </>
        ) : renderBacklog ? (
            <RenderBacklogView
                navigation={navigation}
                renderBacklog={renderBacklog}
                sortedTasks={sortedTasks}
                selectAll={selectAll}
                selectedStatusIds={selectedStatusIds}
                selectedTaskIds={selectedTaskIds}
                handleCheckboxChange={handleCheckboxChange}
                handleSelectAllChange={handleSelectAllChange}
                setDisplaySubview={setDisplaySubview}
                backlogsViewRefreshing={backlogsViewRefreshing}
                backlogViewRefresh={backlogViewRefresh}
                setSelectedTaskIds={setSelectedTaskIds}
            />
        ) : null}
    </LoadingState>
);

type CreateTaskViewProps = {
    renderBacklog: BacklogStates
    newTask: Task | undefined
    handleChangeNewTask: (field: TaskFields, value: string) => Promise<void>
    handleInputKeyPress: (e: any) => void
    handleCreateTask: () => void
    setDisplaySubview: React.Dispatch<React.SetStateAction<string>>
    backlogsViewRefreshing: boolean
    backlogViewRefresh: () => Promise<void>
}

export const CreateTaskView: React.FC<CreateTaskViewProps> = ({
    renderBacklog,
    newTask,
    handleChangeNewTask,
    handleInputKeyPress,
    handleCreateTask,
    setDisplaySubview,
    backlogsViewRefreshing,
    backlogViewRefresh
}) => {
    const [togglerIsVisible, setTogglerIsVisible] = useState<string | false>(false)

    return (
        renderBacklog && (
            <>
                <ScrollView
                    style={styles.container}
                    refreshControl={
                        <RefreshControl
                            refreshing={backlogsViewRefreshing}
                            onRefresh={backlogViewRefresh}
                        />
                    }
                >
                    <View style={styles.content}>
                        <View style={editorStyles.rowBetween}>
                            <TouchableOpacity onPress={() => setDisplaySubview("")}>
                                <FontAwesomeIcon icon={faXmark} size={20} />
                            </TouchableOpacity>
                            <Text style={editorStyles.title}>
                                Create New Task
                            </Text>
                            <View />
                        </View>

                        <View style={styles.actions}>
                            <TextInput
                                style={styles.input}
                                placeholder="New Task"
                                value={newTask?.Task_Title || ''}
                                onChangeText={(text) => handleChangeNewTask("Task_Title", text)}
                                onKeyPress={handleInputKeyPress}
                            />
                            <TouchableOpacity style={styles.button} onPress={handleCreateTask}>
                                <FontAwesomeIcon icon={faPlus} size={16} color="#fff" />
                                <Text style={styles.buttonText}>Create</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={editorStyles.formGroup}>
                            <Text style={editorStyles.label}>Status</Text>
                            <TouchableOpacity
                                style={editorStyles.formGroupItemToggler}
                                onPress={() => setTogglerIsVisible("Status")}
                            >
                                <Text>
                                    {renderBacklog.statuses?.find(status => status.Status_ID == newTask?.Status_ID)?.Status_Name}
                                </Text>
                                <FontAwesomeIcon icon={faChevronRight} />
                            </TouchableOpacity>
                        </View>

                        <View style={editorStyles.formGroup}>
                            <Text style={editorStyles.label}>Assignee</Text>
                            <TouchableOpacity
                                style={editorStyles.formGroupItemToggler}
                                onPress={() => setTogglerIsVisible("Assignee")}
                            >
                                {(() => {
                                    const assignee = renderBacklog.project?.team?.user_seats?.find(seat => seat.User_ID == newTask?.Assigned_User_ID)?.user

                                    return (
                                        <Text>
                                            {assignee?.User_FirstName} {assignee?.User_Surname}
                                        </Text>
                                    )
                                })()}
                                <FontAwesomeIcon icon={faChevronRight} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                <ModalToggler visibility={togglerIsVisible} callback={setTogglerIsVisible}>
                    {togglerIsVisible === "Status" ? (
                        <Picker
                            selectedValue={Number(newTask?.Status_ID)}
                            onValueChange={(value) => handleChangeNewTask("Status_ID", value.toString())}
                        >
                            {renderBacklog.statuses
                                ?.sort((a, b) => (a.Status_Order || 0) - (b.Status_Order || 0))
                                .map(status => (
                                    <Picker.Item
                                        key={status.Status_ID}
                                        label={status.Status_Name}
                                        value={status.Status_ID}
                                    />
                                ))
                            }
                        </Picker>
                    ) : togglerIsVisible === "Assignee" ? (
                        <Picker
                            selectedValue={Number(newTask?.Assigned_User_ID)}
                            onValueChange={(value) => handleChangeNewTask("Assigned_User_ID", value.toString())}
                        >
                            <Picker.Item label="Unassigned" value="" />
                            {renderBacklog.project?.team?.user_seats?.map((userSeat) => (
                                <Picker.Item
                                    key={userSeat.user?.User_ID}
                                    label={`${userSeat.user?.User_FirstName} ${userSeat.user?.User_Surname}`}
                                    value={userSeat.user?.User_ID}
                                />
                            ))}
                        </Picker>
                    ) : null}
                </ModalToggler>
            </>
        )
    )
}

type RenderBacklogViewProps = {
    navigation: NavigationProp<MainStackParamList>
    renderBacklog: BacklogStates
    sortedTasks: Task[]
    selectAll: boolean
    selectedStatusIds: string[]
    selectedTaskIds: string[]
    handleCheckboxChange: (taskId: string) => void
    handleSelectAllChange: (checked: boolean) => void
    setDisplaySubview: React.Dispatch<React.SetStateAction<string>>
    backlogsViewRefreshing: boolean
    backlogViewRefresh: () => Promise<void>
    setSelectedTaskIds: React.Dispatch<React.SetStateAction<string[]>>
}

export const RenderBacklogView: React.FC<RenderBacklogViewProps> = ({
    navigation,
    renderBacklog,
    sortedTasks,
    selectAll,
    selectedStatusIds,
    selectedTaskIds,
    handleCheckboxChange,
    handleSelectAllChange,
    setDisplaySubview,
    backlogsViewRefreshing,
    backlogViewRefresh,
    setSelectedTaskIds
}) => renderBacklog && (
    <>
        {renderBacklog.project && (
            <TaskBulkActionMenu
                renderProject={renderBacklog.project}
                selectedTaskIds={selectedTaskIds}
                setSelectedTaskIds={setSelectedTaskIds}
                backlogsViewRefresh={backlogViewRefresh}
            />
        )}
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={backlogsViewRefreshing}
                    onRefresh={backlogViewRefresh}
                />
            }
        >
            <View style={styles.content}>
                <Text style={styles.header}>{renderBacklog.Backlog_Name}</Text>

                <TouchableOpacity
                    style={modalTogglerStyles.bulkEditItemToggler}
                    onPress={() => setDisplaySubview("CreateTask")}
                >
                    <Text>New task</Text>
                    <FontAwesomeIcon icon={faPlus} size={16} color="#000" />
                </TouchableOpacity>

                {/* Toggle Status Filter Link */}
                <TouchableOpacity
                    onPress={() => setDisplaySubview("FilterStatuses")}
                    style={styles.link}
                >
                    <FontAwesomeIcon icon={faCheckDouble} size={16} />
                    <Text style={styles.linkText}>Filter Statuses</Text>
                </TouchableOpacity>

                {/* Select All Switch */}
                <View style={styles.selectAllRow}>
                    <Text>Select All</Text>
                    <Switch value={selectAll} onValueChange={handleSelectAllChange} />
                </View>

                {/* Task List */}
                <FlatList
                    data={sortedTasks.filter((task) =>
                        selectedStatusIds.length === 0 || selectedStatusIds.includes(task.Status_ID.toString())
                    )}
                    keyExtractor={item => (item.Task_ID ?? "").toString()}
                    renderItem={({ item: task, index }) => {
                        const assignee = renderBacklog.project?.team?.user_seats?.find(
                            (userSeat) => userSeat.user?.User_ID === task.Assigned_User_ID
                        )?.user;

                        const isSelected = selectedTaskIds.includes(task.Task_ID!.toString());

                        return (
                            <View style={[
                                styles.taskRow,
                                { backgroundColor: index % 2 === 0 ? '#f0f0f0' : '#ffffff' }
                            ]}>
                                <TouchableOpacity
                                    style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 12,
                                        borderWidth: 2,
                                        borderColor: isSelected ? '#007bff' : '#b0b0b0',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 8
                                    }}
                                    onPress={() => handleCheckboxChange({ target: { value: task.Task_ID } } as any)}
                                    accessibilityRole="checkbox"
                                    accessibilityState={{ checked: isSelected }}
                                >
                                    {isSelected && (
                                        <View
                                            style={{
                                                width: 16,
                                                height: 16,
                                                borderRadius: 8,
                                                backgroundColor: '#007bff',
                                            }}
                                        />
                                    )}
                                </TouchableOpacity>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate(
                                            "Task", {
                                            projectKey: renderBacklog.project?.Project_Key ?? "",
                                            taskKey: (task.Task_Key ?? "").toString()
                                        }
                                        )}
                                    >
                                        <Text style={styles.taskTitle}>{renderBacklog.project?.Project_Key}-{task.Task_Key}</Text>
                                        <Text style={styles.taskTitle}>{task.Task_Title}</Text>
                                    </TouchableOpacity>
                                    <Text>{renderBacklog.statuses?.find(s => s.Status_ID === task.Status_ID)?.Status_Name}</Text>
                                    <Text>{assignee ? `${assignee.User_FirstName} ${assignee.User_Surname}` : "Unassigned"}</Text>
                                    <Text>{task.Task_CreatedAt && new Date(task.Task_CreatedAt).toLocaleDateString()}</Text>
                                </View>
                            </View>
                        );
                    }}
                />
            </View>
        </ScrollView>
    </>
)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#fff'
    },
    content: {
        padding: 16
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    input: {
        flex: 1,
        borderColor: '#ccc',
        backgroundColor: 'white',
        borderWidth: 1,
        padding: 8,
        borderRadius: 4
    },
    button: {
        flexDirection: 'row',
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 4,
        marginLeft: 8,
        alignItems: 'center'
    },
    buttonText: {
        color: '#fff',
        marginLeft: 6
    },
    selectAllRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    taskRow: {
        padding: 10,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6
    },
    taskKey: {
        fontWeight: 'bold'
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600'
    },
    link: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8
    },
    linkText: {
        marginLeft: 4,
        color: '#007bff'
    }
});
