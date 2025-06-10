"use client"

// External
import React, { createContext, useContext } from "react"

// Internal
import { TaskMediaFile, TaskMediaFileFields } from "@/src/Types"
import { useResourceContext } from "./TypeContext"

// TaskMediaFiles Context
// Context API for TaskMediaFiles
export type TaskMediaFilesContextType = {
    taskMediaFilesById: TaskMediaFile[]
    taskMediaFileDetail: TaskMediaFile | undefined
    newTaskMediaFile: TaskMediaFile | undefined
    readTaskMediaFilesByTaskId: (parentId: number) => Promise<void>
    setTaskMediaFileDetail: React.Dispatch<React.SetStateAction<TaskMediaFile | undefined>>
    handleChangeNewTaskMediaFile: (field: TaskMediaFileFields, value: string) => Promise<void>
    addTaskMediaFile: (parentId: number, object?: TaskMediaFile | undefined) => Promise<void>
    saveTaskMediaFileChanges: (taskMediaFileChanges: TaskMediaFile, parentId: number) => Promise<boolean>
    removeTaskMediaFile: (itemId: number, parentId: number, redirect: string | undefined) => Promise<void>
}

const TaskMediaFilesContext = createContext<TaskMediaFilesContextType | undefined>(undefined)

// TaskMediaFilesProvider using useResourceContext
export const TaskMediaFilesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Use useResourceContext directly for task-media-file related logic
    const {
        itemsById: taskMediaFilesById,
        newItem: newTaskMediaFile,
        itemDetail: taskMediaFileDetail,
        readItemsById: readTaskMediaFilesByTaskId,
        setItemDetail: setTaskMediaFileDetail,
        handleChangeNewItem: handleChangeNewTaskMediaFile,
        addItem: addTaskMediaFile,
        saveItemChanges: saveTaskMediaFileChanges,
        removeItem: removeTaskMediaFile,
        // loading: taskMediaFileLoading,
        // error: taskMediaFileError,
    } = useResourceContext<TaskMediaFile, "Media_ID">(
        "task-media-files",
        "Media_ID",
        "tasks"
    )

    return (
        <TaskMediaFilesContext.Provider
            value={{
                taskMediaFilesById,
                taskMediaFileDetail,
                newTaskMediaFile,
                readTaskMediaFilesByTaskId,
                setTaskMediaFileDetail,
                handleChangeNewTaskMediaFile,
                addTaskMediaFile,
                saveTaskMediaFileChanges,
                removeTaskMediaFile,
                // taskMediaFileLoading,
                // taskMediaFileError,
            }}
        >
            {children}
        </TaskMediaFilesContext.Provider>
    )
}

export const useTaskMediaFilesContext = () => {
    const context = useContext(TaskMediaFilesContext)
    if (!context) {
        throw new Error("useTaskMediaFilesContext must be used within a TaskMediaFilesProvider")
    }
    return context
}
