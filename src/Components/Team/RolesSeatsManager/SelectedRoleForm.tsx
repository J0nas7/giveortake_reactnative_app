import { editorStyles } from '@/src/Components/ModalToggler'
import { RoleFormStyles, TeamRolesSeatsViewStyles, TeamRolesSeatsViewStyles2 } from '@/src/Components/Team'
import { Backlog, Project, Role, RoleFields, Team } from '@/src/Types'
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

type SelectedRoleFormProps = {
    selectedRole: Role
    handleRoleChange: (field: RoleFields, value: string) => void
    t: (key: string) => string
    availablePermissions: string[]
    togglePermission: (permission: string, isChecked: boolean) => Promise<void>
    renderTeam: Team
    setSelectedRole: React.Dispatch<React.SetStateAction<Role | undefined>>
    setDisplayNewRoleForm: React.Dispatch<React.SetStateAction<boolean>>
    handleRoleChanges: () => void
}

export const SelectedRoleForm: React.FC<SelectedRoleFormProps> = ({
    selectedRole,
    handleRoleChange,
    t,
    availablePermissions,
    togglePermission,
    renderTeam,
    setSelectedRole,
    setDisplayNewRoleForm,
    handleRoleChanges
}) => (
    <ScrollView style={TeamRolesSeatsViewStyles.container}>
        <Text style={TeamRolesSeatsViewStyles2.title}>{t('team:rolesSeatsManager:editRole')}</Text>

        <View style={editorStyles.formGroup}>
            <Text style={editorStyles.label}>{t('team:rolesSeatsManager:roleName')}</Text>
            <TextInput
                style={TeamRolesSeatsViewStyles2.input}
                value={selectedRole.Role_Name}
                onChangeText={(value) => handleRoleChange('Role_Name', value)}
            />
        </View>

        <Text style={[TeamRolesSeatsViewStyles2.label, { marginTop: 16 }]}>
            {t('team:rolesSeatsManager:permissions')}
        </Text>

        {availablePermissions.map((permission) => {
            const isPermissionActive = selectedRole.permissions?.find(perm => perm.Permission_Key === permission)
            return (
                <TouchableOpacity
                    key={permission}
                    style={RoleFormStyles.permissionItem}
                    onPress={() =>
                        togglePermission(permission, !isPermissionActive)
                    }
                >
                    <Text style={{ color: isPermissionActive ? '#007bff' : '#000' }}>
                        {permission}
                    </Text>
                </TouchableOpacity>
            )
        })}

        {renderTeam?.projects?.map((project: Project) => {
            const checkedAccess = selectedRole.permissions ?
                selectedRole.permissions.filter(permission =>
                    `accessProject.${project.Project_ID}` === permission.Permission_Key
                ).length > 0 : false
            const checkedManage = selectedRole.permissions ?
                selectedRole.permissions.filter(permission =>
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
                const checkedAccess = selectedRole.permissions ?
                    selectedRole.permissions.filter(permission =>
                        `accessBacklog.${backlog.Backlog_ID}` === permission.Permission_Key
                    ).length > 0 : false
                const checkedManage = selectedRole.permissions ?
                    selectedRole.permissions.filter(permission =>
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

        <View style={TeamRolesSeatsViewStyles2.buttonRow}>
            <TouchableOpacity
                onPress={() => {
                    setSelectedRole(undefined)
                    setDisplayNewRoleForm(false)
                }}
            >
                <Text style={RoleFormStyles.cancelLink}>{t('Cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={TeamRolesSeatsViewStyles2.button} onPress={handleRoleChanges}>
                <Text style={TeamRolesSeatsViewStyles2.buttonText}>{t('team:rolesSeatsManager:saveChanges')}</Text>
            </TouchableOpacity>
        </View>
    </ScrollView>
)
