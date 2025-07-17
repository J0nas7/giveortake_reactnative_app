import { Backlog, BacklogStates, MainStackParamList, Status, Task, User } from '@/src/Types';
import { faArrowDown, faArrowUp, faLock, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { NavigationProp } from '@react-navigation/native';
import { useState } from 'react';
import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
                <View style={[styles.row, { marginBottom: 20 }]}>
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

                <View>
                    {localBacklog.statuses
                        ?.sort((a: Status, b: Status) => (a.Status_Order || 0) - (b.Status_Order || 0))
                        ?.map((status) => (
                            <StatusRow key={status.Status_ID} status={status} />
                        ))}
                </View>
            </View>
        )
    );
}

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
