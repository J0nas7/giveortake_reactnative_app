import { BacklogDetailsEditor, BacklogHeader, StatusListEditor, TaskSummaryCard } from '@/src/Components/Backlog';
import { Backlog, BacklogStates, MainStackParamList, Status, User } from '@/src/Types';
import { NavigationProp } from '@react-navigation/native';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

export type BacklogDetailsProps = {
    localBacklog: BacklogStates;
    newStatus: Status
    authUser?: User;
    canAccessBacklog: boolean | undefined
    canManageBacklog: boolean | undefined
    navigation: NavigationProp<MainStackParamList>
    setNewStatus: React.Dispatch<React.SetStateAction<Status>>
    handleBacklogInputChange: (name: keyof Backlog, value: string) => void
    handleBacklogChange: (field: keyof Backlog, value: string) => void;
    handleSaveBacklogChanges: () => Promise<void>;
    handleSaveStatusChanges: (status: Status) => Promise<void>
    ifEnterSaveStatus: (e: React.KeyboardEvent, status: Status) => Promise<void> | null
    handleCreateStatus: () => Promise<void>
    ifEnterCreateStatus: (e: React.KeyboardEvent) => Promise<void> | null
    handleDeleteBacklog: () => Promise<void>;
    handleMoveStatusChanges: (statusId: number, direction: "up" | "down") => Promise<void>
    handleAssignDefaultStatus: (statusId: number) => Promise<void>
    handleAssignClosedStatus: (statusId: number) => Promise<void>
    removeStatus: (itemId: number, parentId: number, redirect: string | undefined) => Promise<void>
}

export const BacklogDetails: React.FC<BacklogDetailsProps> = (props) => {
    const {
        localBacklog,
        newStatus,
        authUser,
        canAccessBacklog,
        canManageBacklog,
        navigation,
        setNewStatus,
        handleBacklogInputChange,
        handleBacklogChange,
        handleSaveBacklogChanges,
        handleSaveStatusChanges,
        ifEnterSaveStatus,
        handleCreateStatus,
        ifEnterCreateStatus,
        handleDeleteBacklog,
        handleMoveStatusChanges,
        handleAssignDefaultStatus,
        handleAssignClosedStatus,
        removeStatus
    } = props

    return (
        localBacklog && (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
            >
                <ScrollView contentContainerStyle={{ padding: 16 }}>
                    {canAccessBacklog && localBacklog && (
                        <BacklogHeader
                            canAccessBacklog={canAccessBacklog}
                            localBacklog={localBacklog}
                            navigation={navigation}
                        />
                    )}

                    {localBacklog && (
                        <BacklogDetailsEditor
                            localBacklog={localBacklog}
                            canManageBacklog={canManageBacklog}
                            handleBacklogInputChange={handleBacklogInputChange}
                            handleSaveBacklogChanges={handleSaveBacklogChanges}
                            handleDeleteBacklog={handleDeleteBacklog}
                            handleBacklogChange={handleBacklogChange}
                        />
                    )}

                    {canManageBacklog && localBacklog?.statuses && (
                        <StatusListEditor {...props} />
                    )}

                    {canAccessBacklog && localBacklog?.tasks && (
                        <TaskSummaryCard localBacklog={localBacklog} />
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        )
    )
}
