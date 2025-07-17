import { DisplayFile, DownloadOverview, downloadOverviewStyles, OverviewProps } from '@/src/Components/Misc/DownloadOverview';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity } from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import { MainStackParamList } from '../Types';

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
            style={[downloadOverviewStyles.favoriteButton, downloadOverviewStyles.swipeActionsButton]}
        >
            <Text style={downloadOverviewStyles.favoriteText}>★ Favorite</Text>
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
            style={[downloadOverviewStyles.deleteButton, downloadOverviewStyles.swipeActionsButton]}
        >
            <FontAwesomeIcon icon={faTrashCan} color="white" />
            <Text style={downloadOverviewStyles.deleteText}>Delete</Text>
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

    const overviewProps: OverviewProps = {
        favoriteMedia,
        navigation,
        groupedFiles,
        renderLeftActions,
        renderRightActions
    }

    return <DownloadOverview {...overviewProps} />
};
