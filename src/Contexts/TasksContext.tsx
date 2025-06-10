"use client"

// External
import React, { createContext, useContext, useState } from "react"

// Internal
import { useAxios } from "@/src/Hooks"
import { Task, TaskFields } from "@/src/Types"
import { useResourceContext } from "./TypeContext"

// Tasks Context (DEPRECATED)
/*export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <ResourceProvider<Task, "Task_ID">
            resource="tasks"
            idFieldName="Task_ID"
        >
            {children}
        </ResourceProvider>
    )
}*/

// Tasks Context
// Context API for Tasks
export type TasksContextType = {
    tasksById: Task[]
    taskById: Task | undefined | false
    taskDetail: Task | undefined
    newTask: Task | undefined
    readTasksByBacklogId: (parentId: number, refresh?: boolean | undefined, reply?: boolean) => Promise<any>
    // readTaskById: (itemId: number) => Promise<void>
    setTaskDetail: React.Dispatch<React.SetStateAction<Task | undefined>>
    handleChangeNewTask: (field: TaskFields, value: string, object?: Task) => Promise<void>
    addTask: (parentId: number, object?: Task) => Promise<void>
    saveTaskChanges: (taskChanges: Task, parentId: number) => Promise<boolean>
    removeTask: (itemId: number, parentId: number, redirect: string | undefined) => Promise<void>
    taskByKeys: Task | undefined
    readTaskByKeys: (projectKey: string, taskKey: string) => Promise<boolean>
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

// TasksProvider using useResourceContext
export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { httpGetRequest } = useAxios()

    // Use useResourceContext directly for task-related logic
    const {
        itemsById: tasksById,
        itemById: taskById,
        newItem: newTask,
        itemDetail: taskDetail,
        readItemsById: readTasksByBacklogId,
        readItemById: readTaskById,
        setItemDetail: setTaskDetail,
        handleChangeNewItem: handleChangeNewTask,
        addItem: addTask,
        saveItemChanges: saveTaskChanges,
        removeItem: removeTask,
        // loading: taskLoading,
        // error: taskError,
    } = useResourceContext<Task, "Task_ID">(
        "tasks",
        "Task_ID",
        "backlogs"
    );

    const [taskByKeys, setTaskByKeys] = useState<Task | undefined>(undefined)

    const readTaskByKeys = async (projectKey: string, taskKey: string) => {
        try {
            const data = await httpGetRequest(`taskByKeys/${projectKey}/${taskKey}`)

            if (data) {
                console.log("readTaskByKeys", data)
                // Assuming 'data' is the object with task
                setTaskByKeys(data)
                return true
            }

            throw new Error(`Failed to readTaskByKeys`);
        } catch (error: any) {
            console.log(error.message || `An error occurred while trying readTaskByKeys.`);
            return false
        }
    }

    return (
        <TasksContext.Provider
            value={{
                tasksById,
                taskById,
                taskDetail,
                newTask,
                readTasksByBacklogId,
                // readTaskById,
                setTaskDetail,
                handleChangeNewTask,
                addTask,
                saveTaskChanges,
                removeTask,
                taskByKeys,
                readTaskByKeys,
                // taskLoading,
                // taskError,
            }}
        >
            {children}
        </TasksContext.Provider>
    );
};

export const useTasksContext = () => {
    const context = useContext(TasksContext)
    if (!context) {
        throw new Error("useTasksContext must be used within a TasksProvider")
    }
    return context
}

/*export const useTasksContext = () => {
    const context = useResource()

    const {
        itemsById: tasksById,
        newItem: newTask,
        itemDetail: taskDetail,
        setItemDetail: setTaskDetail,
        handleChangeNewItem: handleChangeNewTask,
        addItem: addTask,
        saveItemChanges: saveTaskChanges,
        removeItem: removeTask,
        loading: taskLoading,
        error: taskError,
    } = context

    console.log("useTasksContext", tasks)

    return {
        tasks,
        newTask,
        taskDetail,
        setTaskDetail,
        handleChangeNewTask,
        addTask,
        saveTaskChanges,
        removeTask,
        taskLoading,
        taskError,
    }
}*/
