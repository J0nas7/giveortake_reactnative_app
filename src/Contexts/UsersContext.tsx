"use client"

// External
import React, { createContext, useContext } from "react";

// Internal
import { User, UserFields } from "@/src/Types";
import { useResourceContext } from "./";

// Context for Users
export type UsersContextType = {
    usersById: User[];
    userDetail: User | undefined;
    newUser: User | undefined;
    setUserDetail: React.Dispatch<React.SetStateAction<User | undefined>>;
    handleChangeNewUser: (field: UserFields, value: string) => Promise<void>
    addUser: (parentId: number, object?: User) => Promise<void>
    saveUserChanges: (itemChanges: User, parentId: number) => Promise<boolean>
    removeUser: (itemId: number, parentId: number, redirect: string | undefined) => Promise<void>
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
}
