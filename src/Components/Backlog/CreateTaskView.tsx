import { editorStyles, ModalToggler } from '@/src/Components/ModalToggler'
import { BacklogStates, Task, TaskFields } from '@/src/Types'
import { faChevronRight, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { Picker } from '@react-native-picker/picker'
import { useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#fff'
    },
    content: {
        padding: 16
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
    }
});
