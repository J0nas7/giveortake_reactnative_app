import { TimeLatestLogs, TimeSpentPerTask, TimeSummary, TimeTracksPeriodSum } from '@/src/Components/Project';
import { Project, TaskTimeTrack } from '@/src/Types';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export type TimeTracksProps = {
    selectedTaskIds: string[]
    renderProject: Project | undefined
    renderTimeTracks: TaskTimeTrack[] | undefined
    startDate: string
    endDate: string
    sortedByLatest: TaskTimeTrack[]
    sortedByDuration: TaskTimeTrack[]
}

export interface TimeTracksSubComponentsProps {
    timeTracks: TaskTimeTrack[] | undefined;
    startDate?: string
    endDate?: string
}

export const TimeTracks: React.FC<TimeTracksProps> = ({
    selectedTaskIds,
    renderProject,
    renderTimeTracks,
    startDate,
    endDate,
    sortedByLatest,
    sortedByDuration
}) => (
    <ScrollView style={styles.timeTracksContainer}>
        <View style={styles.section}>
            <Text>selectedTaskIds length {selectedTaskIds.length}</Text>
            <Text>backlogs length {renderProject?.backlogs?.length}</Text>
            <TimeSummary
                timeTracks={renderTimeTracks}
                startDate={startDate}
                endDate={endDate}
            />
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
                <TimeLatestLogs sortedByLatest={sortedByLatest} />
            </View>
        </View>
    </ScrollView>
);

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
