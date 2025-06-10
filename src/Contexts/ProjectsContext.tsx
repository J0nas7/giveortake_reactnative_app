"use client"

// External
import React, { createContext, useContext } from "react"

// Internal
import { Project, ProjectFields, ProjectStates } from "@/src/Types"
import { useResourceContext } from "./TypeContext"

// Context for Projects
export type ProjectsContextType = {
    projectsById: Project[]
    projectById: ProjectStates
    projectDetail: Project | undefined
    newProject: Project | undefined
    readProjectsByTeamId: (parentId: number) => Promise<void>
    readProjectById: (itemId: number) => Promise<void>
    setProjectDetail: React.Dispatch<React.SetStateAction<Project | undefined>>
    handleChangeNewProject: (field: ProjectFields, value: string) => Promise<void>
    addProject: (parentId: number, object?: Project) => Promise<void>
    saveProjectChanges: (projectChanges: Project, parentId: number) => Promise<boolean>
    removeProject: (itemId: number, parentId: number, redirect: string | undefined) => Promise<void>
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

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
    )

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
    )
}

export const useProjectsContext = () => {
    const context = useContext(ProjectsContext)
    if (!context) {
        throw new Error("useProjectsContext must be used within a ProjectsProvider")
    }
    return context
}
