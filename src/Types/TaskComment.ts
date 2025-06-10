import { Task, TaskTimeTrack, User } from "./";

// Task Comment Type
export type TaskComment = {
    Comment_ID?: number;
    Task_ID: number;
    Parent_Comment_ID?: number;
    User_ID: number;
    Comment_Text: string;
    Comment_CreatedAt?: string; // YYYY-MM-DD format
    Comment_UpdatedAt?: string; // YYYY-MM-DD format
    Comment_DeletedAt?: string; // Nullable, YYYY-MM-DD format

    // Relationships
    task?: Task;
    user?: User;
    timeTracks?: TaskTimeTrack[]
    children_comments?: TaskComment[]
    parentComment?: TaskComment
}

export type TaskCommentFields =
    "Comment_ID" | "Task_ID" | "User_ID" | "Comment_Text" |
    "Comment_CreatedAt" | "Comment_UpdatedAt" | "Comment_DeletedAt"

export type CommentStates = TaskComment | undefined | false
