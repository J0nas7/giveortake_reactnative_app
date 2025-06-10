"use client"

// External
import React, { createContext, useContext } from "react";

// Internal
import { useAxios } from "@/src/Hooks";
import { Backlog, BacklogFields, BacklogStates } from "@/src/Types";
import { useResourceContext } from "./TypeContext";

// Context for Backlogs
export type BacklogsContextType = {
    backlogsById: Backlog[]
    backlogById: BacklogStates;
    backlogDetail: Backlog | undefined;
    newBacklog: Backlog | undefined;
    readBacklogsByProjectId: (parentId: number) => Promise<void>;
    readBacklogById: (itemId: number, reply?: boolean) => Promise<any>
    setBacklogDetail: React.Dispatch<React.SetStateAction<Backlog | undefined>>;
    handleChangeNewBacklog: (field: BacklogFields, value: string) => Promise<void>;
    addBacklog: (parentId: number, object?: Backlog) => Promise<void>;
    saveBacklogChanges: (backlogChanges: Backlog, parentId: number) => Promise<boolean>
    removeBacklog: (itemId: number, parentId: number, redirect: string | undefined) => Promise<void>
    finishBacklog: (backlogId: string, moveAction: string, newBacklog: Backlog) => Promise<false | {
        id: any;
        name: any;
    }>
};

const BacklogsContext = createContext<BacklogsContextType | undefined>(undefined);

export const BacklogsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        itemsById: backlogsById,
        itemById: backlogById,
        newItem: newBacklog,
        itemDetail: backlogDetail,
        readItemsById: readBacklogsByProjectId,
        readItemById: readBacklogById,
        setItemDetail: setBacklogDetail,
        handleChangeNewItem: handleChangeNewBacklog,
        addItem: addBacklog,
        saveItemChanges: saveBacklogChanges,
        removeItem: removeBacklog,
        // loading, error could go here
    } = useResourceContext<Backlog, "Backlog_ID">(
        "backlogs",
        "Backlog_ID",
        "projects"
    );

    const { httpPostWithData } = useAxios()

    const finishBacklog = async (backlogId: string, moveAction: string, newBacklog: Backlog) => {
        try {
            const postData = { moveAction, ...newBacklog }
            console.log("finishBacklog", postData)
            const data = await httpPostWithData(`finish-backlog/${backlogId}`, postData)

            if (data.target_backlog_id) {
                return {
                    id: data.target_backlog_id,
                    name: data.target_backlog_name
                }
            }

            throw new Error(`Failed to finishBacklog`);
        } catch (error: any) {
            console.log(error.message || `An error occurred while trying finishBacklog.`);
            return false
        }
    }

    return (
        <BacklogsContext.Provider value={{
            backlogsById,
            backlogById,
            backlogDetail,
            newBacklog,
            readBacklogsByProjectId,
            readBacklogById,
            setBacklogDetail,
            handleChangeNewBacklog,
            addBacklog,
            saveBacklogChanges,
            removeBacklog,
            finishBacklog
        }}>
            {children}
        </BacklogsContext.Provider>
    );
};

export const useBacklogsContext = () => {
    const context = useContext(BacklogsContext);
    if (!context) {
        throw new Error("useBacklogsContext must be used within a BacklogsProvider");
    }
    return context;
};
