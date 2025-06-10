"use client"

import { createContext, useContext } from "react"

import { useAxios } from "@/src/Hooks"
import { Status, StatusFields, StatusStates } from "@/src/Types"
import { useResourceContext } from "./"

// Context for Status
export type StatusContextType = {
    statusById: Status[]
    statusByIdDetail: StatusStates
    statusDetail: Status | undefined
    newStatus: Status | undefined
    readStatusByProjectId: (parentId: number) => Promise<void>
    readStatusById: (itemId: number, reply?: boolean) => Promise<any>
    setStatusDetail: React.Dispatch<React.SetStateAction<Status | undefined>>
    handleChangeNewStatus: (field: StatusFields, value: string) => Promise<void>
    addStatus: (parentId: number, object?: Status) => Promise<void>
    saveStatusChanges: (statusChanges: Status, parentId: number) => Promise<boolean>
    removeStatus: (itemId: number, parentId: number, redirect: string | undefined) => Promise<void>
    moveOrder: (statusId: number, direction: "up" | "down") => Promise<boolean>
    assignDefault: (statusId: number) => Promise<boolean>
    assignClosed: (statusId: number) => Promise<boolean>
}

const StatusContext = createContext<StatusContextType | undefined>(undefined)

export const StatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        itemsById: statusById,
        itemById: statusByIdDetail,
        newItem: newStatus,
        itemDetail: statusDetail,
        readItemsById: readStatusByProjectId,
        readItemById: readStatusById,
        setItemDetail: setStatusDetail,
        handleChangeNewItem: handleChangeNewStatus,
        addItem: addStatus,
        saveItemChanges: saveStatusChanges,
        removeItem: removeStatus,
        // loading, error could go here
    } = useResourceContext<Status, "Status_ID">(
        "status",
        "Status_ID",
        "projects"
    )

    const { httpPostWithData } = useAxios()

    const moveOrder = async (statusId: number, direction: "up" | "down") => {
        try {
            const postData = { direction }
            const data = await httpPostWithData(`statuses/${statusId}/move-order`, postData)

            if (data.message == "Status order updated successfully") return true

            throw new Error(`Failed to moveOrder`)
        } catch (error: any) {
            console.log(error.message || `An error occurred while trying moveOrder.`)
            return false
        }
    }

    const assignDefault = async (statusId: number) => {
        try {
            const data = await httpPostWithData(`statuses/${statusId}/assign-default`)

            if (data.message == "Default status assigned successfully.") return true

            throw new Error(`Failed to assignDefault`)
        } catch (error: any) {
            console.log(error.message || `An error occurred while trying assignDefault.`)
            return false
        }
    }

    const assignClosed = async (statusId: number) => {
        try {
            const data = await httpPostWithData(`statuses/${statusId}/assign-closed`)

            if (data.message == "Closed status assigned successfully.") return true

            throw new Error(`Failed to assignClosed`)
        } catch (error: any) {
            console.log(error.message || `An error occurred while trying assignClosed.`)
            return false
        }
    }

    return (
        <StatusContext.Provider value={{
            statusById,
            statusByIdDetail,
            statusDetail,
            newStatus,
            readStatusByProjectId,
            readStatusById,
            setStatusDetail,
            handleChangeNewStatus,
            addStatus,
            saveStatusChanges,
            removeStatus,
            moveOrder,
            assignDefault,
            assignClosed
        }}>
            {children}
        </StatusContext.Provider>
    )
}

export const useStatusContext = () => {
    const context = useContext(StatusContext)
    if (!context) {
        throw new Error("useStatusContext must be used within a StatusProvider")
    }
    return context
}
