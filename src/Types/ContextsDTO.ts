// User Type
export type User = {
    User_ID?: number;
    User_Status: string;
    User_Email: string;
    User_FirstName: string;
    User_Surname: string;
    User_ImageSrc?: string;
    User_CreatedAt?: string;
    User_UpdatedAt?: string;
    User_DeletedAt?: string;

    // Relationships
    timeTracks?: TaskTimeTrack[]
};

export type UserFields =
    "User_ID" | "User_Status" | "User_Email" | "User_FirstName" | "User_Surname" |
    "User_ImageSrc" | "User_CreatedAt" | "User_UpdatedAt" | "User_DeletedAt";

// Organisation Type
export type Organisation = {
    Organisation_ID?: number;
    User_ID: number;
    Organisation_Name: string;
    Organisation_Description?: string;
    Organisation_CreatedAt?: string;
    Organisation_UpdatedAt?: string;

    // Relationships
    teams?: Team[]
};

export type OrganisationFields =
    "Organisation_ID" | "User_ID" | "Organisation_Name" |
    "Organisation_Description" | "Organisation_CreatedAt" | "Organisation_UpdatedAt";

// Team Type
export type Team = {
    Team_ID?: number;
    Organisation_ID: number;
    Team_Name: string;
    Team_Description?: string;
    Team_CreatedAt?: string;
    Team_UpdatedAt?: string;

    // Relationships
    organisation?: Organisation
    user_seats?: TeamUserSeat[]
    projects?: Project[]
    tasks?: Task[]
};

export type TeamFields =
    "Team_ID" | "Organisation_ID" | "Team_Name" |
    "Team_Description" | "Team_CreatedAt" | "Team_UpdatedAt";

// Project Type
export type Project = {
    Project_ID?: number;
    Team_ID: number;
    Project_Name: string;
    Project_Key: string;
    Project_Description?: string;
    Project_Status: 'Planned' | 'Active' | 'Completed' | 'On Hold';
    Project_Start_Date?: string;
    Project_End_Date?: string;
    Project_CreatedAt?: string;
    Project_UpdatedAt?: string;

    // Relationships
    team?: Team
    tasks?: Task[]
};

export type ProjectFields =
    "Project_ID" | "Team_ID" | "Project_Name" | "Project_Key" | 
    "Project_Description" | "Project_Status" | "Project_Start_Date" |
    "Project_End_Date" | "Project_CreatedAt" | "Project_UpdatedAt";

// Team User Seat Type
export type TeamUserSeat = {
    Seat_ID?: number;
    Team_ID: number;
    User_ID?: number;
    Seat_Role: string;
    Seat_Status: string;
    Seat_Role_Description?: string;
    Seat_Permissions?: string[] | string;
    Seat_CreatedAt?: string;
    Seat_UpdatedAt?: string;
    Seat_DeletedAt?: string;

    // Relationships
    team?: Team
    user?: User
};

export type TeamUserSeatFields =
    "Seat_ID" | "Team_ID" | "User_ID" | "Seat_Role" | "Seat_Status" |
    "Seat_Role_Description" | "Seat_Permissions" | "Seat_CreatedAt" | "Seat_UpdatedAt" | "Seat_DeletedAt";

// Task Type
export type Task = {
    Task_ID?: number;
    Task_Key?: number;
    Project_ID: number;
    Team_ID: number; // Nullable if not assigned to a team
    Assigned_User_ID?: number; // Nullable if unassigned
    Task_Title: string;
    Task_Description?: string;
    Task_Status: 'To Do' | 'In Progress' | 'Waiting for Review' | 'Done'
    Task_Due_Date?: string; // YYYY-MM-DD format
    Task_CreatedAt?: string;
    Task_UpdatedAt?: string;

    // Relationships
    project?: Project
    comments?: TaskComment[]
    time_tracks?: TaskTimeTrack[]
    media_files?: TaskMediaFile[]
}

export type TaskFields =
    "Task_ID" | "Task_Key" | "Project_ID" | "Team_ID" | "Assigned_User_ID" | "Task_Title" |
    "Task_Description" | "Task_Status" | "Task_Due_Date" | "Task_CreatedAt" | "Task_UpdatedAt"

// Task Time Track Type
export type TaskTimeTrack = {
    Time_Tracking_ID?: number;
    Task_ID: number;
    Project_ID: number;
    User_ID: number;
    Comment_ID?: number | null;
    Time_Tracking_Start_Time: string; // ISO 8601 format (e.g., "YYYY-MM-DDTHH:mm:ssZ")
    Time_Tracking_End_Time?: string | null; // Nullable, if tracking is still active
    Time_Tracking_Duration?: number | null; // In minutes
    Time_Tracking_Notes?: string | null;
    Time_Tracking_CreatedAt?: string; // ISO 8601 format
    Time_Tracking_UpdatedAt?: string; // ISO 8601 format
    Time_Tracking_DeletedAt?: string | null; // Nullable

    // Relationships
    task?: Task;
    project?: Project;
    user?: User;
    comment?: TaskComment;
}

export type TaskTimeTrackFields =
    "Time_Tracking_ID" | "Task_ID" | "User_ID" | "Comment_ID" |
    "Time_Tracking_Start_Time" | "Time_Tracking_End_Time" | 
    "Time_Tracking_Duration" | "Time_Tracking_Notes" |
    "Time_Tracking_CreatedAt" | "Time_Tracking_UpdatedAt" | "Time_Tracking_DeletedAt";


// Task Comment Type
export type TaskComment = {
    Comment_ID?: number;
    Task_ID: number;
    User_ID: number;
    Comment_Text: string;
    Comment_CreatedAt?: string; // YYYY-MM-DD format
    Comment_UpdatedAt?: string; // YYYY-MM-DD format
    Comment_DeletedAt?: string; // Nullable, YYYY-MM-DD format

    // Relationships
    task?: Task;
    user?: User;
    timeTracks?: TaskTimeTrack[]
}

export type TaskCommentFields =
    "Comment_ID" | "Task_ID" | "User_ID" | "Comment_Text" |
    "Comment_CreatedAt" | "Comment_UpdatedAt" | "Comment_DeletedAt"

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

// Activity Log Type
export type ActivityLog = {
    Log_ID: number;
    User_ID: number;
    Project_ID?: number;
    Log_Action: string;
    Log_Details?: any;
    Log_CreatedAt?: string;
    Log_UpdatedAt?: string;
};

export type ActivityLogFields =
    "Log_ID" | "User_ID" | "Project_ID" | "Log_Action" |
    "Log_Details" | "Log_CreatedAt" | "Log_UpdatedAt";

export type ActivityLogsContextType = {
    activityLogs: ActivityLog[];
    newActivityLog: ActivityLog | undefined;
    handleChangeNewActivityLog: (field: ActivityLogFields, value: string) => Promise<void>
    addActivityLog: () => Promise<void>
    removeActivityLog: (id: number) => void;
};

// Notification Type
export type Notification = {
    Notification_ID: number;
    User_ID: number;
    Notification_Message: string;
    Notification_Read: boolean;
    Notification_CreatedAt?: string;
    Notification_UpdatedAt?: string;
};

export type NotificationFields =
    "Notification_ID" | "User_ID" | "Notification_Message" |
    "Notification_Read" | "Notification_CreatedAt" | "Notification_UpdatedAt";

export type NotificationsContextType = {
    notifications: Notification[];
    newNotification: Notification | undefined;
    handleChangeNewNotification: (field: NotificationFields, value: string) => Promise<void>
    addNotification: () => Promise<void>
    removeNotification: (id: number) => void;
};