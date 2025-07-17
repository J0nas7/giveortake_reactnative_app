import { modalTogglerStyles } from '@/src/Components/ModalToggler'
import { TaskBulkActionMenu } from '@/src/Components/TaskBulkActionMenu'
import { BacklogStates, MainStackParamList, Task } from '@/src/Types'
import { faCheckDouble, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { NavigationProp } from '@react-navigation/native'
import { FlatList, RefreshControl, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'

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
