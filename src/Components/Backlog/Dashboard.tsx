import { LoadingState } from '@/src/Core-UI/LoadingState';
import { BacklogStates } from '@/src/Types';
import { TFunction } from 'i18next';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export type DashboardProps = {
    t: TFunction<[string], undefined>
    renderBacklog: BacklogStates;
    canAccessBacklog: boolean | undefined;
    canManageBacklog: boolean | undefined;
    totalTasks: number
    completedTasks: number
    completionRate: number
    overdueTasks: number
    inProgressTasks: number
    pieData: {
        name: string;
        count: number;
        color: string;
        legendFontColor: string;
        legendFontSize: number;
    }[]
    barChartData: {
        labels: string[];
        datasets: {
            data: number[];
            color: () => string;
        }[];
        legend: string[];
    }
}

export const Dashboard: React.FC<DashboardProps> = ({
    t,
    renderBacklog,
    canAccessBacklog,
    canManageBacklog,
    totalTasks,
    completedTasks,
    completionRate,
    overdueTasks,
    inProgressTasks,
    pieData,
    barChartData
}) => (
    <ScrollView style={styles.container}>
        <Text style={styles.title}>{t('dashboard.title')}</Text>
        <Text style={styles.subtitle}>{renderBacklog && renderBacklog.Backlog_Name}</Text>

        <LoadingState singular="Backlog" renderItem={renderBacklog} permitted={canAccessBacklog}>
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
)

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
