import { useTasksContext } from '@/src/Contexts';
import { Task } from '@/src/Types';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export const TitleArea: React.FC<{ task: Task }> = ({ task }) => {
    const { readTasksByBacklogId, readTaskByKeys, saveTaskChanges } = useTasksContext();
    const inputRef = useRef<TextInput>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(task.Task_Title || '');

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleBlur = async () => {
        setIsEditing(false);

        await saveTaskChanges({ ...task, Task_Title: title }, task.Backlog_ID);

        if (task) {
            if (task.Backlog_ID) readTasksByBacklogId(task.Backlog_ID, true);
            if (task.backlog?.project?.Project_Key && task.Task_Key)
                readTaskByKeys(task.backlog.project.Project_Key, task.Task_Key.toString());
        }
    };

    useEffect(() => {
        setTitle(task.Task_Title);
    }, [task]);

    return (
        <TitleAreaView
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            title={title}
            setTitle={setTitle}
            inputRef={inputRef}
            handleBlur={handleBlur}
        />
    );
};

interface TitleAreaViewProps {
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    title: string;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    inputRef: React.RefObject<TextInput | null>;
    handleBlur: () => Promise<void>;
}

const TitleAreaView: React.FC<TitleAreaViewProps> = ({
    isEditing,
    setIsEditing,
    title,
    setTitle,
    inputRef,
    handleBlur,
}) => (
    <View style={titleAreaStyles.container}>
        {!isEditing ? (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={titleAreaStyles.titleTouchable}>
                <Text style={titleAreaStyles.titleText}>
                    {title || 'Click to add title...'}
                </Text>
            </TouchableOpacity>
        ) : (
            <TextInput
                ref={inputRef}
                style={titleAreaStyles.input}
                value={title}
                onChangeText={setTitle}
                onBlur={handleBlur}
                placeholder="Enter task title..."
            />
        )}
    </View>
);

const titleAreaStyles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    titleTouchable: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },
    titleText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    input: {
        fontSize: 20,
        fontWeight: 'bold',
        padding: 12,
        borderWidth: 2,
        borderColor: '#3232fa',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
});
