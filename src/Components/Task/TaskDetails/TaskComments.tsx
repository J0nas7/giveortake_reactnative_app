// External
import { faPaperPlane, faPencil, faReply, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Internal
import { CreatedAtToTimeSince } from '@/src/Components/CreatedAtToTimeSince';
import { Card } from '@/src/Components/Task/TaskDetails/TaskCard';
import { useTaskCommentsContext, useTasksContext } from '@/src/Contexts';
import { LoadingState } from '@/src/Core-UI/LoadingState';
import { selectAuthUser, useTypedSelector } from '@/src/Redux';
import { Task, TaskComment, User } from '@/src/Types';

export const CommentsArea: React.FC<{ task: Task }> = ({ task }) => {
    const { addTaskComment, saveTaskCommentChanges, removeTaskComment } = useTaskCommentsContext();
    const { readTasksByBacklogId, readTaskByKeys } = useTasksContext();
    const authUser = useTypedSelector(selectAuthUser);

    const [createComment, setCreateComment] = useState<string>("");
    const [editComment, setEditComment] = useState<string>("");
    const [isCreateCommentVisible, setIsCreateCommentVisible] = useState<boolean>(false);
    const [isEditCommentVisible, setIsEditCommentVisible] = useState<TaskComment | undefined>(undefined);
    const [isAnsweringCommentVisible, setIsAnsweringCommentVisible] = useState<TaskComment | undefined>(undefined);

    const handleAddComment = async () => {
        if (!authUser) return

        if (createComment.trim() && authUser.User_ID) {
            const theNewComment: TaskComment = {
                Task_ID: task.Task_ID ?? 0,
                User_ID: authUser.User_ID,
                Comment_Text: createComment.trim()
            }

            if (isAnsweringCommentVisible) {
                theNewComment.Parent_Comment_ID = isAnsweringCommentVisible.Comment_ID;
            }

            console.log("theNewComment", theNewComment)
            await addTaskComment(theNewComment.Task_ID, theNewComment)

            setCreateComment("");
            setIsCreateCommentVisible(false)
            setIsAnsweringCommentVisible(undefined)

            //// Task changed
            if (task) {
                if (task.Backlog_ID) readTasksByBacklogId(task.Backlog_ID, true)
                if (task.Task_Key && task.backlog?.project?.Project_Key) await readTaskByKeys(task.backlog.project.Project_Key, task.Task_Key.toString())
            }
        }
    }

    // Handle new comment cancel
    const handleCommentCancel = () => {
        setCreateComment("");
        setIsCreateCommentVisible(false); // Hide editor after cancel
        setIsAnsweringCommentVisible(undefined)
    };

    const handleEditComment = async () => {
        if (!authUser || (!isEditCommentVisible && !isAnsweringCommentVisible)) return

        if (editComment.trim() && authUser.User_ID) {
            let theEditedComment: TaskComment | undefined;

            if (isEditCommentVisible) {
                theEditedComment = {
                    ...isEditCommentVisible,
                    Comment_Text: editComment.trim()
                };
            } else if (isAnsweringCommentVisible) {
                theEditedComment = {
                    ...isAnsweringCommentVisible,
                    Comment_Text: editComment.trim()
                };
            }

            if (!theEditedComment) return;

            if (isAnsweringCommentVisible) {
                theEditedComment.Parent_Comment_ID = isAnsweringCommentVisible.Comment_ID;
            }

            await saveTaskCommentChanges(theEditedComment, theEditedComment.Task_ID)

            setEditComment("");
            setIsEditCommentVisible(undefined)

            //// Task changed
            if (task) {
                if (task.Backlog_ID) readTasksByBacklogId(task.Backlog_ID, true)
                if (task.Task_Key && task.backlog?.project?.Project_Key) await readTaskByKeys(task.backlog.project.Project_Key, task.Task_Key.toString())
            }
        }
    }

    // Handle new comment cancel
    const handleEditCommentCancel = () => {
        setEditComment("");
        setIsEditCommentVisible(undefined); // Hide editor after cancel
    };

    // Handle comment deletion
    const handleDeleteComment = async (taskComment: TaskComment) => {
        if (!task.Task_ID || !taskComment.Comment_ID) return

        // Send the comment ID to the API through the context function
        if (taskComment.Comment_ID) {
            await removeTaskComment(taskComment.Comment_ID, taskComment.Task_ID, undefined)
            if (isEditCommentVisible && isEditCommentVisible.Comment_ID === taskComment.Comment_ID) {
                setEditComment("")
                setIsEditCommentVisible(undefined)
            }

            //// Task changed
            if (task) {
                if (task.Backlog_ID) await readTasksByBacklogId(task.Backlog_ID, true)
                if (task.Task_Key && task.backlog?.project?.Project_Key) await readTaskByKeys(task.backlog.project.Project_Key, task.Task_Key.toString())
            }
        }
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
            isAnsweringCommentVisible={isAnsweringCommentVisible}
            setIsAnsweringCommentVisible={setIsAnsweringCommentVisible}
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
    setCreateComment: React.Dispatch<React.SetStateAction<string>>
    editComment: string;
    setEditComment: React.Dispatch<React.SetStateAction<string>>
    isCreateCommentVisible: boolean;
    setIsCreateCommentVisible: (visible: boolean) => void;
    isEditCommentVisible: TaskComment | undefined;
    setIsEditCommentVisible: React.Dispatch<React.SetStateAction<TaskComment | undefined>>
    isAnsweringCommentVisible: TaskComment | undefined
    setIsAnsweringCommentVisible: React.Dispatch<React.SetStateAction<TaskComment | undefined>>
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
    isAnsweringCommentVisible,
    setIsAnsweringCommentVisible,
    handleAddComment,
    handleCommentCancel,
    handleEditComment,
    handleEditCommentCancel,
    handleDeleteComment,
}) => (
    <Card style={commentsAreaStyles.commentsSection}>
        <CommentHeader title="Comments" />

        {isEditCommentVisible ? (
            <CommentEditor
                value={editComment}
                onChangeText={setEditComment}
                placeholder="Edit your comment..."
                onSend={handleEditComment}
                onCancel={handleEditCommentCancel}
            />
        ) : (
            <>
                {!isCreateCommentVisible ? (
                    <CommentPlaceholder onPress={() => setIsCreateCommentVisible(true)} />
                ) : (
                    <CommentEditor
                        value={createComment}
                        onChangeText={setCreateComment}
                        placeholder="Write your comment..."
                        onSend={handleAddComment}
                        onCancel={handleCommentCancel}
                    />
                )}
            </>
        )}

        {task.comments?.filter(comment => !comment.Parent_Comment_ID).map((comment, index) => (
            <CommentItem
                key={index}
                comment={comment}
                setCreateComment={setCreateComment}
                setEditComment={setEditComment}
                setIsEditCommentVisible={setIsEditCommentVisible}
                setIsAnsweringCommentVisible={setIsAnsweringCommentVisible}
                handleDeleteComment={handleDeleteComment}
            />
        ))}
    </Card>
);

const CommentHeader: React.FC<{ title: string; }> = ({ title }) => (
    <View style={commentsAreaStyles.header}>
        <Text style={commentsAreaStyles.title}>{title}</Text>
    </View>
);

interface CommentEditorProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    onSend: () => void;
    onCancel: () => void;
    isAnsweringCommentVisible?: TaskComment | undefined;
}

const CommentEditor: React.FC<CommentEditorProps> = ({
    value,
    onChangeText,
    placeholder,
    onSend,
    onCancel,
    isAnsweringCommentVisible
}) => (
    <View style={commentsAreaStyles.commentEditor}>
        {isAnsweringCommentVisible && (
            <Text>
                Answering: {isAnsweringCommentVisible.user?.User_FirstName} {isAnsweringCommentVisible.user?.User_Surname}
            </Text>
        )}
        <TextInput
            value={value}
            onChangeText={onChangeText}
            style={commentsAreaStyles.commentTextarea}
            placeholder={placeholder}
            multiline
        />
        <View style={commentsAreaStyles.newCommentActions}>
            <TouchableOpacity style={commentsAreaStyles.sendButton} onPress={onSend}>
                <FontAwesomeIcon icon={faPaperPlane} size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={commentsAreaStyles.cancelButton} onPress={onCancel}>
                <Text style={commentsAreaStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const CommentPlaceholder: React.FC<{ onPress: () => void; }> = ({ onPress }) => (
    <TouchableOpacity
        style={commentsAreaStyles.commentPlaceholder}
        onPress={onPress}
    >
        <Text>Add a new comment...</Text>
    </TouchableOpacity>
);

type CommentItemProps = {
    comment: TaskComment
    setCreateComment: React.Dispatch<React.SetStateAction<string>>
    setEditComment: React.Dispatch<React.SetStateAction<string>>
    setIsEditCommentVisible: React.Dispatch<React.SetStateAction<TaskComment | undefined>>
    setIsAnsweringCommentVisible: React.Dispatch<React.SetStateAction<TaskComment | undefined>>
    handleDeleteComment: (taskComment: TaskComment) => Promise<void>
}

export const CommentItem: React.FC<CommentItemProps> = ({
    comment,
    setCreateComment,
    setEditComment,
    setIsEditCommentVisible,
    setIsAnsweringCommentVisible,
    handleDeleteComment
}) => {
    // Hooks
    const { readCommentById } = useTaskCommentsContext();

    // State
    const [theComment, setTheComment] = useState<TaskComment | undefined>(undefined);

    useEffect(() => {
        const readComment = async () => {
            if (comment.Comment_ID) {
                const result = await readCommentById(comment.Comment_ID, true)

                if (result) setTheComment(result)
            }
        }
        readComment()
    }, [])

    return (
        <LoadingState singular="Comment" renderItem={theComment} permitted={true}>
            {theComment && (
                <View style={commentsAreaStyles.commentItem}>
                    <Text style={commentsAreaStyles.comment}>{comment.Comment_Text}</Text>
                    <View style={commentsAreaStyles.commentMeta}>
                        <View>
                            <Text>
                                Created:{" "}
                                {comment.Comment_CreatedAt && (
                                    <CreatedAtToTimeSince dateCreatedAt={comment.Comment_CreatedAt} />
                                )}
                            </Text>
                            <Text>By: {comment.user?.User_FirstName} {comment.user?.User_Surname}</Text>
                        </View>
                        <View style={commentsAreaStyles.commentActions}>
                            <TouchableOpacity
                                style={commentsAreaStyles.mediaActions}
                                onPress={() => {
                                    setCreateComment("");
                                    setIsAnsweringCommentVisible(comment);
                                }}
                            >
                                <FontAwesomeIcon icon={faReply} style={commentsAreaStyles.icon} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={commentsAreaStyles.mediaActions}
                                onPress={() => {
                                    setEditComment(comment.Comment_Text);
                                    setIsEditCommentVisible(comment);
                                }}
                            >
                                <FontAwesomeIcon icon={faPencil} style={commentsAreaStyles.icon} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={commentsAreaStyles.mediaActions}
                                onPress={() => handleDeleteComment(comment)}
                            >
                                <FontAwesomeIcon icon={faTrashCan} style={commentsAreaStyles.icon} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {Array.isArray(theComment.children_comments) && theComment.children_comments.length > 0 && (
                        <View style={commentsAreaStyles.nestedComment}>
                            {comment.children_comments?.map((childComment, childIndex) => (
                                <CommentItem
                                    key={childIndex}
                                    comment={childComment}
                                    setCreateComment={setCreateComment}
                                    setEditComment={setEditComment}
                                    setIsEditCommentVisible={setIsEditCommentVisible}
                                    setIsAnsweringCommentVisible={setIsAnsweringCommentVisible}
                                    handleDeleteComment={handleDeleteComment}
                                />
                            ))}
                        </View>
                    )}
                </View>
            )}
        </LoadingState>
    );
}

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
    nestedComment: {
        marginLeft: 20, // Add some margin to visually indicate nesting
    },
    mediaActions: {
        marginLeft: 10,
    },
});
