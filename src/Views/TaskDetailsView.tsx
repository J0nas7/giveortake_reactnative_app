// External
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Image, Button, ViewStyle, Clipboard, Alert, Linking } from 'react-native';
import { NavigationProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowUpFromBracket, faLightbulb, faPaperPlane, faPencil, faPlay, faStop, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Picker } from '@react-native-picker/picker';

// Internal
import { useTaskCommentsContext, useTaskMediaFilesContext, useTasksContext, useTaskTimeTrackContext } from '@/src/Contexts';
import { MainStackParamList, Task, TaskComment, TaskMediaFile, TaskTimeTrack, User } from '@/src/Types';
import { CreatedAtToTimeSince, SecondsToTimeDisplay, TimeSpentDisplay } from '../Components/CreatedAtToTimeSince';
import { selectAuthUser, selectAuthUserTaskTimeTrack, useTypedSelector } from '../Redux';
import useMainViewJumbotron from '../Hooks/useMainViewJumbotron';
import { env } from '../env';

export const TaskDetailsView = () => {
    // Hooks
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const route = useRoute();
    const { projectKey, taskKey } = route.params as { projectKey: string; taskKey: string };
    const { taskByKeys, readTaskByKeys, setTaskDetail } = useTasksContext();
    const { handleScroll, handleFocusEffect } = useMainViewJumbotron({
        title: `Task Details`,
        faIcon: undefined,
        visibility: 100,
        rightIcon: faLightbulb,
        rightIconActionRoute: "Project",
        rightIconActionParams: { id: (taskByKeys?.Project_ID ?? "").toString() }
    })

    // State
    const [theTask, setTheTask] = useState<Task | undefined>(undefined);

    // Effects
    useEffect(() => {
        const fetchTask = async () => {
            if (projectKey && taskKey) {
                setTheTask(undefined);
                await readTaskByKeys(projectKey, taskKey);
            }
        };

        fetchTask();
    }, [projectKey, taskKey]);

    useEffect(() => {
        if (taskByKeys) setTheTask(taskByKeys);
    }, [taskByKeys]);

    useFocusEffect(
        useCallback(() => {
            handleFocusEffect()
        }, [])
    )

    // Methods
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
};

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

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
    return <View style={[cardStyles.card, style]}>{children}</View>;
};

const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
});

const TitleArea: React.FC<{ task: Task }> = ({ task }) => {
    const { readTasksByProjectId, readTaskByKeys, saveTaskChanges } = useTasksContext();
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

        await saveTaskChanges({ ...task, Task_Title: title }, task.Project_ID);

        if (task) {
            if (task.Project_ID) readTasksByProjectId(task.Project_ID, true);
            if (task.project?.Project_Key && task.Task_Key)
                readTaskByKeys(task.project.Project_Key, task.Task_Key.toString());
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
}) => {
    return (
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
};

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

const DescriptionArea: React.FC<{ task: Task }> = ({ task }) => {
    const { readTaskByKeys, readTasksByProjectId, saveTaskChanges } = useTasksContext();
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(task.Task_Description || '');

    const handleSave = () => {
        setIsEditing(false);
        saveTaskChanges(
            { ...task, Task_Description: description },
            task.Project_ID
        );

        if (task) {
            if (task.Project_ID) readTasksByProjectId(task.Project_ID, true);
            if (task.project?.Project_Key && task.Task_Key)
                readTaskByKeys(task.project.Project_Key, task.Task_Key.toString());
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
}) => {
    return (
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
};

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

const MediaFilesArea: React.FC<{ task: Task }> = ({ task }) => {
    const [toggleAddFile, setToggleAddFile] = useState(false);
    const { removeTaskMediaFile } = useTaskMediaFilesContext();
    const { readTasksByProjectId, readTaskByKeys } = useTasksContext();

    const handleDelete = async (media: TaskMediaFile) => {
        if (!task.Task_ID || !media.Media_ID) return;

        await removeTaskMediaFile(media.Media_ID, media.Task_ID);

        if (task.Project_ID) await readTasksByProjectId(task.Project_ID, true);
        if (task.Task_Key && task.project?.Project_Key)
            await readTaskByKeys(task.project.Project_Key, task.Task_Key.toString());

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
                                    projectKey: task.project?.Project_Key ?? "",
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

const CommentsArea: React.FC<{ task: Task }> = ({ task }) => {
    const { addTaskComment, saveTaskCommentChanges, removeTaskComment } = useTaskCommentsContext();
    const { readTasksByProjectId, readTaskByKeys } = useTasksContext();
    const authUser = useTypedSelector(selectAuthUser);

    const [createComment, setCreateComment] = useState<string>("");
    const [editComment, setEditComment] = useState<string>("");
    const [isCreateCommentVisible, setIsCreateCommentVisible] = useState<boolean>(false);
    const [isEditCommentVisible, setIsEditCommentVisible] = useState<TaskComment | undefined>(undefined);

    const handleAddComment = async () => {
        if (!authUser || !createComment.trim()) return;

        const newComment: TaskComment = {
            Task_ID: task.Task_ID ?? 0,
            User_ID: authUser.User_ID ?? 0,
            Comment_Text: createComment.trim(),
        };

        await addTaskComment(newComment.Task_ID, newComment);

        setCreateComment("");
        setIsCreateCommentVisible(false);

        if (task.Project_ID) readTasksByProjectId(task.Project_ID, true);
        if (task.project?.Project_Key && task.Task_Key)
            await readTaskByKeys(task.project.Project_Key, task.Task_Key.toString());
    };

    const handleCommentCancel = () => {
        setCreateComment("");
        setIsCreateCommentVisible(false);
    };

    const handleEditComment = async () => {
        if (!authUser || !isEditCommentVisible || !editComment.trim()) return;

        const updatedComment: TaskComment = {
            ...isEditCommentVisible,
            Comment_Text: editComment.trim(),
        };

        await saveTaskCommentChanges(updatedComment, updatedComment.Task_ID);

        setEditComment("");
        setIsEditCommentVisible(undefined);

        if (task.Project_ID) readTasksByProjectId(task.Project_ID, true);
        if (task.project?.Project_Key && task.Task_Key)
            await readTaskByKeys(task.project.Project_Key, task.Task_Key.toString());
    };

    const handleEditCommentCancel = () => {
        setEditComment("");
        setIsEditCommentVisible(undefined);
    };

    const handleDeleteComment = async (comment: TaskComment) => {
        if (!task.Task_ID || !comment.Comment_ID) return;

        await removeTaskComment(comment.Comment_ID, task.Task_ID);

        if (isEditCommentVisible?.Comment_ID === comment.Comment_ID) {
            setEditComment("");
            setIsEditCommentVisible(undefined);
        }

        if (task.Project_ID) await readTasksByProjectId(task.Project_ID, true);
        if (task.project?.Project_Key && task.Task_Key)
            await readTaskByKeys(task.project.Project_Key, task.Task_Key.toString());
    };

    return (
        <CommentsAreaView
            task={task}
            authUser={authUser}
            createComment={createComment}
            setCreateComment={setCreateComment}
            editComment={editComment}
            setEditComment={setEditComment}
            isCreateCommentVisible={isCreateCommentVisible}
            setIsCreateCommentVisible={setIsCreateCommentVisible}
            isEditCommentVisible={isEditCommentVisible}
            setIsEditCommentVisible={setIsEditCommentVisible}
            handleAddComment={handleAddComment}
            handleCommentCancel={handleCommentCancel}
            handleEditComment={handleEditComment}
            handleEditCommentCancel={handleEditCommentCancel}
            handleDeleteComment={handleDeleteComment}
        />
    );
};

interface CommentsAreaViewProps {
    task: Task;
    authUser: User | undefined;
    createComment: string;
    setCreateComment: (text: string) => void;
    editComment: string;
    setEditComment: (text: string) => void;
    isCreateCommentVisible: boolean;
    setIsCreateCommentVisible: (visible: boolean) => void;
    isEditCommentVisible: TaskComment | undefined;
    setIsEditCommentVisible: (comment: TaskComment | undefined) => void;
    handleAddComment: () => Promise<void>;
    handleCommentCancel: () => void;
    handleEditComment: () => Promise<void>;
    handleEditCommentCancel: () => void;
    handleDeleteComment: (comment: TaskComment) => Promise<void>;
}

const CommentsAreaView: React.FC<CommentsAreaViewProps> = ({
    task,
    authUser,
    createComment,
    setCreateComment,
    editComment,
    setEditComment,
    isCreateCommentVisible,
    setIsCreateCommentVisible,
    isEditCommentVisible,
    setIsEditCommentVisible,
    handleAddComment,
    handleCommentCancel,
    handleEditComment,
    handleEditCommentCancel,
    handleDeleteComment,
}) => {
    return (
        <Card style={commentsAreaStyles.commentsSection}>
            <View style={commentsAreaStyles.header}>
                <Text style={commentsAreaStyles.title}>Comments</Text>
            </View>

            {isEditCommentVisible ? (
                <View style={commentsAreaStyles.commentEditor}>
                    <TextInput
                        value={editComment}
                        onChangeText={setEditComment}
                        style={commentsAreaStyles.commentTextarea}
                        placeholder="Edit your comment..."
                        multiline
                    />
                    <View style={commentsAreaStyles.newCommentActions}>
                        <TouchableOpacity style={commentsAreaStyles.sendButton} onPress={handleEditComment}>
                            <FontAwesomeIcon icon={faPaperPlane} size={20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={commentsAreaStyles.cancelButton} onPress={handleEditCommentCancel}>
                            <Text style={commentsAreaStyles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <>
                    {!isCreateCommentVisible ? (
                        <TouchableOpacity
                            style={commentsAreaStyles.commentPlaceholder}
                            onPress={() => setIsCreateCommentVisible(true)}
                        >
                            <Text>Add a new comment...</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={commentsAreaStyles.commentEditor}>
                            <TextInput
                                value={createComment}
                                onChangeText={setCreateComment}
                                style={commentsAreaStyles.commentTextarea}
                                placeholder="Write your comment..."
                                multiline
                            />
                            <View style={commentsAreaStyles.newCommentActions}>
                                <TouchableOpacity style={commentsAreaStyles.sendButton} onPress={handleAddComment}>
                                    <FontAwesomeIcon icon={faPaperPlane} size={20} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity style={commentsAreaStyles.cancelButton} onPress={handleCommentCancel}>
                                    <Text style={commentsAreaStyles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </>
            )}

            {task.comments?.map((comment, index) => (
                <View key={index} style={commentsAreaStyles.commentItem}>
                    <Text style={commentsAreaStyles.comment}>{comment.Comment_Text}</Text>
                    <View style={commentsAreaStyles.commentMeta}>
                        <View>
                            <View>
                                <Text>
                                    Created:{" "}
                                    {comment.Comment_CreatedAt && (
                                        <CreatedAtToTimeSince dateCreatedAt={comment.Comment_CreatedAt} />
                                    )}
                                </Text>
                            </View>
                            <View>
                                <Text>By: {comment.user?.User_FirstName} {comment.user?.User_Surname}</Text>
                            </View>
                        </View>
                        <View style={commentsAreaStyles.commentActions}>
                            <TouchableOpacity
                                style={commentsAreaStyles.mediaActions}
                                onPress={() => {
                                    setEditComment(comment.Comment_Text);
                                    setIsEditCommentVisible(comment);
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={faPencil}
                                    style={commentsAreaStyles.icon}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={commentsAreaStyles.mediaActions} onPress={() => handleDeleteComment(comment)}>
                                <FontAwesomeIcon icon={faTrashCan} style={commentsAreaStyles.icon} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            ))}
        </Card>
    );
};

const commentsAreaStyles = StyleSheet.create({
    commentsSection: {
        marginBottom: 16,
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
    commentEditor: {
        marginBottom: 16,
    },
    commentTextarea: {
        height: 100,
        padding: 8,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 8,
        textAlignVertical: 'top',
    },
    newCommentActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sendButton: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    cancelText: {
        color: '#999',
    },
    commentPlaceholder: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        alignItems: 'center',
    },
    commentItem: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    comment: {
        fontSize: 16,
        marginBottom: 8,
    },
    commentMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    commentActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 10,
        color: '#007bff',
    },
    mediaActions: {
        marginLeft: 10,
    },
});

const CtaButtons: React.FC<{ task: Task }> = ({ task }) => {
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const { removeTask, readTasksByProjectId } = useTasksContext();

    const archiveTask = async (task: Task) => {
        if (!task.Task_ID) return;

        const removed = await removeTask(task.Task_ID, task.Project_ID);
        if (!removed) return;

        await readTasksByProjectId(task.Project_ID, true);

        navigation.navigate('Project', { id: (task.Project_ID).toString() });
    };

    const shareTask = async () => {
        try {
            const url = `https://yourapp.com/task/${task.Task_ID}`; // Update URL logic as necessary
            await Clipboard.setString(url); // Using Clipboard API from React Native
            Alert.alert('Link to task was copied to your clipboard');
        } catch (err) {
            Alert.alert('Failed to copy link to task');
        }
    };

    return (
        <CtaButtonsView
            task={task}
            archiveTask={archiveTask}
            shareTask={shareTask}
            navigation={navigation}
        />
    );
};

interface CtaButtonsViewProps {
    task: Task;
    archiveTask: (task: Task) => Promise<void>;
    shareTask: () => Promise<void>;
    navigation: NavigationProp<MainStackParamList>
}

const CtaButtonsView: React.FC<CtaButtonsViewProps> = ({
    task,
    archiveTask,
    shareTask,
    navigation
}) => {
    return (
        <View style={ctaButtonsStyles.ctaButtons}>
            <TouchableOpacity
                style={ctaButtonsStyles.ctaButton}
                onPress={() => archiveTask(task)}
            >
                <FontAwesomeIcon icon={faTrashCan} size={20} />
                <Text style={ctaButtonsStyles.buttonText}>Archive</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={ctaButtonsStyles.ctaButton}
                onPress={() => shareTask()}
            >
                <FontAwesomeIcon icon={faArrowUpFromBracket} size={20} />
                <Text style={ctaButtonsStyles.buttonText}>Share</Text>
            </TouchableOpacity>
        </View>
    );
};

const ctaButtonsStyles = StyleSheet.create({
    ctaButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 8,
        margin: 5,
    },
    buttonText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 16,
    },
});

const TaskInfoArea: React.FC<{ task: Task }> = ({ task }) => {
    const route = useRoute<any>();
    const { projectId, taskId } = route.params;

    const { readTasksByProjectId, readTaskByKeys, taskDetail, setTaskDetail, saveTaskChanges } = useTasksContext();
    const { taskTimeTracksById, readTaskTimeTracksByTaskId, handleTaskTimeTrack } = useTaskTimeTrackContext();

    const [taskTimeSpent, setTaskTimeSpent] = useState<number>(0);

    useEffect(() => {
        if (task.Task_ID) {
            readTaskTimeTracksByTaskId(task.Task_ID);
        }
    }, [task]);

    useEffect(() => {
        if (Array.isArray(taskTimeTracksById)) {
            const totalTime = taskTimeTracksById.reduce((sum, track) => sum + (track.Time_Tracking_Duration || 0), 0);
            setTaskTimeSpent(totalTime);
        }
    }, [taskTimeTracksById]);

    // Handle status change
    const handleStatusChange = (newStatus: Task["Task_Status"]) => {
        handleTaskChanges("Task_Status", newStatus);
    };

    const handleAssigneeChange = (newAssigneeID: Task["Assigned_User_ID"]) => {
        if (newAssigneeID) handleTaskChanges("Assigned_User_ID", newAssigneeID.toString());
    }

    const handleTaskChanges = async (field: keyof Task, value: string) => {
        await saveTaskChanges({ ...task, [field]: value }, task.Project_ID);

        if (task.Project_ID) readTasksByProjectId(task.Project_ID, true);
        if (task.Task_Key && task.project?.Project_Key)
            await readTaskByKeys(task.project.Project_Key, task.Task_Key.toString());

        if (taskDetail) {
            setTaskDetail({ ...taskDetail, [field]: value });
        }
    };

    return (
        <TaskInfoView
            task={task}
            taskDetail={taskDetail}
            taskTimeSpent={taskTimeSpent}
            taskTimeTracksById={taskTimeTracksById}
            setTaskDetail={setTaskDetail}
            saveTaskChanges={saveTaskChanges}
            handleStatusChange={handleStatusChange}
            handleAssigneeChange={handleAssigneeChange}
            handleTaskChanges={handleTaskChanges}
            handleTaskTimeTrack={handleTaskTimeTrack}
        />
    );
};

interface TaskInfoViewProps {
    task: Task
    taskDetail: Task | undefined
    taskTimeSpent: number
    taskTimeTracksById: TaskTimeTrack[]
    setTaskDetail: React.Dispatch<React.SetStateAction<Task | undefined>>
    saveTaskChanges: (taskChanges: Task, parentId: number) => void
    handleStatusChange: (newStatus: Task["Task_Status"]) => void
    handleAssigneeChange: (newAssigneeID: Task["Assigned_User_ID"]) => void
    handleTaskChanges: (field: keyof Task, value: string) => void
    handleTaskTimeTrack: (action: "Play" | "Stop", task: Task) => Promise<Task | undefined>
}

const TaskInfoView: React.FC<TaskInfoViewProps> = ({
    task,
    taskDetail,
    taskTimeSpent,
    taskTimeTracksById,
    setTaskDetail,
    saveTaskChanges,
    handleTaskChanges,
    handleTaskTimeTrack,
}) => {
    return (
        <Card style={taskDetailsAreaStyles.container}>
            <Text style={taskDetailsAreaStyles.heading}>Task Details</Text>

            <Text style={taskDetailsAreaStyles.label}>Status:</Text>
            <Text>{task.Task_Status}</Text>
            {/* <Picker
                selectedValue={task.Task_Status}
                onValueChange={(itemValue) => handleTaskChanges("Task_Status", itemValue)}
            >
                <Picker.Item label="To Do" value="To Do" />
                <Picker.Item label="In Progress" value="In Progress" />
                <Picker.Item label="Waiting for Review" value="Waiting for Review" />
                <Picker.Item label="Done" value="Done" />
            </Picker> */}

            <Text style={taskDetailsAreaStyles.label}>Assigned To:</Text>
            {(() => {
                const assignedUser = task.project?.team?.user_seats?.find(userSeat => userSeat.user?.User_ID === task.Assigned_User_ID);
                if (assignedUser) {
                    return (
                        <Text>{`${assignedUser.user?.User_FirstName} ${assignedUser.user?.User_Surname}`}</Text>
                    );
                } else {
                    return <Text>Unassigned</Text>;
                }
            })()}
            {/* <Picker
                selectedValue={task.Assigned_User_ID || ""}
                onValueChange={(itemValue) => handleTaskChanges("Assigned_User_ID", itemValue.toString())}
            >
                <Picker.Item label="Unassigned" value="" />
                {task.project?.team?.user_seats?.map(userSeat => (
                    <Picker.Item
                        key={userSeat.user?.User_ID}
                        label={`${userSeat.user?.User_FirstName} ${userSeat.user?.User_Surname}`}
                        value={userSeat.user?.User_ID}
                    />
                ))}
            </Picker> */}

            <Text><Text style={taskDetailsAreaStyles.label}>Team:</Text> {task.project?.team?.Team_Name}</Text>
            <Text><Text style={taskDetailsAreaStyles.label}>Created At:</Text> {task.Task_CreatedAt && <CreatedAtToTimeSince dateCreatedAt={task.Task_CreatedAt} />}</Text>
            <Text><Text style={taskDetailsAreaStyles.label}>Due Date:</Text> {task.Task_Due_Date ? new Date(task.Task_Due_Date).toLocaleString() : "N/A"}</Text>

            <Text style={taskDetailsAreaStyles.label}>Time Tracking:</Text>
            <TimeSpentDisplayView task={task} handleTaskTimeTrack={handleTaskTimeTrack} />

            <Text style={taskDetailsAreaStyles.label}>Time Spent:</Text>
            <Text><SecondsToTimeDisplay totalSeconds={taskTimeSpent} /> ({taskTimeTracksById.length} entries)</Text>
        </Card>
    );
};

const taskDetailsAreaStyles = StyleSheet.create({
    container: {
        padding: 16,
    },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    label: {
        fontWeight: '600',
        marginTop: 10,
    },
});

interface TimeSpentDisplayViewProps {
    task: Task
    handleTaskTimeTrack: (action: "Play" | "Stop", task: Task) => Promise<Task | undefined>
}

const TimeSpentDisplayView: React.FC<TimeSpentDisplayViewProps> = ({ task, handleTaskTimeTrack }) => {
    const authUser = useTypedSelector(selectAuthUser);
    const taskTimeTrack = useTypedSelector(selectAuthUserTaskTimeTrack);

    const isTracking = taskTimeTrack && taskTimeTrack.Task_ID === task.Task_ID;

    return (
        <View style={timeSpentDisplayViewStyles.container}>
            {isTracking ? (
                <>
                    <TouchableOpacity style={timeSpentDisplayViewStyles.stopButton} onPress={() => handleTaskTimeTrack("Stop", task)}>
                        <FontAwesomeIcon icon={faStop} color="#fff" />
                    </TouchableOpacity>
                    <Text>
                        <TimeSpentDisplay startTime={taskTimeTrack.Time_Tracking_Start_Time} />
                    </Text>
                </>
            ) : (
                <TouchableOpacity style={timeSpentDisplayViewStyles.playButton} onPress={() => handleTaskTimeTrack("Play", task)}>
                    <FontAwesomeIcon icon={faPlay} color="#fff" />
                </TouchableOpacity>
            )}
        </View>
    );
};

const timeSpentDisplayViewStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginVertical: 8,
    },
    stopButton: {
        backgroundColor: '#ff4d4f',
        padding: 10,
        borderRadius: '100%',
    },
    playButton: {
        backgroundColor: '#52c41a',
        padding: 10,
        borderRadius: '100%',
    },
});
