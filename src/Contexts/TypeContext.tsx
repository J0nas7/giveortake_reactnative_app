// External
import React, { createContext, useContext, useState, useEffect } from "react"

// Internal
import { useTypeAPI } from "@/hooks"
import { selectIsLoggedIn, useTypedSelector } from "@/redux"

// Generic context and provider to handle different resources like teams, tasks, organisations, etc.
export const useResourceContext = <T extends { [key: string]: any }, IDKey extends keyof T>(
    resource: string,
    idFieldName: IDKey,
    parentResource: string
) => {
    const { fetchItemsByParent, fetchItem, postItem, updateItem, deleteItem } = useTypeAPI<T, IDKey>(resource, idFieldName, parentResource)

    const [itemsById, setItemsById] = useState<T[]>([])
    const [itemById, setItemById] = useState<T | undefined | false>(undefined)
    const [newItem, setNewItem] = useState<T | undefined>(undefined)
    const [itemDetail, setItemDetail] = useState<T | undefined>(undefined)

    const readItemsById = async (parentId: number, refresh?: boolean|undefined, reply?: boolean) => {
        if (refresh) setItemsById([])

        const data = await fetchItemsByParent(parentId) // Fetch all items by parentId
        if (data) {
            if (reply) {
                return data
            } else {
                setItemsById(data)
            }
        } else if (reply) {
            return false
        }
    }

    const readItemById = async (itemId: number, reply?: boolean) => {
        const data = await fetchItem(itemId) // Fetch item by id
        if (data.code == "ERR_BAD_REQUEST" && data.name == "AxiosError") {
            if (reply) {
                return false
            } else {
                setItemById(false)
            }
        } else {
            if (reply) {
                return data
            } else {
                setItemById(data)
            }
        }
    }

    const addItem = async (parentId: number, object?: T) => {
        if (newItem || object) {
            const createdItem = await postItem(object || newItem!)
            if (createdItem) {
                const data = await fetchItemsByParent(parentId) // Refresh items from API
                if (data) {
                    setItemsById(data)
                    setNewItem(undefined)
                }
            }
        }
    }

    const handleChangeNewItem = async (field: keyof T, value: string, object?: T) => {
        if (object) {
            setNewItem((prevState) => ({
                ...prevState,
                ...object
            } as T))
        } else {
            setNewItem((prevState) => ({
                ...prevState,
                [field]: value,
            } as T))
        }
    }

    const saveItemChanges = async (itemChanges: T, parentId: number) => {
        const updatedItem = await updateItem(itemChanges)
        if (updatedItem) {
            const data = await fetchItemsByParent(parentId) // Refresh items from API

            if (data) setItemsById(data)
        }
        return updatedItem
    }

    const removeItem = async (itemId: number, parentId: number, redirect: string | undefined) => {
        const success = await deleteItem(itemId, redirect)

        const data = await fetchItemsByParent(parentId) // Refresh items after deletion
        if (data) setItemsById(data)
    }

    return {
        // loading,
        // error,
        itemsById,
        itemById,
        newItem,
        itemDetail,
        setItemDetail,
        handleChangeNewItem,
        readItemsById,
        readItemById,
        addItem,
        saveItemChanges,
        removeItem,
    }
}

//// REST OF FILE IS DEPRECATED
// Generic Provider for any resource
/*export const ResourceProvider = <T extends { [key: string]: any }, IDKey extends keyof T>({
    resource,
    idFieldName,
    children,
}: {
    resource: string
    idFieldName: IDKey
    children: React.ReactNode
}) => {
    const resourceContext = useResourceContext<T, IDKey>(resource, idFieldName, "")

    return <ResourceContext.Provider value={resourceContext}>{children}</ResourceContext.Provider>
}*/

// Create a context for any resource
//export const ResourceContext = createContext<any>(undefined)

// Custom hook to use resource context
/*export const useResource = () => {
    const context = useContext(ResourceContext)
    if (!context) {
        throw new Error("useResource must be used within a ResourceProvider")
    }
    return context
}*/
