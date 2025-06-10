import { Task, User } from "./";

// Task Media File Type
export type TaskMediaFile = {
    Media_ID?: number;
    Task_ID: number;
    Uploaded_By_User_ID: number;
    Media_File: File | null;
    Media_File_Name: string;
    Media_File_Path: string;
    Media_File_Type: string; // E.g. 'image/jpeg', 'application/pdf'
    Media_CreatedAt: string; // YYYY-MM-DD format
    Media_UpdatedAt: string; // YYYY-MM-DD format
    Media_DeletedAt?: string; // Nullable, YYYY-MM-DD format

    // Relationships
    task?: Task;
    user?: User;
}

export type TaskMediaFileFields =
    "Media_ID" | "Task_ID" | "Uploaded_By_User_ID" | "Media_File_Name" | "Media_File_Path" |
    "Media_File_Type" | "Media_CreatedAt" | "Media_UpdatedAt" | "Media_DeletedAt"