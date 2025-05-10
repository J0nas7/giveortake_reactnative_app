// External
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, Dimensions, StyleSheet, Alert, Button } from 'react-native';
import Pdf from 'react-native-pdf';
import RNBlobUtil from 'react-native-blob-util';
import { useRoute } from '@react-navigation/native';

// Internal
import { TaskMediaFile } from '../Types';
import { useTasksContext } from '../Contexts';
import { env } from '../env';

export const MediaFileView = () => {
    // Hooks
    const route = useRoute();
    const { taskByKeys, readTaskByKeys, setTaskDetail } = useTasksContext();

    // State and Constants
    const { projectKey, taskKey, mediaID } = route.params as {
        projectKey: string;
        taskKey: string;
        mediaID: string;
    };


    const [media, setMedia] = useState<TaskMediaFile | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [fileDownloaded, setFileDownloaded] = useState(false);

    // Methods
    const downloadFile = async () => {
        if (!media) return

        try {
            const fileExtension = media.Media_File_Type === 'pdf' ? 'pdf' :
                media.Media_File_Type.includes('jpeg') ? 'jpeg' :
                    media.Media_File_Type.includes('jpg') ? 'jpg' :
                        media.Media_File_Type.split('/').pop(); // fallback

            const dirs = RNBlobUtil.fs.dirs;
            const filePath = `${dirs.DocumentDir}/${media.Media_ID}.${fileExtension}`;

            const res = await RNBlobUtil.config({
                path: filePath,
                fileCache: true,
            }).fetch('GET', fileUrl);

            await saveMetadata(media);

            Alert.alert("Download complete");
        } catch (err) {
            console.error("Download error:", err);
            Alert.alert("Download failed", "Could not download file.");
        }
    };

    const saveMetadata = async (media: TaskMediaFile) => {
        const metadata = {
            Media_ID: media.Media_ID,
            Media_File_Name: fileName,
            Task_Title: taskByKeys?.Task_Title,
            Project_Key: taskByKeys?.project?.Project_Key,
            Task_Key: taskByKeys?.Task_Key,
            Downloaded_At: new Date().toISOString(),
        };

        const metadataPath = `${RNBlobUtil.fs.dirs.DocumentDir}/${media.Media_ID}.meta.json`;

        await RNBlobUtil.fs.writeFile(metadataPath, JSON.stringify(metadata), 'utf8');
    };

    const checkIfFileExists = async () => {
        if (!media) return false

        const fileExtension = media.Media_File_Type === 'pdf' ? 'pdf' :
                media.Media_File_Type.includes('jpeg') ? 'jpeg' :
                    media.Media_File_Type.includes('jpg') ? 'jpg' :
                        media.Media_File_Type.split('/').pop(); // fallback

        const filePath = `${RNBlobUtil.fs.dirs.DocumentDir}/${mediaID}.${fileExtension}`;
    
        const exists = await RNBlobUtil.fs.exists(filePath);
        return exists; // true or false
    };

    // Effects
    useEffect(() => {
        const fetchTask = async () => {
            if (projectKey && taskKey) {
                await readTaskByKeys(projectKey, taskKey);
            }
        };

        fetchTask();
    }, [projectKey, taskKey]);

    useEffect(() => {
        const fetchMedia = async () => {
            if (!taskByKeys) return

            const mediaFile = taskByKeys.media_files?.find((file) => file.Media_ID === parseInt(mediaID));
            setMedia(mediaFile);
            setLoading(false);
        };

        fetchMedia();
    }, [taskByKeys]);

    useEffect(() => {
        const checkFile = async () => {
            const exists = await checkIfFileExists();
            setFileDownloaded(exists);
        }
        checkFile();
    }, [media])

    // Render
    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!media) {
        return (
            <View style={styles.centered}>
                <Text>Media not found.</Text>
            </View>
        );
    }

    const { Media_File_Path, Media_File_Type } = media;
    const fileUrl = `${env.url.API_URL}/storage/${Media_File_Path}`;
    const fileName = media.Media_File_Name.split('-').slice(1).join('-');

    return (
        <View style={styles.container}>
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20 }}>
                <Text style={{ textAlign: "center", fontSize: 20, marginVertical: 10 }}>{fileName}</Text>
                {fileDownloaded ? (
                    <Text>Downloaded</Text>
                ) : (
                    <Button title="Download" onPress={downloadFile} />
                )}
            </View>
            {Media_File_Type === 'pdf' ? (
                <>
                    <Pdf
                        source={{ uri: fileUrl, cache: true }}
                        style={styles.pdf}
                        onError={(error) => console.log('PDF Error:', error)}
                    />
                </>
            ) : (media.Media_File_Type === "jpeg" || media.Media_File_Type === "jpg") ? (
                <Image source={{ uri: fileUrl }} style={styles.image} resizeMode="contain" />
            ) : (
                <Text>Unsupported file type: {Media_File_Type}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
    },
    image: {
        flex: 1,
        width: '100%',
    },
});
