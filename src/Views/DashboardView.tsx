// External
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native"
import { useFocusEffect, useRoute } from "@react-navigation/native"
import { PieChart, BarChart } from "react-native-chart-kit"
import { useTranslation } from "react-i18next"

// Internal
import { useProjectsContext, useTasksContext } from "@/src/Contexts"
import { Project, Task } from "@/src/Types"
import useMainViewJumbotron from "../Hooks/useMainViewJumbotron"
import { faGauge, faLightbulb } from "@fortawesome/free-solid-svg-icons"

const screenWidth = Dimensions.get("window").width

const DashboardView = () => {
    // Hooks
    const route = useRoute()
    const { projectId } = route.params as { projectId: string }
    const { t } = useTranslation(["dashboard"])
    const { tasksById, readTasksByProjectId } = useTasksContext()
    const { projectById, readProjectById } = useProjectsContext()
    const { handleScroll, handleFocusEffect } = useMainViewJumbotron({
        title: `Dashboard`,
        faIcon: faGauge,
        visibility: 100,
        rightIcon: faLightbulb,
        rightIconActionRoute: "Project",
        rightIconActionParams: { id: ((projectById && projectById?.Project_ID) ?? "").toString() },
    })

    // State
    const [renderProject, setRenderProject] = useState<Project | undefined>()
    const [renderTasks, setRenderTasks] = useState<Task[] | undefined>()

    // Effects
    useEffect(() => {
        readTasksByProjectId(parseInt(projectId))
        readProjectById(parseInt(projectId))
    }, [projectId])

    useEffect(() => {
        if (projectById) setRenderProject(projectById)
    }, [projectById])

    useEffect(() => {
        if (tasksById.length && !renderTasks) {
            setRenderTasks(tasksById)
        }
    }, [tasksById])

    useFocusEffect(
        useCallback(() => {
            handleFocusEffect()
        }, [])
    )

    // Dashboard-related calculations
    const safeTasks = Array.isArray(renderTasks) ? renderTasks : []

    const taskStatuses = useMemo(() => {
        return safeTasks.reduce((acc, task) => {
            if (!acc[task.Task_Status]) acc[task.Task_Status] = []
            acc[task.Task_Status].push(task)
            return acc
        }, {} as Record<Task["Task_Status"], Task[]>)
    }, [safeTasks])

    const totalTasks = safeTasks.length
    const completedTasks = taskStatuses["Done"]?.length || 0
    const inProgressTasks = taskStatuses["In Progress"]?.length || 0
    const reviewTasks = taskStatuses["Waiting for Review"]?.length || 0
    const todoTasks = taskStatuses["To Do"]?.length || 0

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    const overdueTasks = useMemo(() => {
        const today = new Date().toISOString().split("T")[0]
        return safeTasks.filter(task =>
            task.Task_Due_Date &&
            typeof task.Task_Due_Date === "string" &&
            task.Task_Due_Date < today &&
            task.Task_Status !== "Done"
        ).length
    }, [safeTasks])

    const chartData = [
        {
            name: t("dashboard.statusLabels.toDo"),
            population: todoTasks,
            color: "#FF6384",
            legendFontColor: "#7F7F7F",
            legendFontSize: 14
        },
        {
            name: t("dashboard.statusLabels.inProgress"),
            population: inProgressTasks,
            color: "#36A2EB",
            legendFontColor: "#7F7F7F",
            legendFontSize: 14
        },
        {
            name: t("dashboard.statusLabels.waitingForReview"),
            population: reviewTasks,
            color: "#FFCE56",
            legendFontColor: "#7F7F7F",
            legendFontSize: 14
        },
        {
            name: t("dashboard.statusLabels.done"),
            population: completedTasks,
            color: "#4BC0C0",
            legendFontColor: "#7F7F7F",
            legendFontSize: 14
        }
    ]

    const barChartData = {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [
            {
                data: [12, 19, 3, 5],
                color: () => "#36A2EB",
                strokeWidth: 2
            },
            {
                data: [7, 11, 5, 8],
                color: () => "#FFCE56",
                strokeWidth: 2
            }
        ],
        legend: [t("dashboard.completedTasks"), t("dashboard.pendingTasks")]
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{renderProject?.Project_Name}</Text>

            <View style={styles.kpiContainer}>
                <KPI title={t("dashboard.totalTasks")} value={totalTasks} />
                <KPI title={t("dashboard.completedTasks")} value={`${completedTasks} (${completionRate}%)`} />
                <KPI title={t("dashboard.overdueTasks")} value={overdueTasks} />
                <KPI title={t("dashboard.tasksInProgress")} value={inProgressTasks} />
            </View>

            <Text style={styles.sectionTitle}>{t("dashboard.progress")}</Text>
            <ProgressBar completed={completionRate} />

            <Text style={styles.sectionTitle}>{t("dashboard.analytics")}</Text>
            <PieChart
                data={chartData}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
            />

            <Text style={styles.sectionTitle}>{t("dashboard.taskCompletionOverTime")}</Text>
            <BarChart
                data={barChartData}
                width={screenWidth - 32}
                height={250}
                chartConfig={chartConfig}
                fromZero
                showBarTops
                withInnerLines
                yAxisLabel=""
                yAxisSuffix=""
                style={styles.chart}
            />
        </ScrollView>
    )
}

const KPI = ({ title, value }: { title: string; value: string | number }) => (
    <View style={styles.kpiBox}>
        <Text style={styles.kpiTitle}>{title}</Text>
        <Text style={styles.kpiValue}>{value}</Text>
    </View>
)

const ProgressBar = ({ completed }: { completed: number }) => (
    <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${completed}%` }]}>
            <Text style={styles.progressText}>{completed}%</Text>
        </View>
    </View>
)

const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
    labelColor: () => "#444",
    style: {
        borderRadius: 16
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#F9FAFB"
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 16
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 24,
        marginBottom: 12
    },
    kpiContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between"
    },
    kpiBox: {
        width: "48%",
        backgroundColor: "#fff",
        padding: 12,
        marginVertical: 6,
        borderRadius: 8,
        elevation: 1
    },
    kpiTitle: {
        fontSize: 14,
        fontWeight: "500",
        color: "#555"
    },
    kpiValue: {
        fontSize: 18,
        fontWeight: "700",
        marginTop: 4
    },
    progressBarContainer: {
        height: 24,
        width: "100%",
        backgroundColor: "#EEE",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 16
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#36A2EB",
        justifyContent: "center",
        alignItems: "center"
    },
    progressText: {
        color: "#FFF",
        fontWeight: "bold"
    },
    chart: {
        borderRadius: 12,
        marginVertical: 8
    }
})

export default DashboardView
