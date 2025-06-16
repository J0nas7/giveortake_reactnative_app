import { useBacklogsContext, useTasksContext } from '@/src/Contexts';
import { LoadingState } from '@/src/Core-UI/LoadingState';
import useRoleAccess from '@/src/Hooks/useRoleAccess';
import { MainStackParamList, Task } from '@/src/Types';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const DashboardContainer: React.FC = () => {
    // Hooks
    const route = useRoute();
    const { id: backlogId } = route.params as { id: string };  // Get id as backlogId from route params

    const { t } = useTranslation(['dashboard']);
    const { tasksById, readTasksByBacklogId } = useTasksContext();
    const { backlogById: renderBacklog, readBacklogById } = useBacklogsContext();
    const navigation = useNavigation<NavigationProp<MainStackParamList>>()

    const { canAccessBacklog, canManageBacklog } = useRoleAccess(
        renderBacklog ? renderBacklog.project?.team?.organisation?.User_ID : undefined,
        'backlog',
        parseInt(backlogId)
    );

    const [renderTasks, setRenderTasks] = useState<Task[] | undefined>(undefined);

    useEffect(() => {
        readTasksByBacklogId(parseInt(backlogId));
        readBacklogById(parseInt(backlogId));
    }, [backlogId]);

    useEffect(() => {
        if (tasksById.length === 0 && renderTasks) {
            setRenderTasks(undefined);
        }
        if (tasksById.length) {
            setRenderTasks(tasksById);
        }
    }, [tasksById]);

    const safeTasks = Array.isArray(renderTasks) ? renderTasks : [];

    const taskStatuses = useMemo(() => ({
        todo: safeTasks.filter(task => task.status?.Status_Is_Default),
        inProgress: safeTasks.filter(task =>
            !task.status?.Status_Is_Default && !task.status?.Status_Is_Closed
        ),
        done: safeTasks.filter(task => task.status?.Status_Is_Closed),
    }), [safeTasks]);

    const totalTasks = safeTasks.length;
    const todoTasks = taskStatuses.todo.length;
    const inProgressTasks = taskStatuses.inProgress.length;
    const completedTasks = taskStatuses.done.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const overdueTasks = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return safeTasks.filter(
            task =>
                task.Task_Due_Date &&
                typeof task.Task_Due_Date === 'string' &&
                task.Task_Due_Date < today &&
                task.status?.Status_Is_Closed !== true
        ).length;
    }, [safeTasks]);

    const pieData = useMemo(() => {
        if (!renderBacklog) return [];

        const statuses = renderBacklog?.statuses || [];
        return statuses.map((status, index) => ({
            name: status.Status_Name,
            count: renderBacklog?.tasks?.filter(t => t.Status_ID === status.Status_ID).length || 0,
            color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'][index % 4],
            legendFontColor: '#333',
            legendFontSize: 14,
        }));
    }, [renderBacklog]);

    const barChartData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                data: [12, 19, 3, 5],
                color: () => '#36A2EB',
            },
            {
                data: [7, 11, 5, 8],
                color: () => '#FFCE56',
            },
        ],
        legend: [t('dashboard.completedTasks'), t('dashboard.pendingTasks')],
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{t('dashboard.title')}</Text>
            <Text style={styles.subtitle}>{backlogId} - {renderBacklog && renderBacklog.Backlog_Name}</Text>

            <LoadingState
                singular="Backlog"
                renderItem={renderBacklog}
                permitted={canAccessBacklog}
            >
                {renderBacklog && (
                    <>
                        {/* KPIs */}
                        <View style={styles.kpiRow}>
                            <KPI label={t('dashboard.totalTasks')} value={totalTasks} />
                            <KPI label={t('dashboard.completedTasks')} value={`${completedTasks} (${completionRate}%)`} />
                        </View>
                        <View style={styles.kpiRow}>
                            <KPI label={t('dashboard.overdueTasks')} value={overdueTasks} />
                            <KPI label={t('dashboard.tasksInProgress')} value={inProgressTasks} />
                        </View>

                        {/* Progress Bar */}
                        <Text style={styles.sectionTitle}>{t('dashboard.progress')}</Text>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${completionRate}%` }]}>
                                <Text style={styles.progressText}>{completionRate}%</Text>
                            </View>
                        </View>

                        {/* Pie Chart */}
                        <Text style={styles.sectionTitle}>{t('dashboard.analytics')}</Text>
                        <PieChart
                            data={pieData}
                            width={screenWidth - 32}
                            height={220}
                            chartConfig={chartConfig}
                            accessor="count"
                            backgroundColor="transparent"
                            paddingLeft="16"
                            absolute
                        />

                        {/* Bar Chart */}
                        <Text style={styles.sectionTitle}>{t('dashboard.taskCompletionOverTime')}</Text>
                        <BarChart
                            data={barChartData}
                            width={screenWidth - 32}
                            height={260}
                            chartConfig={chartConfig}
                            fromZero
                            withInnerLines={false}
                            showBarTops
                            yAxisLabel=""
                            yAxisSuffix=""
                        />
                    </>
                )}
            </LoadingState>
        </ScrollView>
    );
};

const KPI = ({ label, value }: { label: string; value: string | number }) => (
    <View style={styles.kpiCard}>
        <Text style={styles.kpiLabel}>{label}</Text>
        <Text style={styles.kpiValue}>{value}</Text>
    </View>
);

const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    labelColor: () => '#333',
    barPercentage: 0.6,
    propsForBackgroundLines: {
        strokeWidth: 0,
    },
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 12,
    },
    kpiRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    kpiCard: {
        flex: 1,
        padding: 12,
        backgroundColor: '#F4F6F8',
        margin: 4,
        borderRadius: 8,
        alignItems: 'center',
    },
    kpiLabel: {
        fontSize: 14,
        color: '#555',
    },
    kpiValue: {
        fontSize: 20,
        fontWeight: '600',
    },
    progressBar: {
        height: 24,
        backgroundColor: '#E0E0E0',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
    },
    progressFill: {
        backgroundColor: '#36A2EB',
        height: '100%',
        justifyContent: 'center',
        paddingLeft: 8,
    },
    progressText: {
        color: 'white',
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default DashboardContainer;
