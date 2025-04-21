// External
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Image, Button, ViewStyle, Clipboard, Alert } from 'react-native';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowUpFromBracket, faPaperPlane, faPencil, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';

// Internal
import { useTaskCommentsContext, useTaskMediaFilesContext, useTasksContext } from '@/src/Contexts';
import { MainStackParamList, Task, TaskComment, TaskMediaFile, User } from '@/src/Types';
import { CreatedAtToTimeSince } from '../Components/CreatedAtToTimeSince';
import { selectAuthUser, useTypedSelector } from '../Redux';

export const TaskDetailsView = () => {
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const route = useRoute();
    const { projectKey, taskKey } = route.params as { projectKey: string; taskKey: string };
    const { taskByKeys, readTaskByKeys, setTaskDetail } = useTasksContext();

    const [theTask, setTheTask] = useState<Task | undefined>(undefined);

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

    const handleGoBack = () => {
        setTaskDetail(undefined);
        navigation.goBack();
    };

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
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.navigate("Project", { id: (theTask.project?.Project_ID ?? "").toString() })}>
                        <Text style={{ color: "#007AFF", marginBottom: 10 }}>&laquo; Go to Project</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <View style={styles.leftPanel}>
                        <TitleArea task={theTask} />
                        <DescriptionArea task={theTask} />
                        <MediaFilesArea task={theTask} />
                        <CommentsArea task={theTask} />
                    </View>
                    <View style={styles.rightPanel}>
                        <CtaButtons task={theTask} />
                        {/* CtaButtons, TaskDetailsArea */}
                    </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    leftPanel: {
        flex: 1,
        paddingRight: 8,
    },
    rightPanel: {
        flex: 1,
        paddingLeft: 8,
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

                            {media.Media_File_Type === 'jpeg' ? (
                                <Image
                                    source={{ uri: `http://localhost:8000/storage/${media.Media_File_Path}` }}
                                    style={mediaFilesAreaStyles.mediaImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={mediaFilesAreaStyles.pdfBox}>
                                    <Text style={mediaFilesAreaStyles.pdfLabel}>PDF</Text>
                                </View>
                            )}

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
