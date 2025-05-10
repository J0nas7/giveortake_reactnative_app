import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import { Swipeable } from 'react-native-gesture-handler';
import { MainStackParamList } from '../Types';

type DisplayFile = {
    mediaId: string;
    filePath: string;
    metadataPath: string;
    displayName: string;
    taskTitle?: string;
    taskKey?: string;
    projectKey?: string;
};

export const DownloadedMediaFilesView = () => {
    // Hooks
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();

    // State
    const [groupedFiles, setGroupedFiles] = useState<Record<string, DisplayFile[]>>({});

    // Methods
    const deleteFile = async (file: DisplayFile) => {
        try {
            await RNBlobUtil.fs.unlink(file.filePath);
            await RNBlobUtil.fs.unlink(file.metadataPath).catch(() => { }); // ignore if not found
            Alert.alert('Deleted', `${file.displayName} was deleted.`);
            // Refresh
            setGroupedFiles((prev) => {
                const updated = { ...prev };
                const group = file.taskTitle || 'Unknown Task';
                updated[group] = updated[group].filter((f) => f.filePath !== file.filePath);
                if (updated[group].length === 0) delete updated[group];
                return updated;
            });
        } catch (err) {
            console.error("Failed to delete file", err);
            Alert.alert("Error", "Could not delete the file.");
        }
    };

    const renderRightActions = (file: DisplayFile) => (
        <TouchableOpacity
            onPress={() =>
                Alert.alert(
                    'Delete',
                    `Are you sure you want to delete ${file.displayName}?`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => deleteFile(file) },
                    ]
                )
            }
            style={styles.deleteButton}
        >
            <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
    );

    // Effects
    useEffect(() => {
        const loadFiles = async () => {
            try {
                const path = RNBlobUtil.fs.dirs.DocumentDir;
                const fileList = await RNBlobUtil.fs.ls(path);

                const mediaFiles = fileList.filter((file) => !file.endsWith('.meta.json'));
                const displayFiles: DisplayFile[] = [];

                for (const file of mediaFiles) {
                    const mediaId = file.split('.')[0];
                    const metadataPath = `${path}/${mediaId}.meta.json`;

                    let metadata = null;
                    try {
                        const content = await RNBlobUtil.fs.readFile(metadataPath, 'utf8');
                        metadata = JSON.parse(content);
                    } catch (err) {
                        // Metadata missing or invalid
                    }

                    const displayName = metadata
                        ? `${metadata.Media_File_Name}`
                        : file;

                    displayFiles.push({
                        mediaId,
                        filePath: `${path}/${file}`,
                        metadataPath,
                        displayName,
                        taskTitle: metadata?.Task_Title || 'Unknown Task',
                        taskKey: metadata?.Task_Key,
                        projectKey: metadata?.Project_Key,
                    });
                }

                // Group by Task_Title
                const grouped: Record<string, DisplayFile[]> = {};
                for (const file of displayFiles) {
                    const group = file.taskTitle || 'Unknown Task';
                    if (!grouped[group]) grouped[group] = [];
                    grouped[group].push(file);
                }

                setGroupedFiles(grouped);
            } catch (err) {
                console.error('Failed to read directory', err);
                Alert.alert('Error', 'Could not load downloaded files.');
            }
        };

        loadFiles();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Downloaded Files</Text>
            {Object.entries(groupedFiles).map(([taskTitle, files]) => (
                <View key={taskTitle} style={styles.group}>
                    <Text style={styles.groupTitle}>Task: {taskTitle}</Text>
                    {files.map((file) => (
                        <Swipeable
                            key={file.mediaId}
                            renderRightActions={() => renderRightActions(file)}
                        >
                            <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Media', {
                                projectKey: file.projectKey ?? "",
                                taskKey: (file.taskKey ?? "").toString(),
                                mediaID: file.mediaId
                            })}>
                                <Text>{file.displayName}</Text>
                            </TouchableOpacity>
                        </Swipeable>
                    ))}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    group: { marginBottom: 20 },
    groupTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
    item: { padding: 15, backgroundColor: '#f9f9f9', borderBottomWidth: 1, borderColor: '#ddd' },
    deleteButton: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        marginVertical: 1,
    },
    deleteText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
