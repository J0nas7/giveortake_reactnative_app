import { Role, Team, User } from "./"

// Team User Seat Type
export type TeamUserSeat = {
    Seat_ID?: number
    Team_ID: number
    User_ID: number
    Role_ID: number
    Seat_Status: string
    Seat_Role_Description?: string
    Seat_Expiration?: string
    Seat_CreatedAt?: string
    Seat_UpdatedAt?: string
    Seat_DeletedAt?: string

    // Relationships
    team?: Team
    user?: User
    role?: Role
}

export type TeamUserSeatFields =
    "Seat_ID" | "Team_ID" | "User_ID" | "Role_ID" | 
    "Seat_Status" | "Seat_Role_Description" | "Seat_Expiration" | 
    "Seat_CreatedAt" | "Seat_UpdatedAt" | "Seat_DeletedAt"

export type TeamUserSeatStates = TeamUserSeat | undefined | false