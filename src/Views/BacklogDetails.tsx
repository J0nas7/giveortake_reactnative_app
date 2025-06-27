// External
import { faArrowDown, faArrowUp, faLock, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Keyboard, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList, TextInput } from 'react-native-gesture-handler';

// Internal
import { useBacklogsContext, useStatusContext } from '@/src/Contexts';
import useRoleAccess from '@/src/Hooks/useRoleAccess';
import { selectAuthUser, setSnackMessage, useAppDispatch, useTypedSelector } from '@/src/Redux';
import { Backlog, BacklogStates, MainStackParamList, Status, Task, User } from '@/src/Types';

export const BacklogDetails: React.FC = () => {
    // ---- Hooks ----
    const dispatch = useAppDispatch()
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const route = useRoute<any>();
    const { readBacklogById, backlogById, saveBacklogChanges, removeBacklog } = useBacklogsContext();
    const { moveOrder, assignDefault, assignClosed, addStatus, saveStatusChanges, removeStatus } = useStatusContext()
    const { canAccessBacklog, canManageBacklog } = useRoleAccess(
        backlogById ? backlogById.project?.team?.organisation?.User_ID : undefined,
        "backlog",
        backlogById ? backlogById.Backlog_ID : 0
    )

    // ---- State ----
    const { id: backlogId } = route.params as { id: string };
    const authUser = useTypedSelector(selectAuthUser);
    const [newStatus, setNewStatus] = useState<Status>({
        Backlog_ID: 0,
        Status_Name: '',
        Status_Order: 0,
        Status_Is_Default: false,
        Status_Is_Closed: false,
        Status_Color: '',
    });
    const [localBacklog, setLocalBacklog] = useState<BacklogStates>(undefined);

    // ---- Effects ----
    useEffect(() => {
        if (backlogId) readBacklogById(parseInt(backlogId));
    }, [backlogId]);

    useEffect(() => {
        if (backlogById) {
            setLocalBacklog(backlogById);
            setNewStatus({
                ...newStatus,
                Backlog_ID: backlogById.Backlog_ID ?? 0
            })
        }
    }, [backlogById]);

    // ---- Methods ----
    // Handle Input Change for text fields
    const handleBacklogInputChange = (name: keyof Backlog, value: string) => {
        if (!localBacklog) return;

        setLocalBacklog({
            ...localBacklog,
            [name]: value,
        });
    };

    // Handle Rich Text or other field changes
    const handleBacklogChange = (field: keyof Backlog, value: string) => {
        if (!localBacklog) return

        setLocalBacklog({
            ...localBacklog,
            [field]: value,
        });
    };

    // Save backlog changes to backend
    const handleSaveBacklogChanges = async () => {
        if (!localBacklog) return;
        try {
            const saveChanges = await saveBacklogChanges(localBacklog, localBacklog.Project_ID);

            dispatch(setSnackMessage(
                saveChanges ? "Backlog updated successfully." : "Failed to update backlog."
            ));
        } catch (err) {
            console.error(err);
            dispatch(setSnackMessage("Failed to update backlog."));
        }
    };

    // Handles the 'Enter' key press event to trigger update status name.
    const ifEnterSaveStatus = (e: React.KeyboardEvent, status: Status) => (e.key === 'Enter') ? handleSaveStatusChanges(status) : null

    // Save status changes to backend
    const handleSaveStatusChanges = async (status: Status) => {
        if (!localBacklog) return;
        try {
            const saveChanges = await saveStatusChanges(status, localBacklog.Project_ID)

            dispatch(setSnackMessage(
                saveChanges ? "Status changes saved successfully!" : "Failed to save status changes."
            ))

            if (saveChanges) {
                setLocalBacklog(undefined)
                readBacklogById(parseInt(backlogId))
            }
        } catch (err) {
            console.error(err);
            dispatch(setSnackMessage("Failed to save update status."))
        }
    };

    // Handles the movement of a status within the backlog by changing its order.
    const handleMoveStatusChanges = async (statusId: number, direction: "up" | "down") => {
        if (!localBacklog) return;
        try {
            const saveChanges = await moveOrder(statusId, direction)

            if (saveChanges) {
                setLocalBacklog(undefined)
                readBacklogById(parseInt(backlogId))
            }
        } catch (err) {
            console.error(err);
            dispatch(setSnackMessage("Failed to update status order."))
        }
    };

    // Handles the assignment of a default status to a backlog item.
    const handleAssignDefaultStatus = async (statusId: number) => {
        if (!localBacklog) return;
        try {
            const saveChanges = await assignDefault(statusId)

            if (saveChanges) {
                setLocalBacklog(undefined)
                readBacklogById(parseInt(backlogId))
            }
        } catch (err) {
            console.error(err);
            dispatch(setSnackMessage("Failed to assign default status."))
        }
    };

    // Handles the assignment of a default status to a backlog item.
    const handleAssignClosedStatus = async (statusId: number) => {
        if (!localBacklog) return;
        try {
            const saveChanges = await assignClosed(statusId)

            if (saveChanges) {
                setLocalBacklog(undefined)
                readBacklogById(parseInt(backlogId))
            }
        } catch (err) {
            console.error(err);
            dispatch(setSnackMessage("Failed to assign closed status."))
        }
    };

    // Handles the 'Enter' key press event to trigger status creation
    const ifEnterCreateStatus = (e: React.KeyboardEvent) => (e.key === 'Enter') ? handleCreateStatus() : null

    // Handles the creation of a new status for the backlog.
    const handleCreateStatus = async () => {
        if (!newStatus.Status_Name.trim()) {
            dispatch(setSnackMessage("Please enter a status name."))
            return;
        }

        await addStatus(parseInt(backlogId), newStatus)
        setNewStatus({
            ...newStatus,
            Status_Name: ""
        })
        setLocalBacklog(undefined)
        readBacklogById(parseInt(backlogId))
    };

    // Delete backlog from backend
    const handleDeleteBacklog = async () => {
        if (!localBacklog || !localBacklog.Backlog_ID) return

        try {
            await removeBacklog(
                localBacklog.Backlog_ID,
                localBacklog.Project_ID,
                // `/project/${convertID_NameStringToURLFormat(localBacklog.Project_ID, localBacklog.project?.Project_Name ?? "")}`
                undefined
            );
            Alert.alert('Backlog deleted.');
            // optionally redirect or clear state
        } catch (err) {
            console.error(err);
            Alert.alert('Failed to delete backlog.');
        }
    };

    // ---- Render ----
    return (
        <BacklogDetailsView
            localBacklog={localBacklog}
            newStatus={newStatus}
            authUser={authUser}
            canAccessBacklog={canAccessBacklog}
            canManageBacklog={canManageBacklog}
            navigation={navigation}
            setNewStatus={setNewStatus}
            handleBacklogInputChange={handleBacklogInputChange}
            handleBacklogChange={handleBacklogChange}
            handleSaveBacklogChanges={handleSaveBacklogChanges}
            handleSaveStatusChanges={handleSaveStatusChanges}
            ifEnterSaveStatus={ifEnterSaveStatus}
            handleCreateStatus={handleCreateStatus}
            ifEnterCreateStatus={ifEnterCreateStatus}
            handleDeleteBacklog={handleDeleteBacklog}
            handleMoveStatusChanges={handleMoveStatusChanges}
            handleAssignDefaultStatus={handleAssignDefaultStatus}
            handleAssignClosedStatus={handleAssignClosedStatus}
            removeStatus={removeStatus}
        />
    );
};

interface BacklogDetailsViewProps {
    localBacklog: BacklogStates;
    newStatus: Status
    authUser?: User;
    canAccessBacklog: boolean | undefined
    canManageBacklog: boolean | undefined
    navigation: NavigationProp<MainStackParamList>
    setNewStatus: React.Dispatch<React.SetStateAction<Status>>
    handleBacklogInputChange: (name: keyof Backlog, value: string) => void
    handleBacklogChange: (field: keyof Backlog, value: string) => void;
    handleSaveBacklogChanges: () => Promise<void>;
    handleSaveStatusChanges: (status: Status) => Promise<void>
    ifEnterSaveStatus: (e: React.KeyboardEvent, status: Status) => Promise<void> | null
    handleCreateStatus: () => Promise<void>
    ifEnterCreateStatus: (e: React.KeyboardEvent) => Promise<void> | null
    handleDeleteBacklog: () => Promise<void>;
    handleMoveStatusChanges: (statusId: number, direction: "up" | "down") => Promise<void>
    handleAssignDefaultStatus: (statusId: number) => Promise<void>
    handleAssignClosedStatus: (statusId: number) => Promise<void>
    removeStatus: (itemId: number, parentId: number, redirect: string | undefined) => Promise<void>
}

const calculateTaskStats = (backlog: Backlog) => {
    if (!backlog.tasks || backlog.tasks.length === 0) return null;

    const total = backlog.tasks.length;
    const assigneeCount = backlog.tasks.reduce((acc: Record<string | number, number>, task: Task) => {
        const key = task.Assigned_User_ID || "Unassigned";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {} as Record<string | number, number>);

    return { total, assigneeCount };
};

const BacklogDetailsView: React.FC<BacklogDetailsViewProps> = (props) => {
    const {
        localBacklog,
        newStatus,
        authUser,
        canAccessBacklog,
        canManageBacklog,
        navigation,
        setNewStatus,
        handleBacklogInputChange,
        handleBacklogChange,
        handleSaveBacklogChanges,
        handleSaveStatusChanges,
        ifEnterSaveStatus,
        handleCreateStatus,
        ifEnterCreateStatus,
        handleDeleteBacklog,
        handleMoveStatusChanges,
        handleAssignDefaultStatus,
        handleAssignClosedStatus,
        removeStatus
    } = props
    const stats = localBacklog ? calculateTaskStats(localBacklog) : null;

    return (
        localBacklog && (
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View>
                    <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
                        {localBacklog?.Backlog_Name || 'Backlog'}
                    </Text>

                    {canAccessBacklog && localBacklog && (
                        <BacklogHeaderLinks
                            localBacklog={localBacklog}
                            navigation={navigation}
                        />
                    )}
                </View>

                {localBacklog && (
                    <BacklogDetailsEditor
                        localBacklog={localBacklog}
                        canManageBacklog={canManageBacklog}
                        handleBacklogInputChange={handleBacklogInputChange}
                        handleSaveBacklogChanges={handleSaveBacklogChanges}
                        handleDeleteBacklog={handleDeleteBacklog}
                        handleBacklogChange={handleBacklogChange}
                    />
                )}

                {canManageBacklog && localBacklog?.statuses && (
                    <StatusListEditor {...props} />
                )}

                {canAccessBacklog && localBacklog?.tasks && stats && (
                    <TaskSummaryCard stats={stats} />
                )}
            </ScrollView>
        )
    );
};

export const BacklogHeaderLinks: React.FC<Partial<BacklogDetailsViewProps>> = ({
    localBacklog,
    navigation
}) => localBacklog && navigation && (
    <View style={{ flexDirection: 'row', gap: 10, marginVertical: 10 }}>
        <TouchableOpacity onPress={() =>
            navigation.navigate("Backlog", { id: (localBacklog.Backlog_ID || "").toString() })
        }>
            <Text style={{ color: 'blue' }}>Go to Backlog</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() =>
            navigation.navigate("Project", { id: (localBacklog.Project_ID || "").toString() })
        }>
            <Text style={{ color: 'blue' }}>Go to Project</Text>
        </TouchableOpacity>
    </View>
);

export const BacklogDetailsEditor: React.FC<Partial<BacklogDetailsViewProps>> = ({
    localBacklog,
    canManageBacklog,
    handleBacklogInputChange,
    handleSaveBacklogChanges,
    handleDeleteBacklog,
    handleBacklogChange,
}) => localBacklog && handleBacklogInputChange && handleBacklogChange && (
    <View style={{ marginVertical: 20 }}>
        <Text style={{ fontSize: 18 }}>Edit Backlog Details</Text>
        <TextInput
            placeholder="Backlog Name"
            value={localBacklog.Backlog_Name}
            onChangeText={(text) => handleBacklogInputChange('Backlog_Name', text)}
            style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
        />
        <TextInput
            placeholder="Backlog Description"
            value={localBacklog.Backlog_Description}
            onChangeText={(text) => handleBacklogChange('Backlog_Description', text)}
            multiline
            numberOfLines={4}
            style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
        />
        <TextInput
            placeholder="Start Date"
            value={localBacklog.Backlog_StartDate}
            onChangeText={(text) => handleBacklogChange('Backlog_StartDate', text)}
            style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
        />
        <TextInput
            placeholder="End Date"
            value={localBacklog.Backlog_EndDate}
            onChangeText={(text) => handleBacklogChange('Backlog_EndDate', text)}
            style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button title="Save Changes" onPress={handleSaveBacklogChanges} />
            <Button title="Delete Backlog" color="red" onPress={handleDeleteBacklog} />
        </View>
    </View>
);

export const StatusListEditor: React.FC<BacklogDetailsViewProps> = (props) => {
    const {
        localBacklog,
        newStatus,
        setNewStatus,
        ifEnterCreateStatus,
        ifEnterSaveStatus,
        handleCreateStatus,
        handleSaveStatusChanges,
        removeStatus,
        handleMoveStatusChanges,
        handleAssignDefaultStatus,
        handleAssignClosedStatus,
    } = props;

    const StatusRow = ({ status }: { status: Status }) => {
        if (!localBacklog) return

        const [statusName, setStatusName] = useState(status.Status_Name);

        const totalTasks = localBacklog.tasks?.length ?? 0;
        const statusTasks = localBacklog.tasks?.filter(
            (t: Task) => t.Status_ID === status.Status_ID
        ).length ?? 0;
        const taskPercent = totalTasks
            ? ((statusTasks / totalTasks) * 100).toFixed(0)
            : '0';

        return (
            <View style={styles.statusBlock}>
                {/* Status name edit */}
                <View style={styles.row}>
                    <TextInput
                        style={styles.input}
                        value={statusName}
                        onChangeText={setStatusName}
                        onKeyPress={(e) => {
                            if (e.nativeEvent.key === 'Enter') {
                                handleSaveStatusChanges({
                                    ...status,
                                    Status_Name: statusName,
                                });
                            }
                        }}
                    />
                    {statusName !== status.Status_Name ? (
                        <TouchableOpacity
                            onPress={() =>
                                handleSaveStatusChanges({
                                    ...status,
                                    Status_Name: statusName,
                                })
                            }
                            style={styles.iconButton}
                        >
                            <FontAwesomeIcon icon={faPencil} size={18} color="green" />
                        </TouchableOpacity>
                    ) : !status.Status_Is_Default && !status.Status_Is_Closed ? (
                        <TouchableOpacity
                            onPress={() =>
                                removeStatus(
                                    status.Status_ID!,
                                    status.Backlog_ID,
                                    // `/backlog/${convertID_NameStringToURLFormat(
                                    //     localBacklog.Backlog_ID ?? 0,
                                    //     localBacklog.Backlog_Name
                                    // )}/edit`
                                    undefined
                                )
                            }
                            style={styles.iconButton}
                        >
                            <FontAwesomeIcon icon={faTrash} size={18} color="red" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Order / Move */}
                <View style={styles.row}>
                    {!status.Status_Is_Default && !status.Status_Is_Closed ? (
                        <>
                            {status.Status_Order! > 2 && (
                                <TouchableOpacity
                                    onPress={() =>
                                        handleMoveStatusChanges(status.Status_ID!, 'up')
                                    }
                                    style={styles.iconButton}
                                >
                                    <FontAwesomeIcon icon={faArrowUp} size={16} />
                                </TouchableOpacity>
                            )}
                            {localBacklog.statuses && localBacklog.statuses.length > ((status.Status_Order || 0) + 1) && (
                                <TouchableOpacity
                                    onPress={() =>
                                        handleMoveStatusChanges(status.Status_ID!, 'down')
                                    }
                                    style={styles.iconButton}
                                >
                                    <FontAwesomeIcon icon={faArrowDown} size={16} />
                                </TouchableOpacity>
                            )}
                        </>
                    ) : (
                        <FontAwesomeIcon icon={faLock} size={14} color="#999" />
                    )}
                    <Text style={styles.orderText}>Order: {status.Status_Order}</Text>
                </View>

                {/* Defaults and stats */}
                <View style={styles.row}>
                    <TouchableOpacity
                        disabled={status.Status_Is_Default}
                        onPress={() =>
                            handleAssignDefaultStatus(status.Status_ID ?? 0)
                        }
                    >
                        <Text>
                            Default: {status.Status_Is_Default ? 'Yes' : 'No'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        disabled={status.Status_Is_Closed}
                        onPress={() =>
                            handleAssignClosedStatus(status.Status_ID ?? 0)
                        }
                        style={styles.closedButton}
                    >
                        <Text>
                            Closed: {status.Status_Is_Closed ? 'Yes' : 'No'}
                        </Text>
                    </TouchableOpacity>

                    <Text>Tasks: {statusTasks} ({taskPercent}%)</Text>
                </View>
            </View>
        );
    };

    return (
        localBacklog && (
            <View style={styles.container}>
                <Text style={styles.header}>Statuses</Text>

                {/* Create new status */}
                <View style={styles.row}>
                    <TextInput
                        style={styles.input}
                        placeholder="New status"
                        value={newStatus.Status_Name}
                        onChangeText={(text) => setNewStatus({ ...newStatus, Status_Name: text })}
                        onSubmitEditing={Keyboard.dismiss}
                        onKeyPress={(e) => {
                            if (e.nativeEvent.key === 'Enter') {
                                handleCreateStatus();
                            }
                        }}
                    />
                    <TouchableOpacity onPress={handleCreateStatus} style={styles.createButton}>
                        <Text style={styles.createButtonText}>Create</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={
                        localBacklog.statuses
                            // Status_Order low to high:
                            ?.sort((a: Status, b: Status) => (a.Status_Order || 0) - (b.Status_Order || 0))
                    }
                    keyExtractor={(item) => String(item.Status_ID)}
                    renderItem={({ item: status }) =>
                        <StatusRow status={status} />
                    }
                />
            </View>
        )
    );
}

export const TaskSummaryCard: React.FC<{
    stats: {
        total: number;
        assigneeCount: Record<string | number, number>;
    } | null
}> = ({
    stats
}) => stats && (
    <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>Task Summary</Text>
        <Text>Total Tasks: {stats.total}</Text>
        <View style={{ marginTop: 10 }}>
            {Object.entries(stats.assigneeCount).map(([assignee, count]) => (
                <Text key={assignee}>
                    {assignee === 'Unassigned' ? 'Unassigned' : `User #${assignee}`}:
                    {((count / stats.total) * 100).toFixed(1)}%
                </Text>
            ))}
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#FFF',
        borderRadius: 10,
        elevation: 2,
    },
    header: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    input: {
        flex: 1,
        borderColor: '#CCC',
        borderWidth: 1,
        padding: 8,
        borderRadius: 6,
    },
    createButton: {
        marginLeft: 8,
        backgroundColor: '#3B82F6',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    createButtonText: {
        color: '#FFF',
        fontWeight: '500',
    },
    statusBlock: {
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: 8,
        marginBottom: 8,
    },
    iconButton: {
        marginLeft: 8,
    },
    orderText: {
        marginLeft: 8,
    },
    closedButton: {
        marginLeft: 16,
    },
});

export default BacklogDetailsView;
