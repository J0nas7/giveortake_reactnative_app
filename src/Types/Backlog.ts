import { Project, Status, Task, Team } from "./"

// Backlog Type
export type Backlog = {
    Backlog_ID?: number
    Project_ID: number
    Team_ID?: number // Nullable
    Backlog_Name: string
    Backlog_Description?: string
    Backlog_IsPrimary: boolean
    Backlog_StartDate?: string
    Backlog_EndDate?: string
    Backlog_CreatedAt?: string
    Backlog_UpdatedAt?: string

    // Relationships
    project?: Project
    team?: Team
    statuses?: Status[]
    tasks?: Task[]
}

export type BacklogFields =
    "Backlog_ID" | "Project_ID" | "Team_ID" | "Backlog_Name" |
    "Backlog_Description" | "Backlog_IsPrimary" | "Backlog_StartDate" |
    "Backlog_EndDate" | "Backlog_CreatedAt" | "Backlog_UpdatedAt"

export type BacklogStates = Backlog | undefined | false