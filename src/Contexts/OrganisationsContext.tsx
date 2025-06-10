"use client"

// External
import React, { createContext, useContext } from "react"

// Internal
import { Organisation, OrganisationFields, OrganisationStates } from "@/src/Types"
import { useResourceContext } from "./TypeContext"

// Context for Organisations
export type OrganisationsContextType = {
    organisationsById: Organisation[]
    organisationById: OrganisationStates
    organisationDetail: Organisation | undefined
    newOrganisation: Organisation | undefined
    readOrganisationsByUserId: (parentId: number) => Promise<void>
    readOrganisationById: (itemId: number) => Promise<void>
    setOrganisationDetail: React.Dispatch<React.SetStateAction<Organisation | undefined>>
    handleChangeNewOrganisation: (field: OrganisationFields, value: string) => Promise<void>
    addOrganisation: (parentId: number, object?: Organisation) => Promise<void>
    saveOrganisationChanges: (organisationChanges: Organisation, parentId: number) => Promise<boolean>
    removeOrganisation: (itemId: number, parentId: number, redirect: string | undefined) => Promise<void>
}

const OrganisationsContext = createContext<OrganisationsContextType | undefined>(undefined)

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
    )

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
    )
}

export const useOrganisationsContext = () => {
    const context = useContext(OrganisationsContext)
    if (!context) {
        throw new Error("useOrganisationsContext must be used within a OrganisationsProvider")
    }
    return context
}
