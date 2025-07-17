import { BacklogsHeader, BacklogWithSiblingsList } from '@/src/Components/Backlog'
import { TaskBulkActionMenu } from '@/src/Components/TaskBulkActionMenu'
import { ProjectStates, User } from '@/src/Types'
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native'

export type BacklogsProps = {
    renderProject: ProjectStates
    authUser: User | undefined
    canAccessProject: boolean | undefined
    parsedPermissions: string[] | undefined
    subtitle: string
    showEditToggles: boolean
    setShowEditToggles: (value: boolean) => void
    selectedTaskIds: string[]
    setSelectedTaskIds: React.Dispatch<React.SetStateAction<string[]>>
    backlogsViewRefresh: () => Promise<void>
    backlogsViewRefreshing: boolean
}

export const Backlogs: React.FC<BacklogsProps> = ({
    renderProject,
    authUser,
    canAccessProject,
    parsedPermissions,
    subtitle,
    showEditToggles,
    setShowEditToggles,
    selectedTaskIds,
    setSelectedTaskIds,
    backlogsViewRefresh,
    backlogsViewRefreshing
}) => (
    <View style={{ flex: 1, position: 'relative' }}>
        {renderProject && (
            <TaskBulkActionMenu
                renderProject={renderProject}
                selectedTaskIds={selectedTaskIds}
                setSelectedTaskIds={setSelectedTaskIds}
                backlogsViewRefresh={backlogsViewRefresh}
            />
        )}
        <ScrollView
            style={styles.pageContent}
            refreshControl={
                <RefreshControl
                    refreshing={backlogsViewRefreshing}
                    onRefresh={backlogsViewRefresh}
                />
            }
        >
            {!backlogsViewRefreshing && (
                <>
                    <BacklogsHeader
                        subtitle={subtitle}
                        showEditToggles={showEditToggles}
                        setShowEditToggles={setShowEditToggles}
                    />

                    <BacklogWithSiblingsList
                        renderProject={renderProject}
                        canAccessProject={canAccessProject}
                        authUser={authUser}
                        parsedPermissions={parsedPermissions}
                        showEditToggles={showEditToggles}
                        selectedTaskIds={selectedTaskIds}
                        setSelectedTaskIds={setSelectedTaskIds}
                    />
                </>
            )}
        </ScrollView>
    </View>
)

const styles = StyleSheet.create({
    pageContent: {
        flex: 1,
        padding: 16
    }
})
