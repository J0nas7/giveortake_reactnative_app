// External

// Internal
import { selectAuthUser, selectAuthUserSeatPermissions, useTypedSelector } from '@/src/Redux'

const useRoleAccess = (
    organisationOwnerId: number | undefined,
    contextType?: string,
    contextId?: number
) => {
    // Hooks
    // const { teamById } = useTeamsContext()

    // State
    const authUser = useTypedSelector(selectAuthUser) // Redux
    const parsedPermissions = useTypedSelector(selectAuthUserSeatPermissions) ?? []

    const canModifyOrganisationSettings = (authUser && (
        organisationOwnerId === authUser.User_ID ||
        parsedPermissions?.includes("Modify Organisation Settings")
    ))

    const canModifyTeamSettings = (authUser && (
        organisationOwnerId === authUser.User_ID ||
        parsedPermissions?.includes("Modify Team Settings")
    ))

    const canManageTeamMembers = (authUser && (
        organisationOwnerId === authUser.User_ID ||
        parsedPermissions?.includes("Manage Team Members")
    ))

    const canAccessProject = (authUser && contextType === "project" && (
        organisationOwnerId === authUser.User_ID ||
        parsedPermissions?.includes(`accessProject.${contextId}`)
    ))

    const canManageProject = (authUser && contextType === "project" && (
        organisationOwnerId === authUser.User_ID ||
        parsedPermissions?.includes(`manageProject.${contextId}`)
    ))

    const canAccessBacklog = (authUser && contextType === "backlog" && (
        organisationOwnerId === authUser.User_ID ||
        parsedPermissions?.includes(`accessBacklog.${contextId}`)
    ))

    const canManageBacklog = (authUser && contextType === "backlog" && (
        organisationOwnerId === authUser.User_ID ||
        parsedPermissions?.includes(`manageBacklog.${contextId}`)
    ))

    return {
        canModifyOrganisationSettings,
        canModifyTeamSettings,
        canManageTeamMembers,
        canAccessProject,
        canManageProject,
        canAccessBacklog,
        canManageBacklog
    }
}

export default useRoleAccess
