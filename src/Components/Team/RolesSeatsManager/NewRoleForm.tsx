import { editorStyles, ModalToggler } from '@/src/Components/ModalToggler'
import { RoleFormStyles, TeamRolesSeatsViewStyles, TeamRolesSeatsViewStyles2 } from '@/src/Components/Team'
import { setSnackMessage, useAppDispatch } from '@/src/Redux'
import { Backlog, Permission, Project, Role, RoleFields, Team } from '@/src/Types'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { TFunction } from 'i18next'
import { useState } from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

type NewRoleFormProps = {
    renderTeam: Team
    teamId: string
    t: TFunction
    rolesAndPermissionsByTeamId: Role[] | undefined
    displayNewRoleForm: boolean
    availablePermissions: string[]
    addRole: (parentId: number, object?: Role | undefined) => Promise<void>
    readRolesAndPermissionsByTeamId: (teamId: number) => Promise<boolean>
    setSelectedRole: React.Dispatch<React.SetStateAction<Role | undefined>>
    setDisplayNewRoleForm: React.Dispatch<React.SetStateAction<boolean>>
    togglerIsVisible: string | false
    setTogglerIsVisible: React.Dispatch<React.SetStateAction<string | false>>
}

export const NewRoleForm: React.FC<NewRoleFormProps> = ({
    renderTeam,
    teamId,
    t,
    rolesAndPermissionsByTeamId,
    displayNewRoleForm,
    availablePermissions,
    addRole,
    readRolesAndPermissionsByTeamId,
    setSelectedRole,
    setDisplayNewRoleForm,
    togglerIsVisible,
    setTogglerIsVisible
}) => {
    // Hooks
    const dispatch = useAppDispatch();

    // State
    const [newRole, setRole] = useState<Role>({
        Team_ID: parseInt(teamId),
        Role_Name: ""
    });

    // Handles changes to a specific field of the selected team user seat.
    const handleRoleChange = (field: RoleFields, value: string) => {
        if (newRole) {
            setRole((prevRole) => ({
                ...prevRole!,
                [field]: value,
            }));
        }
    };

    // Toggles a permission for the selected seat by adding or removing it from the permissions list.
    const togglePermission = async (permission: string, isChecked: boolean) => {
        setRole((prevRole) => {
            if (!prevRole) return prevRole

            const currentPermissions = prevRole.permissions || []

            const isAlreadyIncluded = currentPermissions.some(p => p.Permission_Key === permission)

            let updatedPermissions: Permission[]

            if (isChecked) {
                // Add permission if not already included
                if (!isAlreadyIncluded) {
                    const newPermission: Permission = {
                        Permission_Key: permission,
                        Team_ID: parseInt(teamId)
                    }
                    updatedPermissions = [...currentPermissions, newPermission]
                } else {
                    updatedPermissions = currentPermissions
                }
            } else {
                // Remove the permission
                updatedPermissions = currentPermissions.filter(p => p.Permission_Key !== permission)
            }

            console.log("updatedPermissions", isChecked, permission, updatedPermissions)

            return { ...prevRole, permissions: updatedPermissions }
        })
    }

    const handleCreateRole = async () => {
        try {
            // Send a request to create the new seat for the user
            await addRole(newRole.Team_ID, newRole);

            // Refresh seats list
            await readRolesAndPermissionsByTeamId(parseInt(teamId))

            // Show success message
            dispatch(setSnackMessage("Role created"))
            setDisplayNewRoleForm(false)

            // router.push("?") TODO
        } catch (err) {
            console.error("Failed to create role:", err);
        }
    }

    return (
        <>
            <ScrollView style={TeamRolesSeatsViewStyles.container}>
                <View style={editorStyles.rowBetween}>
                    <TouchableOpacity onPress={() => setDisplayNewRoleForm(false)}>
                        <FontAwesomeIcon icon={faChevronLeft} size={20} />
                    </TouchableOpacity>
                    <Text style={editorStyles.title}>
                        {t('team:rolesSeatsManager:createNewRole')}
                    </Text>
                </View>

                <View style={editorStyles.formGroup}>
                    <Text style={editorStyles.label}>Role Name</Text>
                    <TouchableOpacity
                        style={editorStyles.formGroupItemToggler}
                        onPress={() => setTogglerIsVisible("RoleName")}
                    >
                        <Text>{newRole.Role_Name}</Text>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </TouchableOpacity>
                </View>

                <View style={editorStyles.formGroup}>
                    <Text style={editorStyles.label}>Permissions</Text>
                    <TouchableOpacity
                        style={editorStyles.formGroupItemToggler}
                        onPress={() => setTogglerIsVisible("RolePermissions")}
                    >
                        <Text>{newRole.permissions?.length} permissions</Text>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </TouchableOpacity>
                </View>

                <View style={RoleFormStyles.buttonRow}>
                    <TouchableOpacity style={RoleFormStyles.button} onPress={handleCreateRole}>
                        <Text style={RoleFormStyles.buttonText}>{t('team:rolesSeatsManager:createRole')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <ModalToggler visibility={togglerIsVisible} callback={setTogglerIsVisible}>
                {displayNewRoleForm && (
                    <>
                        {togglerIsVisible === "RoleName" ? (
                            <TextInput
                                style={TeamRolesSeatsViewStyles2.input}
                                value={newRole.Role_Name}
                                onChangeText={(value) => handleRoleChange('Role_Name', value)}
                            />
                        ) : togglerIsVisible === "RolePermissions" ? (
                            <>
                                <Text style={[editorStyles.label, { marginTop: 16 }]}>
                                    {t('team:rolesSeatsManager:permissions')}
                                </Text>

                                {availablePermissions.map((permission) => {
                                    const isPermissionActive = newRole.permissions?.find(perm => perm.Permission_Key === permission)
                                    return (
                                        <TouchableOpacity
                                            key={permission}
                                            style={RoleFormStyles.permissionItem}
                                            onPress={() => togglePermission(
                                                permission,
                                                !isPermissionActive
                                            )}
                                        >
                                            <Text style={{ color: isPermissionActive ? '#007bff' : '#000' }}>
                                                {permission}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                })}

                                {renderTeam?.projects?.map((project: Project) => {
                                    const checkedAccess = newRole.permissions ?
                                        newRole.permissions.filter(permission =>
                                            `accessProject.${project.Project_ID}` === permission.Permission_Key
                                        ).length > 0 : false
                                    const checkedManage = newRole.permissions ?
                                        newRole.permissions.filter(permission =>
                                            `manageProject.${project.Project_ID}` === permission.Permission_Key
                                        ).length > 0 : false

                                    const permissions = [
                                        {
                                            key1: `accessProject.${project.Project_ID}`,
                                            label1: `Access Project: ${project.Project_Name}`,
                                            checked1: checkedAccess,
                                            key2: `manageProject.${project.Project_ID}`,
                                            label2: `Manage Project: ${project.Project_Name}`,
                                            checked2: checkedManage,
                                        }
                                    ];

                                    project.backlogs?.map((backlog: Backlog) => {
                                        const checkedAccess = newRole.permissions ?
                                            newRole.permissions.filter(permission =>
                                                `accessBacklog.${backlog.Backlog_ID}` === permission.Permission_Key
                                            ).length > 0 : false
                                        const checkedManage = newRole.permissions ?
                                            newRole.permissions.filter(permission =>
                                                `manageBacklog.${backlog.Backlog_ID}` === permission.Permission_Key
                                            ).length > 0 : false

                                        permissions.push(
                                            {
                                                key1: `accessBacklog.${backlog.Backlog_ID}`,
                                                label1: `Access Backlog: ${backlog.Backlog_Name}`,
                                                checked1: checkedAccess,
                                                key2: `manageBacklog.${backlog.Backlog_ID}`,
                                                label2: `Manage Backlog: ${backlog.Backlog_Name}`,
                                                checked2: checkedManage
                                            }
                                        );
                                    });

                                    return permissions.map(permission => (
                                        <View key={permission.key1 + permission.key2} style={{ flexDirection: 'column', marginBottom: 8 }}>
                                            <TouchableOpacity
                                                style={RoleFormStyles.permissionItem}
                                                onPress={async () => {
                                                    await togglePermission(permission.key1, !permission.checked1);
                                                    if (!permission.checked1 === false) {
                                                        // If unchecking access, also uncheck manage
                                                        await togglePermission(permission.key2, false);
                                                    }
                                                }}
                                            >
                                                <Text style={{ color: permission.checked1 ? '#007bff' : '#000' }}>
                                                    {permission.label1}
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[RoleFormStyles.permissionItem, { paddingLeft: 16 }]}
                                                onPress={async () => {
                                                    await togglePermission(permission.key2, !permission.checked2);
                                                    if (!permission.checked2 === true) {
                                                        // If checking manage, also check access
                                                        await togglePermission(permission.key1, true);
                                                    }
                                                }}
                                            >
                                                <Text style={{ color: permission.checked2 ? '#007bff' : '#000' }}>
                                                    {permission.label2}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    ));
                                })}
                            </>
                        ) : null}
                    </>
                )}
            </ModalToggler>
        </>
    )
}
