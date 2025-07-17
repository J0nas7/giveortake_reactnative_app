// External
import { faLightbulb, faList } from '@fortawesome/free-solid-svg-icons'
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

// Internal
import { Backlogs, BacklogsProps } from '@/src/Components/Backlog'
import { useProjectsContext } from '@/src/Contexts'
import useMainViewJumbotron from '@/src/Hooks/useMainViewJumbotron'
import useRoleAccess from '@/src/Hooks/useRoleAccess'
import { selectAuthUser, selectAuthUserSeatPermissions, useTypedSelector } from '@/src/Redux'
import { MainStackParamList } from '@/src/Types'

export const BacklogsView = () => {
    // ---- Hooks ----
    const route = useRoute<RouteProp<MainStackParamList, 'Backlogs'>>();
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

    // ---- State ----
    const projectId = route.params.id  // Get id as projectId from route params
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

    const backlogsProps: BacklogsProps = {
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
    }

    return <Backlogs {...backlogsProps} />
}
