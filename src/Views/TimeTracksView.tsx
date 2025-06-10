// External
import { faClock, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, DimensionValue, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PieChart } from 'react-native-chart-kit';

// Internal
import { useProjectsContext, useTaskTimeTrackContext, useTeamUserSeatsContext } from "@/src/Contexts";
import { Project, Task, TaskTimeTrack, TeamUserSeat } from "@/src/Types";
import { SecondsToTimeDisplay } from "../Components/CreatedAtToTimeSince";
import useMainViewJumbotron from "../Hooks/useMainViewJumbotron";

export const TimeTracksView = () => {
    // Hooks
    const route = useRoute();
    const navigation = useNavigation();
    const { t } = useTranslation(["timetrack"]);
    const { projectById, readProjectById } = useProjectsContext();
    const { taskTimeTracksByProjectId, getTaskTimeTracksByProject } = useTaskTimeTrackContext();
    const { teamUserSeatsById, readTeamUserSeatsByTeamId } = useTeamUserSeatsContext();
    const { handleScroll, handleFocusEffect } = useMainViewJumbotron({
        title: `Time Entries`,
        faIcon: faClock,
        visibility: 100,
        rightIcon: faLightbulb,
        rightIconActionRoute: "Project",
        rightIconActionParams: { id: ((projectById && projectById?.Project_ID) ?? "").toString() },
    })

    const {
        id: projectId,
        startDate: startDateParam,
        endDate: endDateParam,
        userIds: urlUserIds,
        taskIds: urlTaskIds
    } = route.params as {
        id: string;
        startDate?: string;
        endDate?: string;
        userIds?: string;
        taskIds?: string;
    };

    // State
    const [filterTimeEntries, setFilterTimeEntries] = useState(false);

    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);


    const [renderProject, setRenderProject] = useState<Project | undefined>();
    const [renderTimeTracks, setRenderTimeTracks] = useState<TaskTimeTrack[] | undefined>();

    const [sortedByDuration, setSortedByDuration] = useState<TaskTimeTrack[]>([]);
    const [sortedByLatest, setSortedByLatest] = useState<TaskTimeTrack[]>([]);

    // Extract all tasks from the project's backlogs
    const allProjectTasks = renderProject && renderProject?.backlogs
        ?.flatMap((backlog) => backlog.tasks || []) || [];

    // Methods
    const getPreviousWeekStartAndEnd = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        const start = new Date(today);
        start.setDate(today.getDate() - mondayOffset - 7);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 0);

        const format = (date: Date) => {
            return date.toISOString().slice(0, 19).replace("T", " ");
        };

        return {
            startTime: format(start),
            endTime: format(end),
        };
    };

    const { startTime: defaultStart, endTime: defaultEnd } = getPreviousWeekStartAndEnd();
    const [startDate, setStartDate] = useState<string>(startDateParam || defaultStart);
    const [endDate, setEndDate] = useState<string>(endDateParam || defaultEnd);

    // Effects
    useEffect(() => {
        if (urlUserIds) {
            // If userIds exist in the URL, use them
            const userIdsFromURL = urlUserIds ? urlUserIds.split(",") : [];
            setSelectedUserIds(userIdsFromURL);
        } else if (teamUserSeatsById.length) {
            // If no userIds in URL, select all users by default
            const allUserIds = teamUserSeatsById
                .map((userSeat: TeamUserSeat) => userSeat.user?.User_ID?.toString())
                .filter((userId) => userId !== undefined) // Remove undefined values
            setSelectedUserIds(allUserIds)
        }
    }, [urlUserIds, teamUserSeatsById]);

    useEffect(() => {
        if (urlTaskIds) {
            // If taskIds exist in the URL, use them
            const taskIdsFromURL = urlTaskIds ? urlTaskIds.split(",") : []
            setSelectedTaskIds(taskIdsFromURL)
        } else if (allProjectTasks.length) {
            // If no taskIds in URL, select all tasks by default
            const allTaskIds = allProjectTasks
                .map((task: Task) => task.Task_ID?.toString())
                .filter((taskId): taskId is string => taskId !== undefined) // Remove undefined values

            setSelectedTaskIds(allTaskIds);
        }
    }, [urlTaskIds, renderProject]);

    useEffect(() => {
        if (projectId && selectedUserIds.length && selectedTaskIds.length) {
            getTaskTimeTracksByProject(
                parseInt(projectId),
                startDate,
                endDate,
                selectedUserIds,
                selectedTaskIds
            );
        }
    }, [projectId, selectedUserIds, selectedTaskIds, startDate, endDate]);

    useEffect(() => {
        if (projectId) {
            readProjectById(parseInt(projectId));
        }
    }, [projectId]);

    useEffect(() => {
        if (projectById) {
            setRenderProject(projectById);
        }
    }, [projectById]);

    useEffect(() => {
        if (taskTimeTracksByProjectId?.length) {
            setRenderTimeTracks(taskTimeTracksByProjectId);
        } else {
            setRenderTimeTracks(undefined);
        }
    }, [taskTimeTracksByProjectId]);

    useEffect(() => {
        if (renderTimeTracks?.length) {
            setSortedByDuration([...renderTimeTracks].sort((a, b) => (b.Time_Tracking_Duration ?? 0) - (a.Time_Tracking_Duration ?? 0)));
            setSortedByLatest([...renderTimeTracks].sort((a, b) => (b.Time_Tracking_ID ?? 0) - (a.Time_Tracking_ID ?? 0)));
        } else {
            setSortedByDuration([]);
            setSortedByLatest([]);
        }
    }, [renderTimeTracks]);

    useEffect(() => {
        if (renderProject?.team?.Team_ID && !teamUserSeatsById.length) {
            readTeamUserSeatsByTeamId(renderProject.team.Team_ID);
        }
    }, [renderProject]);

    useFocusEffect(
        useCallback(() => {
            handleFocusEffect();
        }, [])
    );

    if (!renderProject) return null;

    return (
        <ScrollView style={styles.timeTracksContainer}>
            <View style={styles.section}>
                <TimeSummary timeTracks={renderTimeTracks} />
            </View>

            <View style={styles.section}>
                <TimeTracksPeriodSum timeTracks={sortedByLatest} />
            </View>

            <View style={styles.row}>
                <View style={styles.columnLeft}>
                    <TimeSpentPerTask
                        renderProject={renderProject}
                        sortedByDuration={sortedByDuration}
                    />
                </View>
                <View style={styles.columnRight}>
                    <LatestTimeLogs sortedByLatest={sortedByLatest} />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    timeTracksContainer: {
        padding: 16,
        backgroundColor: "#f9f9f9",
    },
    backLink: {
        color: "#007bff",
        marginBottom: 12,
        fontWeight: "600",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    filterButtonText: {
        marginLeft: 6,
        fontWeight: "600",
    },
    section: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 10,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
    },
    columnLeft: {
        flex: 1,
        minWidth: "100%", // Stacks in small screens
    },
    columnRight: {
        flex: 2,
        minWidth: "100%",
    },
});

interface TimeTracksSubComponentsProps {
    timeTracks: TaskTimeTrack[] | undefined;
}

export const TimeSummary: React.FC<TimeTracksSubComponentsProps> = ({ timeTracks }) => {
    const { t } = useTranslation(['timetrack']);

    // Calculate total time tracked
    const totalTimeTracked = useMemo(() => {
        return timeTracks?.reduce((sum, track) => sum + (track.Time_Tracking_Duration || 0), 0) || 0;
    }, [timeTracks]);

    // Calculate average daily time spent
    const averageDailyTime = useMemo(() => {
        if (!timeTracks || timeTracks.length === 0) return 0;

        const uniqueDays = new Set(
            timeTracks.map((track: TaskTimeTrack) => new Date(track.Time_Tracking_Start_Time).toDateString())
        );

        return totalTimeTracked / uniqueDays.size;
    }, [timeTracks, totalTimeTracked]);

    return (
        <View style={timeSummaryStyles.container}>
            <View style={timeSummaryStyles.summaryBox}>
                <FontAwesomeIcon icon={faClock} size={24} color="#3b82f6" style={timeSummaryStyles.icon} />
                <Text style={timeSummaryStyles.heading}>
                    {t('timetrack.timeSummary.totalTimeTracked')}
                </Text>
                <Text style={timeSummaryStyles.value}>
                    <SecondsToTimeDisplay totalSeconds={totalTimeTracked} />
                </Text>
            </View>

            <View style={timeSummaryStyles.summaryBox}>
                <FontAwesomeIcon icon={faClock} size={24} color="#10b981" style={timeSummaryStyles.icon} />
                <Text style={timeSummaryStyles.heading}>
                    {t('timetrack.timeSummary.avgDailyTimeSpent')}
                </Text>
                <Text style={timeSummaryStyles.value}>
                    <SecondsToTimeDisplay totalSeconds={averageDailyTime} />
                </Text>
            </View>
        </View>
    );
};

const timeSummaryStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 16,
        gap: 16,
        flexWrap: 'wrap',
    },
    summaryBox: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        minWidth: 150,
    },
    icon: {
        marginBottom: 8,
    },
    heading: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 4,
    },
    value: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export const TimeTracksPeriodSum: React.FC<TimeTracksSubComponentsProps> = ({ timeTracks }) => {
    const { t } = useTranslation(['timetrack']);
    // const navigation = useNavigation(); // Optional if using navigation

    if (!timeTracks || timeTracks.length === 0) {
        return <Text style={timeTracksPeriodSumStyles.emptyText}>{t('timetrack.noTimeTracks')}</Text>;
    }

    // Group time tracks by day (YYYY-MM-DD format)
    const groupedByDay = timeTracks.reduce<Record<string, TaskTimeTrack[]>>((acc, track) => {
        const date = new Date(track.Time_Tracking_Start_Time).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(track);
        return acc;
    }, {});

    const sortedGroupedByDay = Object.entries(groupedByDay)
        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
        .map(([date, tracks]) => ({ date, tracks }));

    return (
        <View style={timeTracksPeriodSumStyles.wrapper}>
            <Text style={timeTracksPeriodSumStyles.heading}>
                {t('timetrack.timeTracksPeriodSum.title')}
            </Text>

            {sortedGroupedByDay.map(({ date, tracks }) => {
                const dateObj = new Date(tracks[0].Time_Tracking_Start_Time);
                const formattedDate = dateObj.toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });

                const totalDayTime = tracks.reduce(
                    (sum, track) => sum + (track.Time_Tracking_Duration || 0),
                    0
                );

                return (
                    <View key={date} style={timeTracksPeriodSumStyles.dayCard}>
                        <Text style={timeTracksPeriodSumStyles.dateText}>{formattedDate}</Text>
                        <Text style={timeTracksPeriodSumStyles.subText}>
                            {t('timetrack.timeTracksPeriodSum.totalTimeTracked')}:{' '}
                            <SecondsToTimeDisplay totalSeconds={totalDayTime} />
                        </Text>

                        <View>
                            {tracks?.map((item) => (
                                <View
                                    key={(item.Time_Tracking_ID ?? "").toString()}
                                    style={timeTracksPeriodSumStyles.trackItem}
                                >
                                    <Text style={timeTracksPeriodSumStyles.taskRef}>
                                        ({item.task?.backlog?.project?.Project_Key}-{item.task?.Task_Key})
                                    </Text>
                                    <TouchableOpacity
                                        // onPress={() => navigation.navigate("TaskDetail", { ... })}
                                        style={timeTracksPeriodSumStyles.link}
                                    >
                                        <Text style={timeTracksPeriodSumStyles.taskTitle}>
                                            {item.task?.Task_Title}
                                        </Text>
                                    </TouchableOpacity>
                                    <Text>
                                        <SecondsToTimeDisplay
                                            totalSeconds={item.Time_Tracking_Duration || 0}
                                        />
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

const timeTracksPeriodSumStyles = StyleSheet.create({
    wrapper: {
        padding: 16,
    },
    heading: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    dayCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        marginBottom: 16,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
    },
    subText: {
        fontSize: 14,
        color: '#4B5563',
        marginTop: 4,
    },
    trackItem: {
        backgroundColor: '#F3F4F6',
        marginTop: 8,
        padding: 8,
        borderRadius: 8,
    },
    taskRef: {
        fontSize: 12,
        color: '#6B7280',
    },
    taskTitle: {
        color: '#2563EB',
        fontSize: 14,
        marginVertical: 2,
    },
    link: {
        marginBottom: 4,
    },
    emptyText: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 14,
        marginVertical: 20,
    },
});

interface TimeSpentPerTaskProps {
    renderProject: Project | undefined;
    sortedByDuration: TaskTimeTrack[] | undefined;
}

export const TimeSpentPerTask: React.FC<TimeSpentPerTaskProps> = ({ renderProject, sortedByDuration }) => {
    const { t } = useTranslation(['timetrack']);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        if (!sortedByDuration) return;

        const taskTimeMap = new Map<string, { Task_Key: string; Hours_Spent: number }>();

        sortedByDuration.forEach((track) => {
            const taskName = track.task?.Task_Title || t('timetrack.timeSpentPerTask.unknownTask');
            const taskKey = track.task?.Task_Key || '0';
            const hours = track.Time_Tracking_Duration ? track.Time_Tracking_Duration / 3600 : 0;

            if (taskTimeMap.has(taskName)) {
                taskTimeMap.get(taskName)!.Hours_Spent += hours;
            } else {
                taskTimeMap.set(taskName, { Task_Key: taskKey.toString(), Hours_Spent: hours });
            }
        });

        const sortedTaskTimeEntries = [...taskTimeMap.entries()].sort((a, b) => b[1].Hours_Spent - a[1].Hours_Spent);

        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
        const pieData = sortedTaskTimeEntries.map(([label, data], index) => ({
            name: label,
            taskKey: data.Task_Key,
            hours: data.Hours_Spent,
            color: colors[index % colors.length],
            legendFontColor: '#333',
            legendFontSize: 12,
        }));

        setChartData(pieData);
    }, [sortedByDuration]);

    const totalHours = chartData.reduce((sum, item) => sum + item.hours, 0);

    return (
        <View style={timeSpentPerTaskStyles.container}>
            <Text style={timeSpentPerTaskStyles.heading}>{t('timetrack.timeSpentPerTask.title')}</Text>

            {chartData.length > 0 ? (
                <PieChart
                    data={chartData}
                    width={Dimensions.get('window').width - 32}
                    height={220}
                    chartConfig={{
                        backgroundColor: '#fff',
                        backgroundGradientFrom: '#fff',
                        backgroundGradientTo: '#fff',
                        color: () => `#333`,
                        labelColor: () => '#333',
                        decimalPlaces: 1,
                    }}
                    accessor={'hours'}
                    backgroundColor={'transparent'}
                    paddingLeft={'15'}
                    absolute
                />
            ) : (
                <Text style={timeSpentPerTaskStyles.emptyText}>{t('timetrack.timeSpentPerTask.noData')}</Text>
            )}

            {chartData.length > 0 && (
                <View style={timeSpentPerTaskStyles.listContainer}>
                    {chartData.map((item, index) => {
                        const percentage = ((item.hours / totalHours) * 100).toFixed(2);

                        return (
                            <View key={index} style={timeSpentPerTaskStyles.taskItem}>
                                <View style={timeSpentPerTaskStyles.row}>
                                    <TouchableOpacity
                                        // onPress={() => navigation.navigate('TaskDetail', { ... })}
                                        style={timeSpentPerTaskStyles.taskLink}
                                    >
                                        <Text style={timeSpentPerTaskStyles.taskText}>
                                            ({renderProject?.Project_Key}-{item.taskKey}) {item.name}{' '}
                                            <Text style={timeSpentPerTaskStyles.durationText}>
                                                <SecondsToTimeDisplay totalSeconds={item.hours * 3600} />
                                            </Text>
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={timeSpentPerTaskStyles.percentageText}>{percentage}%</Text>
                                </View>

                                <View style={timeSpentPerTaskStyles.progressBar}>
                                    <View
                                        style={[
                                            timeSpentPerTaskStyles.progressFill,
                                            {
                                                width: percentage + '%' as DimensionValue,
                                                backgroundColor: item.color
                                            },
                                        ]}
                                    />
                                </View>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
};

const timeSpentPerTaskStyles = StyleSheet.create({
    container: {
        padding: 16,
    },
    heading: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginVertical: 16,
    },
    listContainer: {
        marginTop: 20,
    },
    taskItem: {
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    taskText: {
        fontSize: 14,
        color: '#1F2937',
    },
    durationText: {
        color: '#9CA3AF',
        fontSize: 12,
    },
    percentageText: {
        fontSize: 13,
        fontWeight: '500',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 10,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 10,
    },
    taskLink: {
        flexShrink: 1,
    },
});

interface LatestTimeLogsProps {
    sortedByLatest: TaskTimeTrack[] | undefined;
}

export const LatestTimeLogs: React.FC<LatestTimeLogsProps> = ({ sortedByLatest }) => {
    const { t } = useTranslation(['timetrack']);

    if (!sortedByLatest || sortedByLatest.length === 0) {
        return <Text style={latestTimeLogsStyles.emptyText}>{t('timetrack.latestTimeLogs.noTimeTracks')}</Text>;
    }

    const categorizeEntry = (date: Date): string => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

        const startOfPreviousWeek = new Date(startOfWeek);
        startOfPreviousWeek.setDate(startOfWeek.getDate() - 7);

        const endOfPreviousWeek = new Date(endOfWeek);
        endOfPreviousWeek.setDate(endOfWeek.getDate() - 7);

        if (date >= today) return t('timetrack.latestTimeLogs.today');
        if (date >= yesterday) return t('timetrack.latestTimeLogs.yesterday');
        if (date >= startOfWeek && date <= endOfWeek) return t('timetrack.latestTimeLogs.thisWeek');
        if (date >= startOfPreviousWeek && date <= endOfPreviousWeek) return t('timetrack.latestTimeLogs.previousWeek');
        if (date >= startOfMonth) return t('timetrack.latestTimeLogs.thisMonth');
        if (date >= startOfLastMonth && date <= endOfLastMonth) return t('timetrack.latestTimeLogs.lastMonth');
        return t('timetrack.latestTimeLogs.earlier');
    };

    const groupedLogs = sortedByLatest.reduce((acc, track) => {
        if (!track.Time_Tracking_Start_Time) return acc;

        const startTime = new Date(track.Time_Tracking_Start_Time);
        const category = categorizeEntry(startTime);

        if (!acc[category]) acc[category] = [];
        acc[category].push(track);
        return acc;
    }, {} as Record<string, TaskTimeTrack[]>);

    const sectionOrder = [
        t('timetrack.latestTimeLogs.today'),
        t('timetrack.latestTimeLogs.yesterday'),
        t('timetrack.latestTimeLogs.thisWeek'),
        t('timetrack.latestTimeLogs.previousWeek'),
        t('timetrack.latestTimeLogs.thisMonth'),
        t('timetrack.latestTimeLogs.lastMonth'),
        t('timetrack.latestTimeLogs.earlier'),
    ];

    return (
        <View style={latestTimeLogsStyles.container}>
            <Text style={latestTimeLogsStyles.heading}>{t('timetrack.latestTimeLogs.title')}</Text>

            {sectionOrder.map((section) =>
                groupedLogs[section] ? (
                    <View key={section} style={latestTimeLogsStyles.section}>
                        <Text style={latestTimeLogsStyles.sectionTitle}>{section}</Text>
                        {groupedLogs[section].map((track) => (
                            <View key={track.Time_Tracking_ID} style={latestTimeLogsStyles.logItem}>
                                <Text style={latestTimeLogsStyles.logText}>
                                    {track.user?.User_FirstName} {track.user?.User_Surname}{' '}
                                    {t('timetrack.latestTimeLogs.logged')}:{' '}
                                    <Text style={latestTimeLogsStyles.taskReference}>
                                        ({track.task?.backlog?.project?.Project_Key}-{track.task?.Task_Key})
                                    </Text>{' '}
                                    {track.task?.Task_Title}
                                </Text>

                                <Text style={latestTimeLogsStyles.duration}>
                                    {track.Time_Tracking_Duration ? (
                                        <SecondsToTimeDisplay totalSeconds={track.Time_Tracking_Duration} />
                                    ) : (
                                        t('timetrack.latestTimeLogs.ongoing')
                                    )}
                                </Text>

                                <Text style={latestTimeLogsStyles.timeRange}>
                                    {new Date(track.Time_Tracking_Start_Time).toLocaleString()} -{' '}
                                    {track.Time_Tracking_End_Time
                                        ? new Date(track.Time_Tracking_End_Time).toLocaleString()
                                        : t('timetrack.latestTimeLogs.endTimeNotAvailable')}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : null
            )}
        </View>
    );
};

const latestTimeLogsStyles = StyleSheet.create({
    container: {
        padding: 16,
    },
    heading: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginVertical: 16,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 6,
    },
    logItem: {
        backgroundColor: '#F3F4F6',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    logText: {
        fontSize: 14,
        marginBottom: 4,
    },
    taskReference: {
        fontSize: 12,
        color: '#6B7280',
    },
    duration: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1D4ED8',
    },
    timeRange: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
});
