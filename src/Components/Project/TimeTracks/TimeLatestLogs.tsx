import { SecondsToTimeDisplay } from '@/src/Components/CreatedAtToTimeSince';
import { TaskTimeTrack } from '@/src/Types';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

interface TimeLatestLogsProps {
    sortedByLatest: TaskTimeTrack[] | undefined;
}

export const TimeLatestLogs: React.FC<TimeLatestLogsProps> = ({
    sortedByLatest
}) => {
    const { t } = useTranslation(['timetrack']);

    if (!sortedByLatest || sortedByLatest.length === 0) {
        return <Text style={timeLatestLogsStyles.emptyText}>{t('timetrack.latestTimeLogs.noTimeTracks')}</Text>;
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
        <View style={timeLatestLogsStyles.container}>
            <Text style={timeLatestLogsStyles.heading}>{t('timetrack.latestTimeLogs.title')}</Text>

            {sectionOrder.map((section) =>
                groupedLogs[section] ? (
                    <View key={section} style={timeLatestLogsStyles.section}>
                        <Text style={timeLatestLogsStyles.sectionTitle}>{section}</Text>
                        {groupedLogs[section].map((track) => (
                            <View key={track.Time_Tracking_ID} style={timeLatestLogsStyles.logItem}>
                                <Text style={timeLatestLogsStyles.logText}>
                                    {track.user?.User_FirstName} {track.user?.User_Surname}{' '}
                                    {t('timetrack.latestTimeLogs.logged')}:{' '}
                                    <Text style={timeLatestLogsStyles.taskReference}>
                                        ({track.task?.backlog?.project?.Project_Key}-{track.task?.Task_Key})
                                    </Text>{' '}
                                    {track.task?.Task_Title}
                                </Text>

                                <Text style={timeLatestLogsStyles.duration}>
                                    {track.Time_Tracking_Duration ? (
                                        <SecondsToTimeDisplay totalSeconds={track.Time_Tracking_Duration} />
                                    ) : (
                                        t('timetrack.latestTimeLogs.ongoing')
                                    )}
                                </Text>

                                <Text style={timeLatestLogsStyles.timeRange}>
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

const timeLatestLogsStyles = StyleSheet.create({
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
