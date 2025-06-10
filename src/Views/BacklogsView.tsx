// External
import { faLightbulb, faList } from '@fortawesome/free-solid-svg-icons'
import { NavigationProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

// Internal
import { BacklogWithSiblingsContainer } from '@/src/Components/BacklogWithSiblingsContainer'
import { useProjectsContext } from '@/src/Contexts'
import { LoadingState } from '@/src/Core-UI/LoadingState'
import useMainViewJumbotron from '@/src/Hooks/useMainViewJumbotron'
import useRoleAccess from '@/src/Hooks/useRoleAccess'
import { selectAuthUser, selectAuthUserSeatPermissions, useTypedSelector } from '@/src/Redux'
import { MainStackParamList, ProjectStates, User } from '@/src/Types'

export const BacklogsPage = () => {
    // Hooks
    const route = useRoute();
    const { handleScroll, handleFocusEffect } = useMainViewJumbotron({
        title: `Project Backlogs`,
        faIcon: faList,
        visibility: 100,
        rightIcon: faLightbulb,
        rightIconActionRoute: `Project`
    })
    const { projectById, readProjectById } = useProjectsContext()
    const { canAccessProject } = useRoleAccess(
        projectById ? projectById.team?.organisation?.User_ID : undefined,
        "project",
        projectById ? projectById.Project_ID : 0
    )
    const navigation = useNavigation<NavigationProp<MainStackParamList>>()

    // State
    const { id: projectId } = route.params as { id: string };  // Get id as projectId from route params
    const authUser = useTypedSelector(selectAuthUser)
    const parsedPermissions = useTypedSelector(selectAuthUserSeatPermissions)
    const [renderProject, setRenderProject] = useState<ProjectStates>(undefined)
    // Calculate the number of accessible backlogs for the authenticated user
    const accessibleBacklogsCount = renderProject && renderProject.backlogs?.filter(
        (backlog) =>
            authUser &&
            (
                renderProject.team?.organisation?.User_ID === authUser.User_ID ||
                parsedPermissions?.includes(`accessBacklog.${backlog.Backlog_ID}`)
            )
    ).length || 0;

    const subtitle =
        renderProject &&
        `${renderProject.Project_Name} (${accessibleBacklogsCount} backlog${accessibleBacklogsCount === 1 ? '' : 's'})`

    // Effects
    useEffect(() => { readProjectById(parseInt(projectId)) }, [projectId])
    useEffect(() => { if (projectId) setRenderProject(projectById) }, [projectById])

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
        />
    )
}

type BacklogsViewProps = {
    renderProject: ProjectStates
    authUser: User | undefined
    canAccessProject: boolean | undefined
    parsedPermissions: string[] | undefined
    subtitle: string
}

export const BacklogsView: React.FC<BacklogsViewProps> = ({
    renderProject,
    authUser,
    canAccessProject,
    parsedPermissions,
    subtitle
}) => {
    return (
        <ScrollView style={styles.pageContent}>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

            <LoadingState
                singular="Project"
                renderItem={renderProject}
                permitted={canAccessProject}
            >
                {renderProject && (
                    <>
                        {renderProject?.backlogs?.map((backlog) => {
                            const userHasAccess =
                                authUser &&
                                (renderProject.team?.organisation?.User_ID === authUser.User_ID ||
                                    parsedPermissions?.includes(`accessBacklog.${backlog.Backlog_ID}`))

                            if (!userHasAccess) return null

                            return (
                                <View style={styles.backlogItem} key={backlog.Backlog_ID}>
                                    <BacklogWithSiblingsContainer backlogId={backlog.Backlog_ID} />
                                </View>
                            )
                        })}
                    </>
                )}
            </LoadingState>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    pageContent: {
        flex: 1,
        padding: 16,
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
