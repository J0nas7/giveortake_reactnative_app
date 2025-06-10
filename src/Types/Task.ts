import { Backlog, Status, TaskComment, TaskMediaFile, TaskTimeTrack } from "./"

// Task Type
export type Task = {
    Task_ID?: number
    Task_Key?: number
    Backlog_ID: number
    Team_ID?: number
    Assigned_User_ID?: number
    Task_Title: string
    Task_Description?: string
    Status_ID: number
    Task_Hours_Spent?: number
    Task_Due_Date?: string
    Task_CreatedAt?: string
    Task_UpdatedAt?: string

    // Relationships
    status?: Status
    backlog?: Backlog
    comments?: TaskComment[]
    time_tracks?: TaskTimeTrack[]
    media_files?: TaskMediaFile[]
}

export type TaskFields =
    "Task_ID" | "Task_Key" | "Backlog_ID" | "Team_ID" | "Assigned_User_ID" | "Task_Title" |
    "Task_Description" | "Status_ID" | "Task_Due_Date" | "Task_CreatedAt" | "Task_UpdatedAt"
