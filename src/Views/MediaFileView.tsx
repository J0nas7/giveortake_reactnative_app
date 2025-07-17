// External
import { useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import RNBlobUtil from 'react-native-blob-util';

// Internal
import { MediaFile } from '@/src/Components/Task';
import { env } from '@/src/env';
import { useTasksContext } from '../Contexts';
import { TaskMediaFile } from '../Types';

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
    const [fileUrl, setFileUrl] = useState<string>('')
    const [fileName, setFileName] = useState<string>('')

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
            Project_Key: taskByKeys?.backlog?.project?.Project_Key,
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

            if (media) {
                const { Media_File_Path, Media_File_Type } = media;
                setFileUrl(`${env.url.API_URL}/storage/${Media_File_Path}`);
                setFileName(media.Media_File_Name.split('-').slice(1).join('-'));
            }
        }
        checkFile();
    }, [media])

    return (
        <MediaFile
            loading={loading}
            media={media}
            fileDownloaded={fileDownloaded}
            fileUrl={fileUrl}
            fileName={fileName}
            Media_File_Type={media ? media.Media_File_Type : ""}
            downloadFile={downloadFile}
        />
    )
}
