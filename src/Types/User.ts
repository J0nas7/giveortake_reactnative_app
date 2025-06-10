import { TaskTimeTrack } from "./"

// User Type
export type User = {
    User_ID?: number
    User_Status: string
    User_Email: string
    User_FirstName: string
    User_Surname: string
    User_ImageSrc?: string
    User_CreatedAt?: string
    User_UpdatedAt?: string
    User_DeletedAt?: string

    // Relationships
    timeTracks?: TaskTimeTrack[]
}

export type UserFields =
    "User_ID" | "User_Status" | "User_Email" | "User_FirstName" | "User_Surname" |
    "User_ImageSrc" | "User_CreatedAt" | "User_UpdatedAt" | "User_DeletedAt"

export type UserStates = User | undefined | false