import { Organisation, Project, Task, TeamUserSeat } from "./"

// Team Type
export type Team = {
    Team_ID?: number
    Organisation_ID: number
    Team_Name: string
    Team_Description?: string
    Team_CreatedAt?: string
    Team_UpdatedAt?: string

    // Relationships
    organisation?: Organisation
    user_seats?: TeamUserSeat[]
    projects?: Project[]
    tasks?: Task[]
}

export type TeamFields =
    "Team_ID" | "Organisation_ID" | "Team_Name" |
    "Team_Description" | "Team_CreatedAt" | "Team_UpdatedAt"

export type TeamStates = Team | undefined | false