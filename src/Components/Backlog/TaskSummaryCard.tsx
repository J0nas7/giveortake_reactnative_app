import { Backlog, BacklogStates, Task } from '@/src/Types';
import { Text, View } from 'react-native';

export const TaskSummaryCard: React.FC<{
    localBacklog: BacklogStates
}> = ({
    localBacklog
}) => {
        const calculateTaskStats = (backlog: Backlog) => {
            if (!backlog.tasks || backlog.tasks.length === 0) return null;

            const total = backlog.tasks.length;
            const assigneeCount = backlog.tasks.reduce((acc: Record<string | number, number>, task: Task) => {
                const key = task.Assigned_User_ID || "Unassigned";
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {} as Record<string | number, number>);

            return { total, assigneeCount };
        };

        const stats = localBacklog ? calculateTaskStats(localBacklog) : null;

        if (!stats) return null

        return (
            <View style={{ marginTop: 20 }} >
                <Text style={{ fontSize: 18, marginBottom: 10 }}>Task Summary</Text>
                <Text>Total Tasks: {stats.total}</Text>
                <View style={{ marginTop: 10 }}>
                    {Object.entries(stats.assigneeCount).map(([assignee, count]) => (
                        <Text key={assignee}>
                            {assignee === 'Unassigned' ? 'Unassigned' : `User #${assignee}`}:
                            {((count / stats.total) * 100).toFixed(1)}%
                        </Text>
                    ))}
                </View>
            </View >
        )
    };
