import { Backlog, Task } from "./"

export type Status = {
    Status_ID?: number
    Backlog_ID: number
    Status_Name: string
    Status_Order?: number
    Status_Is_Default?: boolean
    Status_Is_Closed?: boolean
    Status_Color?: string
    Status_CreatedAt?: string
    Status_UpdatedAt?: string

    // Relationships
    tasks?: Task[]
    backlog?: Backlog
}

export type StatusFields =
    "Status_ID" | "Backlog_ID" | "Status_Name" | "Status_Order" |
    "Status_Is_Default" | "Status_Is_Closed" | "Status_Color" | "Status_CreatedAt" | "Status_UpdatedAt"

export type StatusStates = Status | undefined | false