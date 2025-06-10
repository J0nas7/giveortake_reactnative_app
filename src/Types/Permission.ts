// Permission Type
export type Permission = {
    Permission_ID?: number;
    Team_ID: number;
    Permission_Key: string;
    Permission_Description?: string;
    Permission_CreatedAt?: string;
    Permission_UpdatedAt?: string;
    Permission_DeletedAt?: string;
};

export type PermissionFields =
    "Permission_ID" | "Team_ID" | "Permission_Key" | "Permission_Description" |
    "Permission_CreatedAt" | "Permission_UpdatedAt" | "Permission_DeletedAt";