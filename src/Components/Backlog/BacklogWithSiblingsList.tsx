import { BacklogWithSiblingsContainer } from '@/src/Components/Backlog'
import { LoadingState } from '@/src/Core-UI/LoadingState'
import { ProjectStates, User } from '@/src/Types'
import React from 'react'
import { StyleSheet, View } from 'react-native'

type WithSiblingsList = {
    renderProject: ProjectStates
    canAccessProject: boolean | undefined
    authUser: User | undefined
    parsedPermissions: string[] | undefined
    showEditToggles: boolean
    selectedTaskIds: string[]
    setSelectedTaskIds: React.Dispatch<React.SetStateAction<string[]>>
}

export const BacklogWithSiblingsList: React.FC<WithSiblingsList> = ({
    renderProject,
    canAccessProject,
    authUser,
    parsedPermissions,
    showEditToggles,
    selectedTaskIds,
    setSelectedTaskIds
}) => (
    <LoadingState
        singular="Project"
        renderItem={renderProject}
        permitted={canAccessProject}
    >
        {renderProject && renderProject?.backlogs?.map((backlog) => {
            const userHasAccess =
                authUser &&
                (renderProject.team?.organisation?.User_ID === authUser.User_ID ||
                    parsedPermissions?.includes(`accessBacklog.${backlog.Backlog_ID}`))

            if (!userHasAccess) return null

            return (
                <View style={styles.backlogItem} key={backlog.Backlog_ID}>
                    <BacklogWithSiblingsContainer
                        backlogId={backlog.Backlog_ID}
                        showEditToggles={showEditToggles}
                        selectedTaskIds={selectedTaskIds}
                        setSelectedTaskIds={setSelectedTaskIds}
                    />
                </View>
            )
        })}
    </LoadingState>
)

const styles = StyleSheet.create({
    backlogItem: {
        marginBottom: 28,
    },
})
