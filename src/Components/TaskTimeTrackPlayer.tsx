import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { useTypedSelector, selectAuthUserTaskTimeTrack, useAppDispatch, useAuthActions } from '@/src/Redux';
import { useTasksContext, useTaskTimeTrackContext } from '@/src/Contexts';
import { MainStackParamList, TaskTimeTrack } from '@/src/Types';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStop } from '@fortawesome/free-solid-svg-icons';
import { TimeSpentDisplay } from './CreatedAtToTimeSince';
import { Picker } from '@react-native-picker/picker';

export const TaskTimeTrackPlayer: React.FC = () => {
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();

    const { latestUniqueTaskTimeTracksByProject, getLatestUniqueTaskTimeTracksByProject, handleTaskTimeTrack } = useTaskTimeTrackContext();
    const { taskDetail } = useTasksContext();
    const { fetchIsLoggedInStatus } = useAuthActions();
    const dispatch = useAppDispatch();

    const taskTimeTrack = useTypedSelector(selectAuthUserTaskTimeTrack);

    useEffect(() => {
        if (!taskTimeTrack) dispatch(fetchIsLoggedInStatus());

        if (taskTimeTrack) getLatestUniqueTaskTimeTracksByProject(taskTimeTrack.Project_ID);
    }, [taskTimeTrack]);

    if (!taskTimeTrack) return null;

    const handleNavigateToTask = () => {
        const projectKey = taskTimeTrack.task?.project?.Project_Key;
        const taskKey = taskTimeTrack.task?.Task_Key;

        if (projectKey && taskKey) {
            navigation.navigate('Task', { projectKey, taskKey: taskKey.toString() });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {taskTimeTrack.task && (
                    <TouchableOpacity
                        style={styles.stopButton}
                        onPress={() => handleTaskTimeTrack('Stop', taskTimeTrack.task!)}
                    >
                        <FontAwesomeIcon icon={faStop} size={18} color="#fff" />
                    </TouchableOpacity>
                )}

                <View style={styles.timeSpent}>
                    {taskTimeTrack.Time_Tracking_Start_Time && (
                        <Text>
                            <TimeSpentDisplay startTime={taskTimeTrack.Time_Tracking_Start_Time} />
                        </Text>
                    )}
                </View>

                <TouchableOpacity onPress={handleNavigateToTask}>
                    <Text style={styles.taskTitle} numberOfLines={1}>
                        {taskTimeTrack.task?.Task_Title}
                    </Text>
                </TouchableOpacity>

                {latestUniqueTaskTimeTracksByProject && latestUniqueTaskTimeTracksByProject?.length > 0 && (
                    <Picker
                        selectedValue=""
                        style={styles.picker}
                        onValueChange={(itemValue) => {
                            const selected = latestUniqueTaskTimeTracksByProject.find(
                                (track: TaskTimeTrack) => track.Time_Tracking_ID === Number(itemValue)
                            );
                            if (selected?.task) handleTaskTimeTrack('Play', selected.task);
                        }}
                    >
                        <Picker.Item label="Recent tasks" value="" />
                        {latestUniqueTaskTimeTracksByProject.map((timetrack, index) => {
                            if (timetrack.Task_ID === taskTimeTrack.Task_ID) return null;
                            return (
                                <Picker.Item
                                    key={index}
                                    label={timetrack.task?.Task_Title || 'Untitled Task'}
                                    value={(timetrack.Time_Tracking_ID ?? "").toString()}
                                />
                            );
                        })}
                    </Picker>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: '#f7f7f7',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    stopButton: {
        backgroundColor: '#ff4d4f',
        padding: 10,
        borderRadius: '100%',
    },
    timeSpent: {
        minWidth: 80,
        alignItems: 'center',
    },
    taskTitle: {
        color: '#3498db',
        textDecorationLine: 'underline',
        maxWidth: 150,
    },
    picker: {
        height: 40,
        width: 180,
    },
});

