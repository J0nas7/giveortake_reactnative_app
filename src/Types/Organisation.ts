import { Team } from "./"

// Organisation Type
export type Organisation = {
    Organisation_ID?: number
    User_ID: number
    Organisation_Name: string
    Organisation_Description?: string
    Organisation_CreatedAt?: string
    Organisation_UpdatedAt?: string

    // Relationships
    teams?: Team[]
}

export type OrganisationFields =
    "Organisation_ID" | "User_ID" | "Organisation_Name" |
    "Organisation_Description" | "Organisation_CreatedAt" | "Organisation_UpdatedAt"

export type OrganisationStates = Organisation | undefined | false