"use client"

// External
import React, { createContext, useContext, useState } from "react"

// Internal
import { useAxios } from "@/hooks"
import { selectAuthUser, selectAuthUserTaskTimeTrack, setAuthUserTaskTimeTrack, useAppDispatch, useAuthActions, useTypedSelector } from "@/redux"
import { Task, TaskTimeTrack } from "@/types"
import { useResourceContext, useTasksContext } from "./"

// TaskTimeTrack Context Type
export type TaskTimeTrackContextType = {
    taskTimeTracksById: TaskTimeTrack[]
    taskTimeTrackDetail: TaskTimeTrack | undefined
    newTaskTimeTrack: TaskTimeTrack | undefined
    readTaskTimeTracksByTaskId: (taskId: number) => Promise<void>
    setTaskTimeTrackDetail: React.Dispatch<React.SetStateAction<TaskTimeTrack | undefined>>
    handleChangeNewTaskTimeTrack: (field: keyof TaskTimeTrack, value: string, object?: TaskTimeTrack | undefined) => Promise<void>
    addTaskTimeTrack: (taskId: number, object?: TaskTimeTrack | undefined) => Promise<void>
    saveTaskTimeTrackChanges: (taskTimeTrackChanges: TaskTimeTrack, taskId: number) => Promise<boolean>
    removeTaskTimeTrack: (itemId: number, parentId: number, redirect: string | undefined) => Promise<void>
    handleTaskTimeTrack: (action: "Play" | "Stop", task: Task) => Promise<Task | undefined>
    latestUniqueTaskTimeTracksByProject: TaskTimeTrack[] | undefined
    taskTimeTracksByProjectId: TaskTimeTrack[]
    getLatestUniqueTaskTimeTracksByProject: (projectId: number) => Promise<any>
    getTaskTimeTracksByProject: (projectId: number, startTime: string, endTime: string, backlogIds?: string[], userIds?: string[], taskIds?: string[]) => Promise<void>
    taskTimeTracksByProjectParams: { startTime: string, endTime: string }
}

// Create Context
const TaskTimeTrackContext = createContext<TaskTimeTrackContextType | undefined>(undefined)

// TaskTimeTrackProvider using useResourceContext
export const TaskTimeTracksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { httpGetRequest } = useAxios()
    const { readTasksByBacklogId, taskDetail, setTaskDetail } = useTasksContext()
    const { fetchIsLoggedInStatus } = useAuthActions()
    const dispatch = useAppDispatch()

    const authUser = useTypedSelector(selectAuthUser)
    const taskTimeTrack = useTypedSelector(selectAuthUserTaskTimeTrack)

    // Use useResourceContext directly for task-time-track related logic
    const {
        itemsById: taskTimeTracksById,
        newItem: newTaskTimeTrack,
        itemDetail: taskTimeTrackDetail,
        readItemsById: readTaskTimeTracksByTaskId,
        setItemDetail: setTaskTimeTrackDetail,
        handleChangeNewItem: handleChangeNewTaskTimeTrack,
        addItem: addTaskTimeTrack,
        saveItemChanges: saveTaskTimeTrackChanges,
        removeItem: removeTaskTimeTrack,
    } = useResourceContext<TaskTimeTrack, "Time_Tracking_ID">(
        "task-time-tracks",
        "Time_Tracking_ID",
        "tasks"
    )

    const [latestUniqueTaskTimeTracksByProject, setLatestUniqueTaskTimeTracksByProject] = useState<TaskTimeTrack[] | undefined>(undefined)
    const [taskTimeTracksByProjectId, setTaskTimeTracksByProjectId] = useState<TaskTimeTrack[]>([])
    const [taskTimeTracksByProjectParams, setTaskTimeTracksByProjectParams] = useState<{
        startTime: string, endTime: string
    }>({
        startTime: '',
        endTime: ''
    })

    const getLatestUniqueTaskTimeTracksByProject = async (projectId: number) => {
        try {
            // : APIResponse<T[]>
            const data = await httpGetRequest(`projects/${projectId}/latest-task-time-tracks`)

            if (data) {
                // Assuming 'data' is the object with task time tracks
                const entriesArray: TaskTimeTrack[] = Object.entries(data).map(([key, value]) => value as TaskTimeTrack)

                // Now you can safely set the state
                setLatestUniqueTaskTimeTracksByProject(entriesArray)

                return
            }

            throw new Error(`Failed to getLatestUniqueTaskTimeTracksByProject`)
        } catch (error: any) {
            console.log(error.message || `An error occurred while trying getLatestUniqueTaskTimeTracksByProject.`)
            setLatestUniqueTaskTimeTracksByProject(undefined)
        }
    }

    const getTaskTimeTracksByProject = async (
        projectId: number,
        startTime: string,
        endTime: string,
        backlogIds?: string[],
        userIds?: string[],
        taskIds?: string[]
    ) => {
        try {
            // Build the URL with optional query parameters for startTime end endTime
            let url = `projects/${projectId}/task-time-tracks`

            // Append query parameters if provided
            const params: string[] = []
            if (startTime && endTime) {
                params.push(`startTime=${encodeURIComponent(startTime)}`)
                params.push(`endTime=${encodeURIComponent(endTime)}`)
                setTaskTimeTracksByProjectParams({ startTime, endTime })
            }

            if (backlogIds?.length) params.push(`backlogIds=${JSON.stringify(backlogIds)}`)

            if (userIds?.length) params.push(`userIds=${JSON.stringify(userIds)}`)

            if (taskIds?.length) params.push(`taskIds=${JSON.stringify(taskIds)}`)

            if (params.length > 0) url += `?${params.join('&')}`

            const data = await httpGetRequest(url)
            console.log("data", params, data)

            if (!data.message) {
                setTaskTimeTracksByProjectId(data.data)
                return
            } else if (data.message == "No time tracks found for the criterias") {
                setTaskTimeTracksByProjectId([])
                return
            }

            throw new Error(`Failed to getTaskTimeTracksByProject`)
        } catch (error: any) {
            console.log(error.message || `An error occurred while trying getTaskTimeTracksByProject.`)
        }
    }

    const handleTaskTimeTrack = async (action: "Play" | "Stop", task: Task) => {
        if (!authUser) return

        if (authUser.User_ID) {
            // Prepare the task time track object
            const theNewTimeTrack: TaskTimeTrack = {
                Task_ID: task.Task_ID || 0,
                Backlog_ID: task.Backlog_ID,
                User_ID: authUser.User_ID,
                Time_Tracking_Start_Time: "", // We'll set this conditionally
                Time_Tracking_End_Time: null,
                Time_Tracking_Duration: null,
                Time_Tracking_Notes: "",
            }

            if (action === "Play") { // Start time tracking
                theNewTimeTrack.Time_Tracking_Start_Time = new Date().toISOString() // Get the current timestamp in ISO format

                // Add the new time track (this will insert it into the database)
                await addTaskTimeTrack(theNewTimeTrack.Task_ID, theNewTimeTrack)
            } else if (action === "Stop" && taskTimeTrack) { // Stop time tracking
                // Calculate the duration
                const currentTime = new Date()
                const startTime = new Date(taskTimeTrack.Time_Tracking_Start_Time)
                const duration = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000) // Duration in seconds

                // Update the time track to stop it and calculate the duration
                const updatedTimeTrack: TaskTimeTrack = {
                    ...taskTimeTrack,
                    Time_Tracking_End_Time: currentTime.toISOString(),
                    Time_Tracking_Duration: duration
                }

                // Update the time tracking record in the database
                await (task.Task_ID && saveTaskTimeTrackChanges(updatedTimeTrack, task.Task_ID))
            }

            /// Task changed
            if (task.Backlog_ID) {
                await readTasksByBacklogId(task.Backlog_ID, true)
            }

            let existingTimeTracks = task.time_tracks || []
            // Add the new time track if it's Play action, or update if it's Stop action
            if (action === "Play") {
                console.log("Push")
                existingTimeTracks.push({
                    ...theNewTimeTrack,
                    Time_Tracking_ID: existingTimeTracks.length + 1
                })

                //dispatch(setAuthUserTaskTimeTrack(theNewTimeTrack))
                dispatch(fetchIsLoggedInStatus())
            } else if (action === "Stop" && taskTimeTrack) {
                console.log("FindIndex")
                const index = existingTimeTracks.findIndex(
                    (track) => track.Time_Tracking_ID === taskTimeTrack.Time_Tracking_ID
                )
                if (index !== -1) {
                    existingTimeTracks[index] = taskTimeTrack
                }
                dispatch(setAuthUserTaskTimeTrack(undefined))
            }

            await getTaskTimeTracksByProject(
                task.backlog?.Project_ID || 0,
                taskTimeTracksByProjectParams.startTime,
                taskTimeTracksByProjectParams.endTime
            )

            if (taskDetail) {
                setTaskDetail({
                    ...taskDetail,
                    time_tracks: existingTimeTracks, // Update the time_tracks with the latest entry
                })
            } else {
                return {
                    ...task,
                    time_tracks: existingTimeTracks, // Update the time_tracks with the latest entry
                }
            }
        }
    }

    return (
        <TaskTimeTrackContext.Provider
            value={{
                // Default props from useResourceContext
                taskTimeTracksById,
                taskTimeTrackDetail,
                newTaskTimeTrack,
                readTaskTimeTracksByTaskId,
                setTaskTimeTrackDetail,
                handleChangeNewTaskTimeTrack,
                addTaskTimeTrack,
                saveTaskTimeTrackChanges,
                removeTaskTimeTrack,

                // My custom props
                handleTaskTimeTrack,
                latestUniqueTaskTimeTracksByProject,
                taskTimeTracksByProjectId,
                getLatestUniqueTaskTimeTracksByProject,
                getTaskTimeTracksByProject,
                taskTimeTracksByProjectParams
            }}
        >
            {children}
        </TaskTimeTrackContext.Provider>
    )
}

// Hook for using TaskTimeTrackContext
export const useTaskTimeTrackContext = () => {
    const context = useContext(TaskTimeTrackContext)
    if (!context) {
        throw new Error("useTaskTimeTrackContext must be used within a TaskTimeTrackProvider")
    }
    return context
}
