import { Project, Task, User } from "./"

// Task Time Track Type
export type TaskTimeTrack = {
    Time_Tracking_ID?: number
    Task_ID: number
    Backlog_ID: number
    User_ID: number
    // Comment_ID?: number | null
    Time_Tracking_Start_Time: string // ISO 8601 format (e.g., "YYYY-MM-DDTHH:mm:ssZ")
    Time_Tracking_End_Time?: string | null // Nullable, if tracking is still active
    Time_Tracking_Duration?: number | null // In minutes
    Time_Tracking_Notes?: string | null
    Time_Tracking_CreatedAt?: string // ISO 8601 format
    Time_Tracking_UpdatedAt?: string // ISO 8601 format
    Time_Tracking_DeletedAt?: string | null // Nullable

    // Relationships
    task?: Task
    project?: Project
    user?: User
    // comment?: TaskComment
}

export type TaskTimeTrackFields =
    "Time_Tracking_ID" | "Task_ID" | "Backlog_ID" | "User_ID" | "Comment_ID" |
    "Time_Tracking_Start_Time" | "Time_Tracking_End_Time" |
    "Time_Tracking_Duration" | "Time_Tracking_Notes" |
    "Time_Tracking_CreatedAt" | "Time_Tracking_UpdatedAt" | "Time_Tracking_DeletedAt"
