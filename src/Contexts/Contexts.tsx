"use client"

// External
import React, { createContext, useContext, useState } from "react"

// Internal
import { useResourceContext } from "@/src/Hooks"
import {
    User,
    Organisation,
    Team,
    Project,
    TeamUserSeat,
    Task,
    TaskComment,
    TaskMediaFile,
    ProjectFields,
    TeamFields,
    TeamUserSeatFields,
    TaskFields,
    TaskCommentFields,
    TaskMediaFileFields,
    UserFields,
    OrganisationFields,
    TaskTimeTrack,
    TaskTimeTrackFields
} from "@/src/Types"
import {
    selectAuthUser, 
    selectAuthUserTaskTimeTrack, 
    setAuthUserTaskTimeTrack, 
    useAppDispatch, 
    useAuthActions, 
    useTypedSelector
} from "@/src/Redux";
import { useAxios } from "@/src/Hooks";

// Context for Users
export type UsersContextType = {
    usersById: User[];
    userDetail: User | undefined;
    newUser: User | undefined;
    setUserDetail: React.Dispatch<React.SetStateAction<User | undefined>>;
    handleChangeNewUser: (field: UserFields, value: string) => Promise<void>
    addUser: (parentId: number, object?: User) => Promise<void>
    saveUserChanges: (itemChanges: User, parentId: number) => Promise<void>
    removeUser: (itemId: number, parentId: number) => Promise<boolean>
    // userLoading: boolean;
    // userError: string | null;
};

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        itemsById: usersById,
        newItem: newUser,
        itemDetail: userDetail,
        setItemDetail: setUserDetail,
        handleChangeNewItem: handleChangeNewUser,
        addItem: addUser,
        saveItemChanges: saveUserChanges,
        removeItem: removeUser,
        // loading: userLoading,
        // error: userError,
    } = useResourceContext<User, "User_ID">(
        "users",
        "User_ID",
        ""
    );

    return (
        <UsersContext.Provider value={{
            usersById,
            userDetail,
            newUser,
            setUserDetail,
            handleChangeNewUser,
            addUser,
            saveUserChanges,
            removeUser,
            // userLoading,
            // userError,
        }}>
            {children}
        </UsersContext.Provider>
    );
};

export const useUsersContext = () => {
    const context = useContext(UsersContext);
    if (!context) {
        throw new Error("useUsersContext must be used within a UsersProvider");
    }
    return context;
};

// Context for Organisations
export type OrganisationsContextType = {
    organisationsById: Organisation[];
    organisationById: false | Organisation | undefined
    organisationDetail: Organisation | undefined;
    newOrganisation: Organisation | undefined;
    readOrganisationsByUserId: (parentId: number) => Promise<void>
    readOrganisationById: (itemId: number) => Promise<void>
    setOrganisationDetail: React.Dispatch<React.SetStateAction<Organisation | undefined>>;
    handleChangeNewOrganisation: (field: OrganisationFields, value: string) => Promise<void>
    addOrganisation: (parentId: number, object?: Organisation) => Promise<void>
    saveOrganisationChanges: (organisationChanges: Organisation, parentId: number) => Promise<void>
    removeOrganisation: (itemId: number, parentId: number) => Promise<boolean>
};

const OrganisationsContext = createContext<OrganisationsContextType | undefined>(undefined);

export const OrganisationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        itemsById: organisationsById,
        itemById: organisationById,
        newItem: newOrganisation,
        itemDetail: organisationDetail,
        readItemsById: readOrganisationsByUserId,
        readItemById: readOrganisationById,
        setItemDetail: setOrganisationDetail,
        handleChangeNewItem: handleChangeNewOrganisation,
        addItem: addOrganisation,
        saveItemChanges: saveOrganisationChanges,
        removeItem: removeOrganisation,
        // loading: organisationLoading,
        // error: organisationError,
    } = useResourceContext<Organisation, "Organisation_ID">(
        "organisations",
        "Organisation_ID",
        "users"
    );

    return (
        <OrganisationsContext.Provider value={{
            organisationsById,
            organisationById,
            newOrganisation,
            organisationDetail,
            readOrganisationsByUserId,
            readOrganisationById,
            setOrganisationDetail,
            handleChangeNewOrganisation,
            addOrganisation,
            saveOrganisationChanges,
            removeOrganisation,
            // organisationLoading,
            // organisationError,
        }}>
            {children}
        </OrganisationsContext.Provider>
    );
};

export const useOrganisationsContext = () => {
    const context = useContext(OrganisationsContext);
    if (!context) {
        throw new Error("useOrganisationsContext must be used within a OrganisationsProvider");
    }
    return context;
};

// Context for Teams
export type TeamsContextType = {
    teamsById: Team[];
    teamById: false | Team | undefined;
    teamDetail: Team | undefined;
    newTeam: Team | undefined;
    readTeamsByOrganisationId: (parentId: number) => Promise<void>
    readTeamById: (itemId: number) => Promise<void>
    setTeamDetail: React.Dispatch<React.SetStateAction<Team | undefined>>;
    handleChangeNewTeam: (field: TeamFields, value: string) => Promise<void>
    addTeam: (parentId: number, object?: Team) => Promise<void>
    saveTeamChanges: (teamChanges: Team, parentId: number) => Promise<void>
    removeTeam: (itemId: number, parentId: number) => Promise<boolean>
};

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export const TeamsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        itemsById: teamsById,
        itemById: teamById,
        newItem: newTeam,
        itemDetail: teamDetail,
        readItemsById: readTeamsByOrganisationId,
        readItemById: readTeamById,
        setItemDetail: setTeamDetail,
        handleChangeNewItem: handleChangeNewTeam,
        addItem: addTeam,
        saveItemChanges: saveTeamChanges,
        removeItem: removeTeam,
        // loading: teamLoading,
        // error: teamError,
    } = useResourceContext<Team, "Team_ID">(
        "teams",
        "Team_ID",
        "organisations"
    );

    return (
        <TeamsContext.Provider value={{
            teamsById,
            teamById,
            newTeam,
            teamDetail,
            readTeamsByOrganisationId,
            readTeamById,
            setTeamDetail,
            handleChangeNewTeam,
            addTeam,
            saveTeamChanges,
            removeTeam,
            // teamLoading,
            // teamError,
        }}>
            {children}
        </TeamsContext.Provider>
    );
};

export const useTeamsContext = () => {
    const context = useContext(TeamsContext);
    if (!context) {
        throw new Error("useTeamsContext must be used within a TeamsProvider");
    }
    return context;
};

// Context for Team User Seats
export type TeamUserSeatsContextType = {
    teamUserSeatsById: TeamUserSeat[];
    teamUserSeatDetail: TeamUserSeat | undefined
    newTeamUserSeat: TeamUserSeat | undefined;
    readTeamUserSeatsByTeamId: (parentId: number) => Promise<void>
    setTeamUserSeatDetail: React.Dispatch<React.SetStateAction<TeamUserSeat | undefined>>
    handleChangeNewTeamUserSeat: (field: TeamUserSeatFields, value: string) => Promise<void>
    addTeamUserSeat: (parentId: number, object?: TeamUserSeat) => Promise<void>
    saveTeamUserSeatChanges: (teamUserSeatChanges: TeamUserSeat, parentId: number) => Promise<void>
    removeTeamUserSeat: (itemId: number, parentId: number) => Promise<boolean>
};

const TeamUserSeatsContext = createContext<TeamUserSeatsContextType | undefined>(undefined);

export const TeamUserSeatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        itemsById: teamUserSeatsById,
        newItem: newTeamUserSeat,
        itemDetail: teamUserSeatDetail,
        readItemsById: readTeamUserSeatsByTeamId,
        setItemDetail: setTeamUserSeatDetail,
        handleChangeNewItem: handleChangeNewTeamUserSeat,
        addItem: addTeamUserSeat,
        saveItemChanges: saveTeamUserSeatChanges,
        removeItem: removeTeamUserSeat,
        // loading: teamUserSeatLoading,
        // error: teamUserSeatError,
    } = useResourceContext<TeamUserSeat, "Seat_ID">(
        "team-user-seats",
        "Seat_ID",
        "teams"
    );

    return (
        <TeamUserSeatsContext.Provider value={{
            teamUserSeatsById,
            teamUserSeatDetail,
            newTeamUserSeat,
            readTeamUserSeatsByTeamId,
            setTeamUserSeatDetail,
            handleChangeNewTeamUserSeat,
            addTeamUserSeat,
            saveTeamUserSeatChanges,
            removeTeamUserSeat,
            // teamUserSeatLoading,
            // teamUserSeatError,
        }}>
            {children}
        </TeamUserSeatsContext.Provider>
    );
};

export const useTeamUserSeatsContext = () => {
    const context = useContext(TeamUserSeatsContext);
    if (!context) {
        throw new Error("useTeamUserSeatsContext must be used within a TeamUserSeatsProvider");
    }
    return context;
};

// Context for Projects
export type ProjectsContextType = {
    projectsById: Project[]
    projectById: false | Project | undefined;
    projectDetail: Project | undefined
    newProject: Project | undefined;
    readProjectsByTeamId: (parentId: number) => Promise<void>
    readProjectById: (itemId: number) => Promise<void>
    setProjectDetail: React.Dispatch<React.SetStateAction<Project | undefined>>
    handleChangeNewProject: (field: ProjectFields, value: string) => Promise<void>
    addProject: (parentId: number, object?: Project) => Promise<void>
    saveProjectChanges: (projectChanges: Project, parentId: number) => Promise<void>
    removeProject: (itemId: number, parentId: number) => Promise<boolean>
};

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        itemsById: projectsById,
        itemById: projectById,
        newItem: newProject,
        itemDetail: projectDetail,
        readItemsById: readProjectsByTeamId,
        readItemById: readProjectById,
        setItemDetail: setProjectDetail,
        handleChangeNewItem: handleChangeNewProject,
        addItem: addProject,
        saveItemChanges: saveProjectChanges,
        removeItem: removeProject,
        // loading: projectLoading,
        // error: projectError,
    } = useResourceContext<Project, "Project_ID">(
        "projects",
        "Project_ID",
        "teams"
    );

    return (
        <ProjectsContext.Provider value={{
            projectsById,
            projectById,
            projectDetail,
            newProject,
            readProjectsByTeamId,
            readProjectById,
            setProjectDetail,
            handleChangeNewProject,
            addProject,
            saveProjectChanges,
            removeProject,
            // projectLoading,
            // projectError,
        }}>
            {children}
        </ProjectsContext.Provider>
    );
};

export const useProjectsContext = () => {
    const context = useContext(ProjectsContext);
    if (!context) {
        throw new Error("useProjectsContext must be used within a ProjectsProvider");
    }
    return context;
};

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
    taskById: false | Task | undefined
    taskDetail: Task | undefined
    newTask: Task | undefined
    readTasksByProjectId: (parentId: number, refresh?: boolean) => Promise<void>
    // readTaskById: (itemId: number) => Promise<void>
    setTaskDetail: React.Dispatch<React.SetStateAction<Task | undefined>>
    handleChangeNewTask: (field: TaskFields, value: string, object?: Task) => Promise<void>
    addTask: (parentId: number, object?: Task) => Promise<void>
    saveTaskChanges: (taskChanges: Task, parentId: number) => Promise<void>
    removeTask: (itemId: number, parentId: number) => Promise<boolean>
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
        readItemsById: readTasksByProjectId,
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
        "projects"
    );

    const [taskByKeys, setTaskByKeys] = useState<Task|undefined>(undefined)

    const readTaskByKeys = async (projectKey: string, taskKey: string) => {
        try {
            const data = await httpGetRequest(`taskByKeys/${projectKey}/${taskKey}`)

            if (data) {
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
                readTasksByProjectId,
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

// TaskTimeTrack Context Type
export type TaskTimeTrackContextType = {
    taskTimeTracksById: TaskTimeTrack[];
    taskTimeTrackDetail: TaskTimeTrack | undefined;
    newTaskTimeTrack: TaskTimeTrack | undefined;
    readTaskTimeTracksByTaskId: (taskId: number) => Promise<void>;
    setTaskTimeTrackDetail: React.Dispatch<React.SetStateAction<TaskTimeTrack | undefined>>;
    handleChangeNewTaskTimeTrack: (field: keyof TaskTimeTrack, value: string, object?: TaskTimeTrack | undefined) => Promise<void>;
    addTaskTimeTrack: (taskId: number, object?: TaskTimeTrack | undefined) => Promise<void>;
    saveTaskTimeTrackChanges: (taskTimeTrackChanges: TaskTimeTrack, taskId: number) => Promise<void>;
    removeTaskTimeTrack: (itemId: number, parentId: number) => Promise<boolean>
    handleTaskTimeTrack: (action: "Play" | "Stop", task: Task) => Promise<Task | undefined>
    latestUniqueTaskTimeTracksByProject: TaskTimeTrack[] | undefined
    taskTimeTracksByProjectId: TaskTimeTrack[]
    getLatestUniqueTaskTimeTracksByProject: (projectId: number) => Promise<any>
    getTaskTimeTracksByProject: (projectId: number, startTime: string, endTime: string, userIds?: string[], taskIds?: string[]) => Promise<void>
    taskTimeTracksByProjectParams: { startTime: string; endTime: string; }
};

// Create Context
const TaskTimeTrackContext = createContext<TaskTimeTrackContextType | undefined>(undefined);

// TaskTimeTrackProvider using useResourceContext
export const TaskTimeTracksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { httpGetRequest } = useAxios()
    const { readTasksByProjectId, taskDetail, setTaskDetail } = useTasksContext()
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
                const entriesArray: TaskTimeTrack[] = Object.entries(data).map(([key, value]) => value as TaskTimeTrack);

                // Now you can safely set the state
                setLatestUniqueTaskTimeTracksByProject(entriesArray);
                
                return
            }

            throw new Error(`Failed to getLatestUniqueTaskTimeTracksByProject`);
        } catch (error: any) {
            console.log(error.message || `An error occurred while trying getLatestUniqueTaskTimeTracksByProject.`);
            setLatestUniqueTaskTimeTracksByProject(undefined)
        }
    }

    const getTaskTimeTracksByProject = async (projectId: number, startTime: string, endTime: string, userIds?: string[], taskIds?: string[]) => {
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
            
            if (userIds?.length) params.push(`userIds=${JSON.stringify(userIds)}`)

            if (taskIds?.length) params.push(`taskIds=${JSON.stringify(taskIds)}`)
                
            if (params.length > 0) url += `?${params.join('&')}`
            
            const data = await httpGetRequest(url)
            
            if (!data.message) {
                setTaskTimeTracksByProjectId(data)
                return
            } else if (data.message == "No time tracks found for the criterias") {
                setTaskTimeTracksByProjectId([])
                return
            }
            
            throw new Error(`Failed to getTaskTimeTracksByProject`);
        } catch (error: any) {
            console.log(error.message || `An error occurred while trying getTaskTimeTracksByProject.`);
        }
    }

    const handleTaskTimeTrack = async (action: "Play" | "Stop", task: Task) => {
        if (!authUser) return

        if (authUser.User_ID) {
            // Prepare the task time track object
            const theNewTimeTrack: TaskTimeTrack = {
                Task_ID: task.Task_ID || 0,
                Project_ID: task.Project_ID,
                User_ID: authUser.User_ID,
                Time_Tracking_Start_Time: "", // We'll set this conditionally
                Time_Tracking_End_Time: null,
                Time_Tracking_Duration: null,
                Time_Tracking_Notes: "",
            }

            if (action === "Play") { // Start time tracking
                theNewTimeTrack.Time_Tracking_Start_Time = new Date().toISOString(); // Get the current timestamp in ISO format

                // Add the new time track (this will insert it into the database)
                await addTaskTimeTrack(theNewTimeTrack.Task_ID, theNewTimeTrack)
            } else if (action === "Stop" && taskTimeTrack) { // Stop time tracking
                // Calculate the duration
                const currentTime = new Date();
                const startTime = new Date(taskTimeTrack.Time_Tracking_Start_Time);
                const duration = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000); // Duration in seconds

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
            if (task.Project_ID) {
                await readTasksByProjectId(task.Project_ID, true)
            }

            let existingTimeTracks = task.time_tracks || [];
            // Add the new time track if it's Play action, or update if it's Stop action
            if (action === "Play") {
                console.log("Push")
                existingTimeTracks.push({
                    ...theNewTimeTrack,
                    Time_Tracking_ID: existingTimeTracks.length + 1
                });

                //dispatch(setAuthUserTaskTimeTrack(theNewTimeTrack))
                dispatch(fetchIsLoggedInStatus())
            } else if (action === "Stop" && taskTimeTrack) {
                console.log("FindIndex")
                const index = existingTimeTracks.findIndex(
                    (track) => track.Time_Tracking_ID === taskTimeTrack.Time_Tracking_ID
                );
                if (index !== -1) {
                    existingTimeTracks[index] = taskTimeTrack;
                }
                dispatch(setAuthUserTaskTimeTrack(undefined))
            }
            
            await getTaskTimeTracksByProject(
                task.Project_ID, 
                taskTimeTracksByProjectParams.startTime, 
                taskTimeTracksByProjectParams.endTime
            )

            if (taskDetail) {
                setTaskDetail({
                    ...taskDetail,
                    time_tracks: existingTimeTracks, // Update the time_tracks with the latest entry
                });
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
    );
};

// Hook for using TaskTimeTrackContext
export const useTaskTimeTrackContext = () => {
    const context = useContext(TaskTimeTrackContext);
    if (!context) {
        throw new Error("useTaskTimeTrackContext must be used within a TaskTimeTrackProvider");
    }
    return context;
};

// TaskComments Context
// Context API for TaskComments
export type TaskCommentsContextType = {
    taskCommentsById: TaskComment[]
    taskCommentDetail: TaskComment | undefined
    newTaskComment: TaskComment | undefined
    readTaskCommentsByTaskId: (parentId: number) => Promise<void>
    setTaskCommentDetail: React.Dispatch<React.SetStateAction<TaskComment | undefined>>
    handleChangeNewTaskComment: (field: TaskCommentFields, value: string, object?: TaskComment | undefined) => Promise<void>
    addTaskComment: (parentId: number, object?: TaskComment | undefined) => Promise<void>
    saveTaskCommentChanges: (taskCommentChanges: TaskComment, parentId: number) => Promise<void>
    removeTaskComment: (itemId: number, parentId: number) => Promise<boolean>
}

const TaskCommentsContext = createContext<TaskCommentsContextType | undefined>(undefined);

// TaskCommentsProvider using useResourceContext
export const TaskCommentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Use useResourceContext directly for task-comment related logic
    const {
        itemsById: taskCommentsById,
        newItem: newTaskComment,
        itemDetail: taskCommentDetail,
        readItemsById: readTaskCommentsByTaskId,
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
    );

    return (
        <TaskCommentsContext.Provider
            value={{
                taskCommentsById,
                taskCommentDetail,
                newTaskComment,
                readTaskCommentsByTaskId,
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
    );
};

export const useTaskCommentsContext = () => {
    const context = useContext(TaskCommentsContext);
    if (!context) {
        throw new Error("useTaskCommentsContext must be used within a TaskCommentsProvider");
    }
    return context;
};

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
    saveTaskMediaFileChanges: (taskMediaFileChanges: TaskMediaFile, parentId: number) => Promise<void>
    removeTaskMediaFile: (itemId: number, parentId: number) => Promise<boolean>
}

const TaskMediaFilesContext = createContext<TaskMediaFilesContextType | undefined>(undefined);

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
    );

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
    );
};

export const useTaskMediaFilesContext = () => {
    const context = useContext(TaskMediaFilesContext);
    if (!context) {
        throw new Error("useTaskMediaFilesContext must be used within a TaskMediaFilesProvider");
    }
    return context;
};
