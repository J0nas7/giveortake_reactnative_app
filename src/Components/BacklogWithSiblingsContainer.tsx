// External
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Internal
import { useBacklogsContext, useTasksContext } from '@/src/Contexts';
import { BacklogStates, Task } from '@/src/Types';

type BacklogWithSiblingsContainerProps = {
    backlogId: number | undefined;
};

export const BacklogWithSiblingsContainer: React.FC<BacklogWithSiblingsContainerProps> = ({
    backlogId
}) => {
    // ---- Hooks ----
    const route = useRoute();
    const { t } = useTranslation(['backlog']);
    const { readBacklogById } = useBacklogsContext();
    const { readTasksByBacklogId, addTask } = useTasksContext();

    // ---- State ----
    const [localBacklog, setLocalBacklog] = useState<BacklogStates>(undefined);
    const [renderTasks, setRenderTasks] = useState<Task[]>([]);
    const [localNewTask, setLocalNewTask] = useState<Partial<Task>>({});
    const [selectAll, setSelectAll] = useState(false);
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

    // ---- Effects ----

    // Load backlog and tasks when backlogId changes
    useEffect(() => {
        const loadBacklog = async () => {
            if (!backlogId) return;
            const backlog = await readBacklogById(backlogId, true);
            setLocalBacklog(backlog);

            const tasks = await readTasksByBacklogId(backlogId, undefined, true);
            setRenderTasks(tasks);
        };

        loadBacklog();
    }, [backlogId]);

    // ---- Methods ----

    // Handles the creation of a new task and updates the task list
    const handleCreateTask = async () => {
        if (!localBacklog || !localBacklog.Backlog_ID) return;

        await addTask(localBacklog.Backlog_ID, {
            ...localNewTask,
            Backlog_ID: localBacklog.Backlog_ID,
            Team_ID: localBacklog.project?.team?.Team_ID || 0,
        } as Task);

        const tasks = await readTasksByBacklogId(localBacklog.Backlog_ID, undefined, true);
        setRenderTasks(tasks);
        setLocalNewTask({});
    };

    // Toggles the select-all switch and updates selected task IDs
    const toggleSelectAll = () => {
        setSelectedTaskIds(
            selectAll ? renderTasks.map((t) => t.Task_ID!.toString()) : []
        );
        setSelectAll(!selectAll);
    };

    // ---- Memoized Values ----
    const sortedTasks = useMemo(() => renderTasks, [renderTasks]);

    // ---- Render ----
    return (
        <BacklogWithSiblingsContainerView
            t={t}
            backlog={localBacklog}
            localNewTask={localNewTask}
            setLocalNewTask={setLocalNewTask}
            handleCreateTask={handleCreateTask}
            sortedTasks={sortedTasks}
            selectAll={selectAll}
            toggleSelectAll={toggleSelectAll}
        />
    );
};

type BacklogWithSiblingsContainerViewProps = {
    t: (key: string) => string;
    backlog: BacklogStates | undefined;
    localNewTask: Partial<Task>;
    setLocalNewTask: React.Dispatch<React.SetStateAction<Partial<Task>>>;
    handleCreateTask: () => void;
    sortedTasks: Task[];
    selectAll: boolean;
    toggleSelectAll: () => void;
};

export const BacklogWithSiblingsContainerView: React.FC<BacklogWithSiblingsContainerViewProps> = ({
    t,
    backlog,
    localNewTask,
    setLocalNewTask,
    handleCreateTask,
    sortedTasks,
    selectAll,
    toggleSelectAll,
}) => backlog && (
    <View style={styles.container}>
        <Text style={styles.header}>{backlog.Backlog_Name}</Text>

        <View style={styles.actions}>
            <TextInput
                style={styles.input}
                placeholder={t('backlog:task_title')}
                value={localNewTask.Task_Title || ''}
                onChangeText={(text) =>
                    setLocalNewTask((prev: Partial<Task>) => ({ ...prev, Task_Title: text }))
                }
            />
            <TouchableOpacity style={styles.button} onPress={handleCreateTask}>
                <FontAwesomeIcon icon={faPlus} size={16} color="#fff" />
                <Text style={styles.buttonText}>Create</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.selectAllRow}>
            <Text>Select All</Text>
            <Switch value={selectAll} onValueChange={toggleSelectAll} />
        </View>

        <FlatList
            data={sortedTasks}
            keyExtractor={(item) => item.Task_ID!.toString()}
            renderItem={({ item }) => (
                <View style={styles.taskRow}>
                    <Text style={styles.taskTitle}>{item.Task_Title}</Text>
                    <Text>{item.Status_ID}</Text>
                    <Text>{item.Assigned_User_ID || 'Unassigned'}</Text>
                </View>
            )}
        />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    actions: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    input: { flex: 1, borderColor: '#ccc', borderWidth: 1, padding: 8, borderRadius: 4 },
    button: {
        flexDirection: 'row',
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 4,
        marginLeft: 8,
        alignItems: 'center',
    },
    buttonText: { color: '#fff', marginLeft: 6 },
    selectAllRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    taskRow: {
        padding: 10,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
    },
    taskTitle: { fontWeight: '500' },
});
