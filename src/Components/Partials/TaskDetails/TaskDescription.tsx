import { useTasksContext } from '@/src/Contexts';
import { Task } from '@/src/Types';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export const DescriptionArea: React.FC<{ task: Task }> = ({ task }) => {
    const { readTaskByKeys, readTasksByBacklogId, saveTaskChanges } = useTasksContext();
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(task.Task_Description || '');

    const handleSave = () => {
        setIsEditing(false);
        saveTaskChanges(
            { ...task, Task_Description: description },
            task.Backlog_ID
        );

        if (task) {
            if (task.Backlog_ID) readTasksByBacklogId(task.Backlog_ID, true);
            if (task.backlog?.project?.Project_Key && task.Task_Key)
                readTaskByKeys(task.backlog.project.Project_Key, task.Task_Key.toString());
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setDescription(task.Task_Description || '');
    };

    return (
        <DescriptionAreaView
            task={task}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            description={description}
            setDescription={setDescription}
            handleSave={handleSave}
            handleCancel={handleCancel}
        />
    );
};

interface DescriptionAreaViewProps {
    task: any;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    description: string;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    handleSave: () => void;
    handleCancel: () => void;
}

const DescriptionAreaView: React.FC<DescriptionAreaViewProps> = ({
    isEditing,
    setIsEditing,
    description,
    setDescription,
    handleSave,
    handleCancel,
}) => (
    <View style={descriptionAreaStyles.container}>
        <Text style={descriptionAreaStyles.header}>Task Description</Text>

        {!isEditing ? (
            <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={descriptionAreaStyles.descriptionPlaceholder}
            >
                <Text style={descriptionAreaStyles.descriptionText}>
                    {description?.trim() || 'Click to add a description...'}
                </Text>
            </TouchableOpacity>
        ) : (
            <View style={descriptionAreaStyles.editorContainer}>
                <TextInput
                    style={descriptionAreaStyles.textInput}
                    multiline
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Write a description..."
                    autoFocus
                />
                <View style={descriptionAreaStyles.actions}>
                    <TouchableOpacity onPress={handleSave} style={descriptionAreaStyles.sendButton}>
                        <FontAwesomeIcon icon={faPaperPlane} size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCancel} style={descriptionAreaStyles.cancelButton}>
                        <Text style={descriptionAreaStyles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )}
    </View>
);

const descriptionAreaStyles = StyleSheet.create({
    container: {
        padding: 16,
    },
    header: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    descriptionPlaceholder: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    descriptionText: {
        fontSize: 16,
        color: '#333',
    },
    editorContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
    },
    textInput: {
        minHeight: 120,
        fontSize: 16,
        textAlignVertical: 'top',
    },
    actions: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 12,
    },
    sendButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
        marginRight: 10,
    },
    cancelButton: {
        padding: 10,
        borderRadius: 6,
        borderColor: '#999',
        borderWidth: 1,
        backgroundColor: '#fff',
    },
    cancelText: {
        color: '#333',
    },
});
