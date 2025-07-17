import {
    CommentsArea,
    CtaButtons,
    DescriptionArea,
    MediaFilesArea,
    TaskInfoArea,
    TitleArea
} from '@/src/Components/Task/TaskDetails';
import { Task } from '@/src/Types';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export type TaskDetailsProps = {
    theTask: Task | undefined
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({
    theTask
}) => {
    if (!theTask) {
        return (
            <View style={styles.pageContent}>
                <Text>Task not found</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.pageContent}>
            <View style={styles.wrapper}>
                <View style={styles.content}>
                    <TitleArea task={theTask} />
                    <DescriptionArea task={theTask} />
                    <MediaFilesArea task={theTask} />
                    <CommentsArea task={theTask} />
                    <CtaButtons task={theTask} />
                    <TaskInfoArea task={theTask} />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    pageContent: {
        padding: 16,
        backgroundColor: '#fff',
        flexGrow: 1,
    },
    wrapper: {
        flex: 1,
        gap: 16,
    },
    link: {
        color: '#007bff',
        fontSize: 16,
    },
    content: {
        flexDirection: 'column',
        gap: 16,
        flex: 1,
    },
});
