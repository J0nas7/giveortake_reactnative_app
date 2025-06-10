// RolePermission Type
export type RolePermission = {
    Role_Permission_ID?: number;
    Role_ID: number;
    Permission_ID: number;
    Role_Permission_CreatedAt?: string;
    Role_Permission_UpdatedAt?: string;
    Role_Permission_DeletedAt?: string;
};

export type RolePermissionFields =
    "Role_Permission_ID" | "Role_ID" | "Permission_ID" |
    "Role_Permission_CreatedAt" | "Role_Permission_UpdatedAt" | "Role_Permission_DeletedAt";