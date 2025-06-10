import { Permission } from "./"

// Role Type
export type Role = {
    Role_ID?: number
    Team_ID: number
    Role_Name: string
    Role_Description?: string
    Role_CreatedAt?: string
    Role_UpdatedAt?: string
    Role_DeletedAt?: string

    // Relationships
    permissions?: Permission[]
}

export type RoleFields =
    "Role_ID" | "Team_ID" | "Role_Name" | "Role_Description" |
    "Role_CreatedAt" | "Role_UpdatedAt" | "Role_DeletedAt"

export type RoleStates = Role | undefined | false