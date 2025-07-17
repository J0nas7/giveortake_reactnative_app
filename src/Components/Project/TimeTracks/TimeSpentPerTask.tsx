import { SecondsToTimeDisplay } from '@/src/Components/CreatedAtToTimeSince';
import { Project, TaskTimeTrack } from '@/src/Types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, DimensionValue, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

interface TimeSpentPerTaskProps {
    renderProject: Project | undefined;
    sortedByDuration: TaskTimeTrack[] | undefined;
}

export const TimeSpentPerTask: React.FC<TimeSpentPerTaskProps> = ({
    renderProject,
    sortedByDuration
}) => {
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
