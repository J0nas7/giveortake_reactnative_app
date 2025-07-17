import { SecondsToTimeDisplay } from '@/src/Components/CreatedAtToTimeSince';
import { TimeTracksSubComponentsProps } from '@/src/Components/Project';
import { TaskTimeTrack } from '@/src/Types';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

export const TimeSummary: React.FC<TimeTracksSubComponentsProps> = ({
    timeTracks,
    startDate,
    endDate
}) => {
    const { t } = useTranslation(['timetrack']);
    const startDateWithoutTime = new Date(startDate ? startDate : '')
    const endDateWithoutTime = new Date(endDate ? endDate : '')

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
                <Text>{timeTracks?.length} timetracks</Text>
            </View>

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
                <Text>{startDateWithoutTime.toLocaleString()} - {endDateWithoutTime.toLocaleString()}</Text>
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
