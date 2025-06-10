import { Backlog, Team } from "./"

// Project Type
export type Project = {
    Project_ID?: number
    Team_ID: number
    Project_Name: string
    Project_Key: string
    Project_Description?: string
    Project_Status: 'Planned' | 'Active' | 'Completed' | 'On Hold'
    Project_Start_Date?: string
    Project_End_Date?: string
    Project_CreatedAt?: string
    Project_UpdatedAt?: string

    // Relationships
    team?: Team
    backlogs?: Backlog[]
}

export type ProjectFields =
    "Project_ID" | "Team_ID" | "Project_Name" | "Project_Key" |
    "Project_Description" | "Project_Status" | "Project_Start_Date" |
    "Project_End_Date" | "Project_CreatedAt" | "Project_UpdatedAt"

export type ProjectStates = Project | undefined | false