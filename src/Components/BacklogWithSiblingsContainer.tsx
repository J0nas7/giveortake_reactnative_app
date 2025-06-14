// External
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { useRoute } from '@react-navigation/native'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    FlatList,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'

// Internal
import { useBacklogsContext, useTasksContext } from '@/src/Contexts'
import { BacklogStates, Task } from '@/src/Types'

type BacklogWithSiblingsContainerProps = {
    backlogId: number | undefined
    showEditToggles: boolean
    selectedTaskIds: string[]
    setSelectedTaskIds: React.Dispatch<React.SetStateAction<string[]>>
}

export const BacklogWithSiblingsContainer: React.FC<BacklogWithSiblingsContainerProps> = ({
    backlogId,
    showEditToggles,
    selectedTaskIds,
    setSelectedTaskIds
}) => {
    // ---- Hooks ----
    const route = useRoute()
    const { t } = useTranslation(['backlog'])
    const { readBacklogById } = useBacklogsContext()
    const { readTasksByBacklogId, addTask } = useTasksContext()

    // ---- State ----
    const [localBacklog, setLocalBacklog] = useState<BacklogStates>(undefined)
    const [renderTasks, setRenderTasks] = useState<Task[]>([])
    const [localNewTask, setLocalNewTask] = useState<Partial<Task>>({})
    const [selectAll, setSelectAll] = useState(false)

    // ---- Effects ----

    // Load backlog and tasks when backlogId changes
    useEffect(() => {
        const loadBacklog = async () => {
            if (!backlogId) return
            const backlog = await readBacklogById(backlogId, true)
            setLocalBacklog(backlog)

            const tasks = await readTasksByBacklogId(backlogId, undefined, true)
            setRenderTasks(tasks)
        }

        loadBacklog()
    }, [backlogId])

    useEffect(() => {
        if (selectedTaskIds.length === 0) setSelectAll(false)
    }, [selectedTaskIds])

    // ---- Methods ----

    // Handles the creation of a new task and updates the task list
    const handleCreateTask = async () => {
        if (!localBacklog || !localBacklog.Backlog_ID) return

        await addTask(localBacklog.Backlog_ID, {
            ...localNewTask,
            Backlog_ID: localBacklog.Backlog_ID,
            Team_ID: localBacklog.project?.team?.Team_ID || 0,
        } as Task)

        const tasks = await readTasksByBacklogId(localBacklog.Backlog_ID, undefined, true)
        setRenderTasks(tasks)
        setLocalNewTask({})
    }

    // Toggles the select-all switch and updates selected task IDs
    const toggleSelectAll = () => {
        if (selectAll) {
            setSelectedTaskIds(prev =>
                prev.filter(id => !renderTasks.some(t => t.Task_ID!.toString() === id))
            );
        } else {
            setSelectedTaskIds(prev => [
                ...prev,
                ...renderTasks
                    .map(t => t.Task_ID!.toString())
                    .filter(id => !prev.includes(id))
            ]);
        }
        setSelectAll(!selectAll)
    }

    // ---- Memoized Values ----
    const sortedTasks = useMemo(() => renderTasks, [renderTasks])

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
            setSelectAll={setSelectAll}
            toggleSelectAll={toggleSelectAll}
            showEditToggles={showEditToggles}
            selectedTaskIds={selectedTaskIds}
            setSelectedTaskIds={setSelectedTaskIds}
        />
    )
}

type BacklogWithSiblingsContainerViewProps = {
    t: (key: string) => string
    backlog: BacklogStates
    localNewTask: Partial<Task>
    setLocalNewTask: React.Dispatch<React.SetStateAction<Partial<Task>>>
    handleCreateTask: () => void
    sortedTasks: Task[]
    selectAll: boolean
    setSelectAll: React.Dispatch<React.SetStateAction<boolean>>
    toggleSelectAll: () => void
    showEditToggles: boolean
    selectedTaskIds: string[]
    setSelectedTaskIds: React.Dispatch<React.SetStateAction<string[]>>
}

export const BacklogWithSiblingsContainerView: React.FC<BacklogWithSiblingsContainerViewProps> = ({
    t,
    backlog,
    localNewTask,
    setLocalNewTask,
    handleCreateTask,
    sortedTasks,
    selectAll,
    setSelectAll,
    toggleSelectAll,
    showEditToggles,
    selectedTaskIds,
    setSelectedTaskIds,
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

        {showEditToggles && (
            <View style={styles.selectAllRow}>
                <Text>Select All</Text>
                <Switch value={selectAll} onValueChange={toggleSelectAll} />
            </View>
        )}

        <FlatList
            data={sortedTasks}
            keyExtractor={(item) => item.Task_ID!.toString()}
            renderItem={({ item: task, index }) => (
                <View style={[
                    styles.taskRow,
                    // even: light gray, odd: white
                    { backgroundColor: index % 2 === 0 ? '#f0f0f0' : '#ffffff' }
                ]}>
                    {showEditToggles && (
                        <View>
                            <TouchableOpacity
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    borderWidth: 2,
                                    borderColor:
                                        (selectedTaskIds.includes(task.Task_ID!.toString())) ?
                                            '#007bff' :
                                            '#b0b0b0' // darker gray than #f0f0f0
                                    ,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 8
                                }}
                                onPress={() => {
                                    setSelectedTaskIds(prev =>
                                        prev.includes(task.Task_ID!.toString())
                                            ? prev.filter(id => id !== task.Task_ID!.toString())
                                            : [...prev, task.Task_ID!.toString()]
                                    )

                                    if (selectAll) setSelectAll(false)
                                }}
                                accessibilityRole="radio"
                                accessibilityState={{ selected: selectedTaskIds.includes(task.Task_ID!.toString()) }}
                            >
                                {(selectedTaskIds.includes(task.Task_ID!.toString())) && (
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
                        </View>
                    )}
                    <View>
                        <Text style={styles.taskTitle}>{task.Task_Title}</Text>
                        <Text>{backlog.statuses?.find(status => status.Status_ID === task.Status_ID)?.Status_Name}</Text>
                        {(() => {
                            const assignee = backlog?.project?.team?.user_seats?.find(
                                userSeat => userSeat.User_ID === task.Assigned_User_ID
                            )?.user
                            return (
                                <Text>
                                    {assignee ? `${assignee.User_FirstName} ${assignee.User_Surname}` : "Unassigned"}
                                </Text>
                            )
                        })()}
                    </View>
                </View>
            )}
        />
    </View>
)

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    actions: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    input: { flex: 1, borderColor: '#ccc', backgroundColor: 'white', borderWidth: 1, padding: 8, borderRadius: 4 },
    button: {
        flexDirection: 'row',
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 4,
        marginLeft: 8,
        alignItems: 'center',
    },
    buttonText: { color: '#fff', marginLeft: 6 },
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
        gap: 6,
    },
    taskTitle: { fontWeight: '600' },
})
