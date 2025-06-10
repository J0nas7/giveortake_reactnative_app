"use client"

// External
import { usePathname } from "next/navigation";
import React, { createContext, useContext, useState } from "react";

// Internal
import { useAxios, useTypeAPI } from "@/hooks";
import { Role, TeamUserSeat, TeamUserSeatFields } from "@/types";
import { useResourceContext } from "./";

// Context for Team User Seats
export type TeamUserSeatsContextType = {
    teamUserSeatsById: TeamUserSeat[];
    teamUserSeatDetail: TeamUserSeat | undefined
    newTeamUserSeat: TeamUserSeat | undefined;
    readTeamUserSeatsByTeamId: (parentId: number) => Promise<void>
    setTeamUserSeatDetail: React.Dispatch<React.SetStateAction<TeamUserSeat | undefined>>
    handleChangeNewTeamUserSeat: (field: TeamUserSeatFields, value: string) => Promise<void>
    addTeamUserSeat: (parentId: number, object?: TeamUserSeat) => Promise<void>
    saveTeamUserSeatChanges: (teamUserSeatChanges: TeamUserSeat, parentId: number) => Promise<boolean>
    removeTeamUserSeat: (itemId: number, parentId: number, redirect: string | undefined) => Promise<void>
    rolesAndPermissionsByTeamId: Role[] | undefined
    readRolesAndPermissionsByTeamId: (teamId: number) => Promise<boolean>
    removeRolesAndPermissionsByRoleId: (itemId: number, parentId: number) => Promise<void>
    addRole: (parentId: number, object?: Role | undefined) => Promise<void>
    saveTeamRoleChanges: (itemChanges: Role, parentId: number) => Promise<boolean>
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
    )

    const { httpGetRequest } = useAxios()
    const pathname = usePathname()

    const { postItem: postRole, updateItem: updateRole, deleteItem: deleteRole } = useTypeAPI<Role, "Role_ID">("team-roles", "Role_ID", "teams")

    const [rolesAndPermissionsByTeamId, setRolesAndPermissionsByTeamId] = useState<Role[] | undefined>(undefined)

    const readRolesAndPermissionsByTeamId = async (teamId: number) => {
        try {
            const data = await httpGetRequest(`teams/${teamId}/team-roles-permissions`)

            if (!data.message) {
                setRolesAndPermissionsByTeamId(data)
                return true
            }

            throw new Error(`Failed to readRolesAndPermissionsByTeamId`);
        } catch (error: any) {
            console.log(error.message || `An error occurred while trying readRolesAndPermissionsByTeamId.`);
            return false
        }
    }

    const removeRolesAndPermissionsByRoleId = async (itemId: number, parentId: number) => await deleteRole(itemId, pathname)

    const addRole = async (parentId: number, object?: Role | undefined) => {
        console.log("new role", object)
        if (object) await postRole(object)

        await readRolesAndPermissionsByTeamId(parentId) // Refresh items after create
    }

    const saveTeamRoleChanges = async (itemChanges: Role, parentId: number) => {
        console.log("itemChanges", itemChanges)
        const updatedItem = await updateRole(itemChanges)

        if (updatedItem) await readRolesAndPermissionsByTeamId(parentId) // Refresh items after update

        return updatedItem
    }

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
            rolesAndPermissionsByTeamId,
            readRolesAndPermissionsByTeamId,
            removeRolesAndPermissionsByRoleId,
            addRole,
            saveTeamRoleChanges
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
