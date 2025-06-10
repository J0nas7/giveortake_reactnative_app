"use client"

// External
import React, { createContext, useContext } from "react"

// Internal
import { TaskComment, TaskCommentFields } from "@/types"
import { useResourceContext } from "./TypeContext"

// TaskComments Context
// Context API for TaskComments
export type TaskCommentsContextType = {
    taskCommentsById: TaskComment[]
    commentById: false | TaskComment | undefined
    taskCommentDetail: TaskComment | undefined
    newTaskComment: TaskComment | undefined
    readTaskCommentsByTaskId: (parentId: number) => Promise<void>
    readCommentById: (itemId: number, reply?: boolean) => Promise<any>
    setTaskCommentDetail: React.Dispatch<React.SetStateAction<TaskComment | undefined>>
    handleChangeNewTaskComment: (field: TaskCommentFields, value: string, object?: TaskComment | undefined) => Promise<void>
    addTaskComment: (parentId: number, object?: TaskComment | undefined) => Promise<void>
    saveTaskCommentChanges: (taskCommentChanges: TaskComment, parentId: number) => Promise<boolean>
    removeTaskComment: (itemId: number, parentId: number, redirect: string | undefined) => Promise<void>
}

const TaskCommentsContext = createContext<TaskCommentsContextType | undefined>(undefined)

// TaskCommentsProvider using useResourceContext
export const TaskCommentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Use useResourceContext directly for task-comment related logic
    const {
        itemsById: taskCommentsById,
        itemById: commentById,
        newItem: newTaskComment,
        itemDetail: taskCommentDetail,
        readItemsById: readTaskCommentsByTaskId,
        readItemById: readCommentById,
        setItemDetail: setTaskCommentDetail,
        handleChangeNewItem: handleChangeNewTaskComment,
        addItem: addTaskComment,
        saveItemChanges: saveTaskCommentChanges,
        removeItem: removeTaskComment,
        // loading: taskCommentLoading,
        // error: taskCommentError,
    } = useResourceContext<TaskComment, "Comment_ID">(
        "task-comments",
        "Comment_ID",
        "tasks"
    )

    return (
        <TaskCommentsContext.Provider
            value={{
                taskCommentsById,
                commentById,
                taskCommentDetail,
                newTaskComment,
                readTaskCommentsByTaskId,
                readCommentById,
                setTaskCommentDetail,
                handleChangeNewTaskComment,
                addTaskComment,
                saveTaskCommentChanges,
                removeTaskComment,
                // taskCommentLoading,
                // taskCommentError,
            }}
        >
            {children}
        </TaskCommentsContext.Provider>
    )
}

export const useTaskCommentsContext = () => {
    const context = useContext(TaskCommentsContext)
    if (!context) {
        throw new Error("useTaskCommentsContext must be used within a TaskCommentsProvider")
    }
    return context
}
