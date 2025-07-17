import { CreatedAtToTimeSince, SecondsToTimeDisplay, TimeSpentDisplay } from '@/src/Components/CreatedAtToTimeSince';
import { Card } from '@/src/Components/Task/TaskDetails/TaskCard';
import { useTasksContext, useTaskTimeTrackContext } from '@/src/Contexts';
import { selectAuthUser, selectAuthUserTaskTimeTrack, useTypedSelector } from '@/src/Redux';
import { Task, TaskTimeTrack } from '@/src/Types';
import { faPlay, faStop } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const TaskInfoArea: React.FC<{ task: Task }> = ({ task }) => {
    const { readTasksByBacklogId, readTaskByKeys, taskDetail, setTaskDetail, saveTaskChanges } = useTasksContext();
    const { taskTimeTracksById, readTaskTimeTracksByTaskId, handleTaskTimeTrack } = useTaskTimeTrackContext();

    const [taskTimeSpent, setTaskTimeSpent] = useState<number>(0);

    useEffect(() => {
        if (task.Task_ID) {
            readTaskTimeTracksByTaskId(task.Task_ID);
        }
    }, [task]);

    useEffect(() => {
        if (Array.isArray(taskTimeTracksById)) {
            const totalTime = taskTimeTracksById.reduce((sum, track) => sum + (track.Time_Tracking_Duration || 0), 0);
            setTaskTimeSpent(totalTime);
        }
    }, [taskTimeTracksById]);

    // Handle status change
    const handleStatusChange = (newStatus: Task["Status_ID"]) => {
        handleTaskChanges("Status_ID", newStatus.toString());
    };

    const handleAssigneeChange = (newAssigneeID: Task["Assigned_User_ID"]) => {
        if (newAssigneeID) handleTaskChanges("Assigned_User_ID", newAssigneeID.toString());
    }

    const handleTaskChanges = async (field: keyof Task, value: string) => {
        await saveTaskChanges({ ...task, [field]: value }, task.Backlog_ID);

        if (task.Backlog_ID) readTasksByBacklogId(task.Backlog_ID, true);
        if (task.Task_Key && task.backlog?.project?.Project_Key)
            await readTaskByKeys(task.backlog.project.Project_Key, task.Task_Key.toString());

        if (taskDetail) {
            setTaskDetail({ ...taskDetail, [field]: value });
        }
    };

    return (
        <TaskInfoView
            task={task}
            taskDetail={taskDetail}
            taskTimeSpent={taskTimeSpent}
            taskTimeTracksById={taskTimeTracksById}
            setTaskDetail={setTaskDetail}
            saveTaskChanges={saveTaskChanges}
            handleStatusChange={handleStatusChange}
            handleAssigneeChange={handleAssigneeChange}
            handleTaskChanges={handleTaskChanges}
            handleTaskTimeTrack={handleTaskTimeTrack}
        />
    );
};

interface TaskInfoViewProps {
    task: Task
    taskDetail: Task | undefined
    taskTimeSpent: number
    taskTimeTracksById: TaskTimeTrack[]
    setTaskDetail: React.Dispatch<React.SetStateAction<Task | undefined>>
    saveTaskChanges: (taskChanges: Task, parentId: number) => void
    handleStatusChange: (newStatus: Task["Status_ID"]) => void
    handleAssigneeChange: (newAssigneeID: Task["Assigned_User_ID"]) => void
    handleTaskChanges: (field: keyof Task, value: string) => void
    handleTaskTimeTrack: (action: "Play" | "Stop", task: Task) => Promise<Task | undefined>
}

const TaskInfoView: React.FC<TaskInfoViewProps> = ({
    task,
    taskDetail,
    taskTimeSpent,
    taskTimeTracksById,
    setTaskDetail,
    saveTaskChanges,
    handleTaskChanges,
    handleTaskTimeTrack,
}) => (
    <Card style={taskDetailsAreaStyles.container}>
        <Text style={taskDetailsAreaStyles.heading}>Task Details</Text>

        <Text style={taskDetailsAreaStyles.label}>Status:</Text>
        <Text>{task.status?.Status_Name}</Text>
        {/* <Picker
                selectedValue={task.Task_Status}
                onValueChange={(itemValue) => handleTaskChanges("Task_Status", itemValue)}
            >
                <Picker.Item label="To Do" value="To Do" />
                <Picker.Item label="In Progress" value="In Progress" />
                <Picker.Item label="Waiting for Review" value="Waiting for Review" />
                <Picker.Item label="Done" value="Done" />
            </Picker> */}

        <Text style={taskDetailsAreaStyles.label}>Assigned To:</Text>
        {(() => {
            const assignedUser = task.backlog?.project?.team?.user_seats?.find(userSeat => userSeat.user?.User_ID === task.Assigned_User_ID);
            if (assignedUser) {
                return (
                    <Text>{`${assignedUser.user?.User_FirstName} ${assignedUser.user?.User_Surname}`}</Text>
                );
            } else {
                return <Text>Unassigned</Text>;
            }
        })()}
        {/* <Picker
                selectedValue={task.Assigned_User_ID || ""}
                onValueChange={(itemValue) => handleTaskChanges("Assigned_User_ID", itemValue.toString())}
            >
                <Picker.Item label="Unassigned" value="" />
                {task.project?.team?.user_seats?.map(userSeat => (
                    <Picker.Item
                        key={userSeat.user?.User_ID}
                        label={`${userSeat.user?.User_FirstName} ${userSeat.user?.User_Surname}`}
                        value={userSeat.user?.User_ID}
                    />
                ))}
            </Picker> */}

        <Text><Text style={taskDetailsAreaStyles.label}>Team:</Text> {task.backlog?.project?.team?.Team_Name}</Text>
        <Text><Text style={taskDetailsAreaStyles.label}>Created At:</Text> {task.Task_CreatedAt && <CreatedAtToTimeSince dateCreatedAt={task.Task_CreatedAt} />}</Text>
        <Text><Text style={taskDetailsAreaStyles.label}>Due Date:</Text> {task.Task_Due_Date ? new Date(task.Task_Due_Date).toLocaleString() : "N/A"}</Text>

        <Text style={taskDetailsAreaStyles.label}>Time Tracking:</Text>
        <TimeSpentDisplayView task={task} handleTaskTimeTrack={handleTaskTimeTrack} />

        <Text style={taskDetailsAreaStyles.label}>Time Spent:</Text>
        <Text><SecondsToTimeDisplay totalSeconds={taskTimeSpent} /> ({taskTimeTracksById.length} entries)</Text>
    </Card>
);

const taskDetailsAreaStyles = StyleSheet.create({
    container: {
        padding: 16,
    },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    label: {
        fontWeight: '600',
        marginTop: 10,
    },
});

interface TimeSpentDisplayViewProps {
    task: Task
    handleTaskTimeTrack: (action: "Play" | "Stop", task: Task) => Promise<Task | undefined>
}

const TimeSpentDisplayView: React.FC<TimeSpentDisplayViewProps> = ({ task, handleTaskTimeTrack }) => {
    const authUser = useTypedSelector(selectAuthUser);
    const taskTimeTrack = useTypedSelector(selectAuthUserTaskTimeTrack);

    const isTracking = taskTimeTrack && taskTimeTrack.Task_ID === task.Task_ID;

    return (
        <View style={timeSpentDisplayViewStyles.container}>
            {isTracking ? (
                <>
                    <TouchableOpacity style={timeSpentDisplayViewStyles.stopButton} onPress={() => handleTaskTimeTrack("Stop", task)}>
                        <FontAwesomeIcon icon={faStop} color="#fff" />
                    </TouchableOpacity>
                    <Text>
                        <TimeSpentDisplay startTime={taskTimeTrack.Time_Tracking_Start_Time} />
                    </Text>
                </>
            ) : (
                <TouchableOpacity style={timeSpentDisplayViewStyles.playButton} onPress={() => handleTaskTimeTrack("Play", task)}>
                    <FontAwesomeIcon icon={faPlay} color="#fff" />
                </TouchableOpacity>
            )}
        </View>
    );
};

const timeSpentDisplayViewStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginVertical: 8,
    },
    stopButton: {
        backgroundColor: '#ff4d4f',
        padding: 10,
        borderRadius: '100%',
    },
    playButton: {
        backgroundColor: '#52c41a',
        padding: 10,
        borderRadius: '100%',
    },
});
