// External
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Internal
import { CreatedAtToTimeSince } from '@/src/Components/CreatedAtToTimeSince';
import { useTaskMediaFilesContext, useTasksContext } from '@/src/Contexts';
import { env } from '@/src/env';
import { MainStackParamList, Task, TaskMediaFile } from '@/src/Types';

export const MediaFilesArea: React.FC<{ task: Task }> = ({ task }) => {
    const [toggleAddFile, setToggleAddFile] = useState(false);
    const { removeTaskMediaFile } = useTaskMediaFilesContext();
    const { readTasksByBacklogId, readTaskByKeys } = useTasksContext();

    const handleDelete = async (media: TaskMediaFile) => {
        if (!task.Task_ID || !media.Media_ID) return;

        await removeTaskMediaFile(media.Media_ID, media.Task_ID, undefined);

        if (task.Backlog_ID) await readTasksByBacklogId(task.Backlog_ID, true);
        if (task.Task_Key && task.backlog?.project?.Project_Key)
            await readTaskByKeys(task.backlog.project.Project_Key, task.Task_Key.toString());

        setToggleAddFile(false);
    };

    return (
        <View>
            {!toggleAddFile ? (
                <MediaFilesAreaView
                    task={task}
                    setToggleAddFile={setToggleAddFile}
                    handleDelete={handleDelete}
                />
            ) : (
                <></>
                // <AddTaskMediaFile task={task} setToggleAddFile={setToggleAddFile} />
            )}
        </View>
    );
};

interface MediaFilesAreaViewProps {
    task: Task;
    setToggleAddFile: React.Dispatch<React.SetStateAction<boolean>>;
    handleDelete: (media: TaskMediaFile) => void;
}

const MediaFilesAreaView: React.FC<MediaFilesAreaViewProps> = ({ task, setToggleAddFile, handleDelete }) => {
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();

    return (
        <View style={mediaFilesAreaStyles.container}>
            <View style={mediaFilesAreaStyles.header}>
                <Text style={mediaFilesAreaStyles.title}>Media Files</Text>
                <TouchableOpacity onPress={() => setToggleAddFile(true)}>
                    <Text style={mediaFilesAreaStyles.addFileLink}>Add file</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={mediaFilesAreaStyles.mediaList}>
                {task.media_files?.map((media, index) => {
                    const fileName = media.Media_File_Name.split('-').slice(1).join('-');

                    return (
                        <View key={index} style={mediaFilesAreaStyles.mediaItem}>
                            <Text style={mediaFilesAreaStyles.fileName}>{fileName}</Text>

                            <TouchableOpacity
                                // onPress={() => Linking.openURL(`${env.url.API_URL}/storage/${media.Media_File_Path}`)}
                                onPress={() => navigation.navigate('Media', {
                                    projectKey: task.backlog?.project?.Project_Key ?? "",
                                    taskKey: (task.Task_Key ?? "").toString(),
                                    mediaID: (media.Media_ID ?? "").toString()
                                })}
                            >
                                {(media.Media_File_Type === "jpeg" || media.Media_File_Type === "jpg") ? (
                                    <Image
                                        source={{ uri: `${env.url.API_URL}/storage/${media.Media_File_Path}` }}
                                        style={mediaFilesAreaStyles.mediaImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={mediaFilesAreaStyles.pdfBox}>
                                        <Text style={mediaFilesAreaStyles.pdfLabel}>PDF</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <View style={mediaFilesAreaStyles.meta}>
                                <View>
                                    <Text style={mediaFilesAreaStyles.metaText}>
                                        Created:{' '}
                                        {media.Media_CreatedAt && (
                                            <CreatedAtToTimeSince dateCreatedAt={media.Media_CreatedAt} />
                                        )}
                                    </Text>
                                    <Text style={mediaFilesAreaStyles.metaText}>
                                        By: {media.user?.User_FirstName} {media.user?.User_Surname}
                                    </Text>
                                </View>

                                <TouchableOpacity onPress={() => handleDelete(media)}>
                                    <FontAwesomeIcon icon={faTrashCan} size={18} color="#888" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const mediaFilesAreaStyles = StyleSheet.create({
    container: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    addFileLink: {
        color: '#007bff',
        fontSize: 16,
    },
    mediaList: {
        gap: 16,
    },
    mediaItem: {
        borderRadius: 8,
        backgroundColor: '#f8f8f8',
        padding: 12,
    },
    fileName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
    },
    mediaImage: {
        width: '100%',
        height: 180,
        borderRadius: 6,
        marginBottom: 8,
        backgroundColor: '#ddd',
    },
    pdfBox: {
        width: '100%',
        height: 180,
        borderRadius: 6,
        backgroundColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pdfLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    meta: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 13,
        color: '#555',
    },
});
