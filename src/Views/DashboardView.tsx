import { Dashboard, DashboardProps } from '@/src/Components/Backlog';
import { useBacklogsContext, useTasksContext } from '@/src/Contexts';
import useRoleAccess from '@/src/Hooks/useRoleAccess';
import { Task } from '@/src/Types';
import { useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const DashboardView = () => {
    // Hooks
    const route = useRoute();
    const { id: backlogId } = route.params as { id: string };  // Get id as backlogId from route params

    const { t } = useTranslation(['dashboard']);
    const { tasksById, readTasksByBacklogId } = useTasksContext();
    const { backlogById: renderBacklog, readBacklogById } = useBacklogsContext();

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

    const barChartData = { // TODO Insert Real Data
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

    const dashboardProps: DashboardProps = {
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
    }

    return <Dashboard {...dashboardProps} />
};
