import React, { useRef, useState } from 'react'
import { Alert, Animated, Button, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
// import Clipboard from '@react-native-clipboard/clipboard'
import { faCheck, faChevronRight, faCopy, faPencilAlt, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { Picker } from '@react-native-picker/picker'
import { useNavigation, useRoute } from '@react-navigation/native'
import { ScrollView } from 'react-native-gesture-handler'

// Internal
import { useProjectsContext, useTasksContext } from '@/src/Contexts'
import { useAxios } from '@/src/Hooks'
import { Project } from '@/src/Types'

type TaskBulkActionMenuProps = {
    renderProject: Project
    selectedTaskIds: string[]
    setSelectedTaskIds: React.Dispatch<React.SetStateAction<string[]>>
    backlogsViewRefresh: () => Promise<void>
}

export const TaskBulkActionMenu: React.FC<TaskBulkActionMenuProps> = ({
    renderProject,
    selectedTaskIds,
    setSelectedTaskIds,
    backlogsViewRefresh
}) => {
    // ---- Hooks ----
    const navigation = useNavigation()
    const route = useRoute()
    const { httpPostWithData } = useAxios()
    const { readTasksByBacklogId } = useTasksContext()
    const { readProjectById } = useProjectsContext()

    // ---- State ----
    const { id: projectId } = route.params as { id: string };  // Get id as projectId from route params
    const [copySuccess, setCopySuccess] = useState(false)
    const [taskBulkEditing, setTaskBulkEditing] = useState(false)

    // ---- Methods ----
    const handleCopy = async (text: string) => {
        // Clipboard.setString(text)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
    }

    const handleDelete = async () => {
        if (!selectedTaskIds.length) return
        Alert.alert("Confirm", "Are you sure you want to delete the items?", [
            {
                text: "Cancel",
                style: "cancel"
            },
            {
                text: "Delete",
                onPress: async () => {
                    const result = await httpPostWithData("tasks/bulk-destroy", {
                        task_ids: JSON.stringify(selectedTaskIds)
                    })

                    if (result.success) {
                        await readProjectById(parseInt(projectId))
                        setSelectedTaskIds([])
                        backlogsViewRefresh()
                    }
                }
            }
        ])
    }

    if (!selectedTaskIds.length) return null

    return (
        <>
            {taskBulkEditing ? (
                <BulkEdit
                    renderProject={renderProject}
                    selectedTaskIds={selectedTaskIds}
                    setTaskBulkEditing={setTaskBulkEditing}
                    setSelectedTaskIds={setSelectedTaskIds}
                    backlogsViewRefresh={backlogsViewRefresh}
                    readProjectById={readProjectById}
                />
            ) : (
                <TaskBulkActionMenuView
                    selectedTaskIds={selectedTaskIds}
                    copySuccess={copySuccess}
                    setSelectedTaskIds={setSelectedTaskIds}
                    setTaskBulkEditing={setTaskBulkEditing}
                    handleCopy={handleCopy}
                    handleDelete={handleDelete}
                    backlogsViewRefresh={backlogsViewRefresh}
                />
            )}
        </>
    )
}

type TaskBulkActionMenuViewProps = {
    selectedTaskIds: string[]
    copySuccess: boolean
    setSelectedTaskIds: React.Dispatch<React.SetStateAction<string[]>>
    setTaskBulkEditing: React.Dispatch<React.SetStateAction<boolean>>
    handleCopy: (text: string) => Promise<void>
    handleDelete: () => Promise<void>
    backlogsViewRefresh: () => Promise<void>
}

export const TaskBulkActionMenuView: React.FC<TaskBulkActionMenuViewProps> = ({
    selectedTaskIds,
    copySuccess,
    setSelectedTaskIds,
    setTaskBulkEditing,
    handleCopy,
    handleDelete,
    backlogsViewRefresh
}) => (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>{selectedTaskIds.length} tasks selected</Text>
            <TouchableOpacity onPress={() => setSelectedTaskIds([])}>
                <FontAwesomeIcon icon={faXmark} size={20} />
            </TouchableOpacity>
        </View>

        <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button} onPress={() => setTaskBulkEditing(true)}>
                <FontAwesomeIcon icon={faPencilAlt} size={18} />
                <Text>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => handleCopy("exampleText")}>
                <FontAwesomeIcon icon={copySuccess ? faCheck : faCopy} size={18} />
                <Text>{copySuccess ? `${selectedTaskIds.length} copied` : 'Copy to clipboard'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleDelete}>
                <FontAwesomeIcon icon={faTrash} size={18} />
                <Text>Delete</Text>
            </TouchableOpacity>
        </View>
    </View>
)

type BulkEditProps = {
    renderProject: Project
    selectedTaskIds: string[]
    setTaskBulkEditing: React.Dispatch<React.SetStateAction<boolean>>
    setSelectedTaskIds: React.Dispatch<React.SetStateAction<string[]>>
    backlogsViewRefresh: () => Promise<void>
    readProjectById: (id: number) => Promise<void>
}

export const BulkEdit: React.FC<BulkEditProps> = ({
    renderProject,
    selectedTaskIds,
    setTaskBulkEditing,
    readProjectById,
    setSelectedTaskIds,
    backlogsViewRefresh
}) => {
    const { httpPostWithData } = useAxios()

    const [newUserId, setNewUserId] = useState<number | undefined>(undefined)
    const [newDueDate, setNewDueDate] = useState<Date | undefined>(undefined)
    const [newStatus, setNewStatus] = useState<string>("")
    const [newBacklog, setNewBacklog] = useState<number>(0)
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false)

    // ---- Toggler Logic & Animation ----
    const screenHeight = Dimensions.get('window').height;
    const slideAnim = useRef(new Animated.Value(screenHeight)).current;
    const [togglerIsVisible, setTogglerIsVisible] = useState<false | string>(false)

    const handleTogglerVisibility = (visibility: false | string) => {
        if (visibility === false) {
            // Slide out
            Animated.timing(slideAnim, {
                toValue: screenHeight,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                setTogglerIsVisible(false); // hide component after animation
            });
        } else {
            // Slide in

            // Set visible first to render component
            setTogglerIsVisible(visibility);

            // Delay needed so component is in the tree before animating
            requestAnimationFrame(() => {
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            });
        }
    }

    const handleBulkUpdate = async () => {
        if (!selectedTaskIds.length) return

        const updatedTasks = selectedTaskIds.map((taskId) => ({
            Task_ID: taskId,
            Backlog_ID: newBacklog,
            Task_Status: newStatus,
            Task_Due_Date: newDueDate?.toISOString().split('T')[0], // Format: YYYY-MM-DD
            Assigned_User_ID: newUserId,
        }))

        const result = await httpPostWithData("tasks/bulk-update", { tasks: updatedTasks })

        if (result.updated_tasks) {
            await readProjectById(renderProject.Project_ID ?? 0)
            setSelectedTaskIds([])
            backlogsViewRefresh()
        }
    }

    return (
        <BulkEditView
            renderProject={renderProject}
            selectedTaskIds={selectedTaskIds}
            newUserId={newUserId}
            newDueDate={newDueDate}
            newStatus={newStatus}
            newBacklog={newBacklog}
            slideAnim={slideAnim}
            togglerIsVisible={togglerIsVisible}
            handleTogglerVisibility={handleTogglerVisibility}
            setTaskBulkEditing={setTaskBulkEditing}
            setNewUserId={setNewUserId}
            setNewDueDate={setNewDueDate}
            setNewStatus={setNewStatus}
            setNewBacklog={setNewBacklog}
            setShowDatePicker={setShowDatePicker}
            handleBulkUpdate={handleBulkUpdate}
        />
    )
}

type BulkEditViewProps = {
    renderProject: Project
    selectedTaskIds: string[]
    newUserId: number | undefined
    newDueDate: Date | undefined
    newStatus: string
    newBacklog: number
    slideAnim: Animated.Value
    togglerIsVisible: string | false
    handleTogglerVisibility: (visibility: false | string) => void
    setTaskBulkEditing: React.Dispatch<React.SetStateAction<boolean>>
    setNewUserId: React.Dispatch<React.SetStateAction<number | undefined>>
    setNewDueDate: React.Dispatch<React.SetStateAction<Date | undefined>>
    setNewStatus: React.Dispatch<React.SetStateAction<string>>
    setNewBacklog: React.Dispatch<React.SetStateAction<number>>
    setShowDatePicker: React.Dispatch<React.SetStateAction<boolean>>
    handleBulkUpdate: () => Promise<void>
}

export const BulkEditView: React.FC<BulkEditViewProps> = ({
    renderProject,
    selectedTaskIds,
    newUserId,
    newDueDate,
    newStatus,
    newBacklog,
    slideAnim,
    togglerIsVisible,
    handleTogglerVisibility,
    setTaskBulkEditing,
    setNewUserId,
    setNewDueDate,
    setNewStatus,
    setNewBacklog,
    setShowDatePicker,
    handleBulkUpdate,
}) => (
    <>
        <ScrollView style={bulkEditStyles.container}>
            <View style={bulkEditStyles.rowBetween}>
                <TouchableOpacity onPress={() => setTaskBulkEditing(false)}>
                    <FontAwesomeIcon icon={faXmark} size={20} />
                </TouchableOpacity>
                <Text style={bulkEditStyles.title}>Bulk Edit ({selectedTaskIds.length} tasks)</Text>
                <View />
            </View>

            <View style={bulkEditStyles.bulkEditItem}>
                <Text style={bulkEditStyles.label}>Assignee</Text>
                <TouchableOpacity
                    style={bulkEditStyles.bulkEditItemToggler}
                    onPress={() => handleTogglerVisibility("ASSIGNEE")}
                >
                    {(() => {
                        const selectedUser = renderProject.team?.user_seats?.find(seat => seat.User_ID === newUserId)?.user
                        return <Text>{selectedUser?.User_FirstName}{" "}{selectedUser?.User_Surname}</Text>
                    })()}
                    <FontAwesomeIcon icon={faChevronRight} />
                </TouchableOpacity>
            </View>

            <View style={bulkEditStyles.bulkEditItem}>
                <Text style={bulkEditStyles.label}>Due Date</Text>
                <TouchableOpacity
                    style={bulkEditStyles.bulkEditItemToggler}
                    onPress={() => handleTogglerVisibility("DUE_DATE")}
                >
                    <Text>{newDueDate ? newDueDate.toDateString() : "Select Date"}</Text>
                    <FontAwesomeIcon icon={faChevronRight} />
                </TouchableOpacity>
            </View>

            {newBacklog > 0 && (
                <View style={bulkEditStyles.bulkEditItem}>
                    <Text style={bulkEditStyles.label}>Status</Text>
                    <TouchableOpacity
                        style={bulkEditStyles.bulkEditItemToggler}
                        onPress={() => handleTogglerVisibility("STATUS")}
                    >
                        {(() => {
                            const selectedStatus = renderProject.backlogs?.
                                find(backlog => backlog.Backlog_ID === newBacklog)?.
                                statuses?.
                                find(status => status.Status_ID === parseInt(newStatus))
                            return <Text>{selectedStatus?.Status_Name}</Text>
                        })()}
                        <FontAwesomeIcon icon={faChevronRight} />
                    </TouchableOpacity>
                </View>
            )}

            <View style={bulkEditStyles.bulkEditItem}>
                <Text style={bulkEditStyles.label}>Backlog</Text>
                <TouchableOpacity
                    style={bulkEditStyles.bulkEditItemToggler}
                    onPress={() => handleTogglerVisibility("BACKLOG")}
                >
                    {(() => {
                        const selectedBacklog = renderProject.backlogs?.find(backlog => backlog.Backlog_ID === newBacklog)
                        return <Text>{selectedBacklog?.Backlog_Name}</Text>
                    })()}
                    <FontAwesomeIcon icon={faChevronRight} />
                </TouchableOpacity>
            </View>

            <View style={bulkEditStyles.actionRow}>
                <Button title="Confirm" onPress={handleBulkUpdate} color="#007bff" />
            </View>
        </ScrollView>
        {togglerIsVisible && (
            <Animated.View style={[
                styles.container,
                { zIndex: 1100, transform: [{ translateY: slideAnim }] }
            ]}>
                <View style={styles.header}>
                    <Text style={styles.title}>Select {togglerIsVisible}</Text>
                    <TouchableOpacity onPress={() => handleTogglerVisibility(false)}>
                        <FontAwesomeIcon icon={faXmark} size={20} />
                    </TouchableOpacity>
                </View>
                <View>
                    {togglerIsVisible === "ASSIGNEE" ? (
                        <Picker
                            selectedValue={newUserId}
                            onValueChange={(value) => setNewUserId(value)}
                            style={bulkEditStyles.picker}
                        >
                            <Picker.Item label="Assignee" value={undefined} />
                            {renderProject.team?.user_seats?.map(userSeat => {
                                const user = userSeat.user
                                return (
                                    <Picker.Item
                                        key={user?.User_ID}
                                        label={`${user?.User_FirstName} ${user?.User_Surname}`}
                                        value={user?.User_ID}
                                    />
                                )
                            })}
                        </Picker>
                    ) : togglerIsVisible === "BACKLOG" ? (
                        <Picker
                            selectedValue={newBacklog}
                            onValueChange={(value) => {
                                setNewBacklog(value)
                                setNewStatus("0") // Reset status when changing backlog
                            }}
                            style={bulkEditStyles.picker}
                        >
                            <Picker.Item label="Backlog" value="" />
                            {renderProject.backlogs?.map(backlog => (
                                <Picker.Item key={backlog.Backlog_ID} label={backlog.Backlog_Name} value={backlog.Backlog_ID} />
                            ))}
                        </Picker>
                    ) : togglerIsVisible === "STATUS" ? (
                        <Picker
                            selectedValue={newStatus}
                            onValueChange={(value) => setNewStatus(value)}
                            style={bulkEditStyles.picker}
                        >
                            <Picker.Item label="Status" value="" />
                            {renderProject.backlogs?.
                                find(backlog => backlog.Backlog_ID === newBacklog)?.
                                statuses?.map(status => (
                                    <Picker.Item
                                        key={`${status.Status_ID}`}
                                        label={`${status.Status_Name}`}
                                        value={status.Status_ID}
                                    />
                                ))
                            }
                        </Picker>
                    ) : togglerIsVisible === "DUE_DATE" ? (
                        <></>
                        // <DateTimePicker
                        //     value={newDueDate || new Date()}
                        //     mode="date"
                        //     display="default"
                        //     onChange={(event, selectedDate) => {
                        //         setShowDatePicker(false)
                        //         if (selectedDate) setNewDueDate(selectedDate)
                        //     }}
                        // />
                    ) : null}
                </View>
            </Animated.View>
        )}
    </>
)

const bulkEditStyles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 16,
        backgroundColor: '#fff',
        position: 'absolute',
        zIndex: 1050,
        top: 0,
        bottom: 0,
    },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    bulkEditItem: {
        position: 'relative',
        width: '100%',
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        marginBottom: 16
    },
    bulkEditItemToggler: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        flex: 1,
        right: 0,
        marginBottom: 0,
        padding: 12,
        borderRadius: 8
    },
    title: { fontSize: 20, fontWeight: 'bold' },
    label: { fontWeight: '600', fontSize: 18, marginTop: 12, marginBottom: 4, width: 100 },
    picker: { backgroundColor: '#e5e5e5', marginBottom: 12 },
    actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 }
})

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 16,
        backgroundColor: '#fff',
        position: 'absolute',
        zIndex: 1000,
        top: 'auto',
        bottom: 0,

        opacity: 0.95,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        // Add borderWidth and borderColor for all borders, but mask bottom
        borderWidth: 1,
        borderColor: '#ccc',
        borderBottomWidth: 0, // Hide bottom border
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: { fontWeight: 'bold', fontSize: 20 },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 8,
        gap: 8,
        width: '100%'
    },
    button: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 8 }
})
