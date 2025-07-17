import { SecondsToTimeDisplay } from '@/src/Components/CreatedAtToTimeSince';
import { TimeTracksSubComponentsProps } from '@/src/Components/Project';
import { TaskTimeTrack } from '@/src/Types';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
