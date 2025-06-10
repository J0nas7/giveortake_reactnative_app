"use client"

// Internal
import React, { createContext, useContext } from "react"

// External
import { Team, TeamFields, TeamStates } from "@/src/Types"
import { useResourceContext } from "./"

// Context for Teams
export type TeamsContextType = {
    teamsById: Team[]
    teamById: TeamStates
    teamDetail: Team | undefined
    newTeam: Team | undefined
    readTeamsByOrganisationId: (parentId: number) => Promise<void>
    readTeamById: (itemId: number) => Promise<void>
    setTeamDetail: React.Dispatch<React.SetStateAction<Team | undefined>>
    handleChangeNewTeam: (field: TeamFields, value: string) => Promise<void>
    addTeam: (parentId: number, object?: Team) => Promise<void>
    saveTeamChanges: (teamChanges: Team, parentId: number) => Promise<boolean>
    removeTeam: (itemId: number, parentId: number, redirect: string | undefined) => Promise<void>
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined)

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
    )

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
    )
}

export const useTeamsContext = () => {
    const context = useContext(TeamsContext)
    if (!context) {
        throw new Error("useTeamsContext must be used within a TeamsProvider")
    }
    return context
}
