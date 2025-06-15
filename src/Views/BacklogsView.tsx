// External
import { faLightbulb, faList } from '@fortawesome/free-solid-svg-icons'
import { NavigationProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { RefreshControl, ScrollView } from 'react-native-gesture-handler'

// Internal
import { BacklogWithSiblingsContainer } from '@/src/Components/BacklogWithSiblingsContainer'
import { TaskBulkActionMenu } from '@/src/Components/TaskBulkActionMenu'
import { useProjectsContext } from '@/src/Contexts'
import { LoadingState } from '@/src/Core-UI/LoadingState'
import useMainViewJumbotron from '@/src/Hooks/useMainViewJumbotron'
import useRoleAccess from '@/src/Hooks/useRoleAccess'
import { selectAuthUser, selectAuthUserSeatPermissions, useTypedSelector } from '@/src/Redux'
import { MainStackParamList, ProjectStates, User } from '@/src/Types'

export const BacklogsPage = () => {
    // ---- Hooks ----
    const route = useRoute();
    const {
        projectById: renderProject,
        readProjectById
    } = useProjectsContext()
    const { handleScroll, handleFocusEffect } = useMainViewJumbotron({
        title: `Project Backlogs`,
        faIcon: faList,
        visibility: 100,
        rightIcon: faLightbulb,
        rightIconActionRoute: "Project",
        rightIconActionParams: { id: ((renderProject && renderProject.Project_ID) ?? "").toString() },
    })
    const { canAccessProject } = useRoleAccess(
        renderProject ? renderProject.team?.organisation?.User_ID : undefined,
        "project",
        renderProject ? renderProject.Project_ID : 0
    )
    const navigation = useNavigation<NavigationProp<MainStackParamList>>()

    // ---- State ----
    const { id: projectId } = route.params as { id: string };  // Get id as projectId from route params
    const authUser = useTypedSelector(selectAuthUser)
    const parsedPermissions = useTypedSelector(selectAuthUserSeatPermissions)
    const [showEditToggles, setShowEditToggles] = useState<boolean>(false)
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
    const [backlogsViewRefreshing, setBacklogsViewRefreshing] = useState<boolean>(false)

    // ---- Methods ----
    const backlogsViewRefresh = async () => {
        setBacklogsViewRefreshing(true)
        await readProjectById(parseInt(projectId))
        setBacklogsViewRefreshing(false)
    }

    // ---- Memoized Values ----

    // Calculate the number of accessible backlogs for the authenticated user
    const accessibleBacklogsCount = useMemo(() => {
        if (!renderProject || !renderProject.backlogs) return 0;
        return renderProject.backlogs.filter(
            (backlog) =>
                authUser &&
                (
                    renderProject.team?.organisation?.User_ID === authUser.User_ID ||
                    parsedPermissions?.includes(`accessBacklog.${backlog.Backlog_ID}`)
                )
        ).length;
    }, [renderProject, authUser, parsedPermissions]);

    const subtitle = useMemo(() => {
        if (!renderProject) return '';
        return `${renderProject.Project_Name} (${accessibleBacklogsCount} backlog${accessibleBacklogsCount === 1 ? '' : 's'})`;
    }, [renderProject, accessibleBacklogsCount]);

    // ---- Effects ----
    useEffect(() => { readProjectById(parseInt(projectId)) }, [projectId])

    useFocusEffect(
        useCallback(() => {
            handleFocusEffect()
        }, [])
    )

    return (
        <BacklogsView
            renderProject={renderProject}
            authUser={authUser}
            canAccessProject={canAccessProject}
            parsedPermissions={parsedPermissions}
            subtitle={subtitle || ''}
            showEditToggles={showEditToggles}
            setShowEditToggles={setShowEditToggles}
            selectedTaskIds={selectedTaskIds}
            setSelectedTaskIds={setSelectedTaskIds}
            backlogsViewRefresh={backlogsViewRefresh}
            backlogsViewRefreshing={backlogsViewRefreshing}
        />
    )
}

type BacklogsViewProps = {
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

export const BacklogsView: React.FC<BacklogsViewProps> = ({
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
                    <TouchableOpacity onPress={() => setShowEditToggles(!showEditToggles)}>
                        <Text style={{ color: 'blue', fontSize: 16 }}>{showEditToggles ? "OK" : "Edit"}</Text>
                    </TouchableOpacity>

                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

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
                </>
            )}
        </ScrollView>
    </View>
)

const styles = StyleSheet.create({
    pageContent: {
        flex: 1,
        padding: 16
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 12,
    },
    backlogItem: {
        marginBottom: 28,
    },
})
