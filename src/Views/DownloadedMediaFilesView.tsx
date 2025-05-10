import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import { Swipeable } from 'react-native-gesture-handler';
import { MainStackParamList } from '../Types';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const [favoriteMedia, setFavoriteMedia] = useState<DisplayFile | undefined>(undefined);

    // Methods
    const deleteFile = async (file: DisplayFile) => {
        try {
            await RNBlobUtil.fs.unlink(file.filePath);
            await RNBlobUtil.fs.unlink(file.metadataPath).catch(() => { }); // ignore if not found

            const favoriteMediaID = await AsyncStorage.getItem('favoriteMediaID');
            if (favoriteMediaID === file.mediaId) {
                setFavoriteMedia(undefined);
                await AsyncStorage.removeItem('favoriteMediaID');
            }
            
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

    const toggleFavorite = async (file: DisplayFile) => {
        await AsyncStorage.setItem(`favoriteMediaID`, file.mediaId)
        loadFiles();
    }

    const renderLeftActions = (file: DisplayFile) => (
        <TouchableOpacity
            onPress={() => toggleFavorite(file)}
            style={[styles.favoriteButton, styles.swipeActionsButton]}
        >
            <Text style={styles.favoriteText}>★ Favorite</Text>
        </TouchableOpacity>
    );

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
            style={[styles.deleteButton, styles.swipeActionsButton]}
        >
            <FontAwesomeIcon icon={faTrashCan} color="white" />
            <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
    );
    
    const loadFiles = async () => {
        try {
            const path = RNBlobUtil.fs.dirs.DocumentDir;
            const fileList = await RNBlobUtil.fs.ls(path);

            const mediaFiles = fileList.filter((file) => !file.endsWith('.meta.json'));
            const displayFiles: DisplayFile[] = [];

            const favoriteMediaID = await AsyncStorage.getItem('favoriteMediaID');

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

                // Create a placeholder for the display file
                const displayFile: DisplayFile = {
                    mediaId,
                    filePath: `${path}/${file}`,
                    metadataPath,
                    displayName,
                    taskTitle: metadata?.Task_Title || 'Unknown Task',
                    taskKey: metadata?.Task_Key,
                    projectKey: metadata?.Project_Key,
                }

                // Add to display files
                displayFiles.push(displayFile);

                // Check if this is the favorite media and set it
                if (favoriteMediaID === mediaId) setFavoriteMedia(displayFile);
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

    // Effects
    useEffect(() => {
        loadFiles();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Downloaded Files</Text>

            {favoriteMedia && (
                <View style={styles.group}>
                    <Text style={styles.groupTitle}>Favorite ★</Text>
                    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Media', {
                        projectKey: favoriteMedia.projectKey ?? "",
                        taskKey: (favoriteMedia.taskKey ?? "").toString(),
                        mediaID: favoriteMedia.mediaId
                    })}>
                        <Text>{favoriteMedia.displayName}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {Object.entries(groupedFiles).map(([taskTitle, files]) => (
                <View key={taskTitle} style={styles.group}>
                    <Text style={styles.groupTitle}>Task: {taskTitle}</Text>
                    {files.map((file) => (
                        <Swipeable
                            key={file.mediaId}
                            renderLeftActions={() => renderLeftActions(file)}
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
    swipeActionsButton: {
        display: 'flex',
        gap: 2,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        marginVertical: 1,
    },
    favoriteButton: {
        backgroundColor: '#FFD700', // gold color
    },
    favoriteText: {
        color: '#000',
        fontWeight: 'bold',
    },
    deleteButton: {
        backgroundColor: 'red',
    },
    deleteText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
