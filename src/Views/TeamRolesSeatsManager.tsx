// External
import { faChair, faChevronLeft, faChevronRight, faShield, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { Picker } from '@react-native-picker/picker'
import { useRoute } from '@react-navigation/native'
import { TFunction } from 'i18next'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'

// Internal
import { editorStyles, ModalToggler } from '@/src/Components/ModalToggler'
import { useTeamsContext, useTeamUserSeatsContext, useUsersContext } from '@/src/Contexts'
import { useAxios } from '@/src/Hooks'
import useRoleAccess from '@/src/Hooks/useRoleAccess'
import { selectAuthUser, setSnackMessage, useAppDispatch, useTypedSelector } from '@/src/Redux'
import { Backlog, Permission, Project, Role, RoleFields, Team, TeamStates, TeamUserSeat, TeamUserSeatFields, User } from '@/src/Types'

export const TeamRolesSeatsManager: React.FC = () => {
    // ---- Hooks ----
    const route = useRoute();
    const dispatch = useAppDispatch()
    const { t } = useTranslation(['team'])
    const {
        // Seats
        teamUserSeatsById,
        readTeamUserSeatsByTeamId,
        addTeamUserSeat,
        saveTeamUserSeatChanges,
        removeTeamUserSeat,

        // Roles and Permissions
        rolesAndPermissionsByTeamId,
        addRole,
        readRolesAndPermissionsByTeamId,
        removeRolesAndPermissionsByRoleId,
        saveTeamRoleChanges
    } = useTeamUserSeatsContext();
    const { teamById, readTeamById } = useTeamsContext();
    const { addUser } = useUsersContext();
    const { id: teamId } = route.params as { id: string };
    const { canManageTeamMembers } = useRoleAccess(teamById ? teamById.organisation?.User_ID : undefined)

    // ---- State ----
    const [chosenSeatId, setChosenSeatId] = useState<string>("")
    const [chosenRoleId, setChosenRoleId] = useState<string>("")
    const authUser = useTypedSelector(selectAuthUser); // Redux
    const [renderUserSeats, setRenderUserSeats] = useState<TeamUserSeat[]>([]);
    const [renderTeam, setRenderTeam] = useState<TeamStates>(undefined)
    const [selectedSeat, setSelectedSeat] = useState<TeamUserSeat | undefined>(undefined);
    const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);
    const [displayInviteForm, setDisplayInviteForm] = useState<string>("");
    const [displayNewRoleForm, setDisplayNewRoleForm] = useState<boolean>(false);
    const [togglerIsVisible, setTogglerIsVisible] = useState<false | string>(false)

    const availablePermissions = ["Modify Organisation Settings", "Modify Team Settings", "Manage Team Members"]

    // ---- Methods ----
    // Handles saving changes made to the selected seat
    const handleSeatChanges = async () => {
        if (selectedSeat) {
            const saveChanges = await saveTeamUserSeatChanges(selectedSeat, parseInt(teamId))

            dispatch(setSnackMessage(
                saveChanges ? "Seat changes saved successfully!" : "Failed to save seat changes."
            ))
        }
    }

    // Handles saving changes made to the selected role
    const handleRoleChanges = async () => {
        if (selectedRole) {
            const saveChanges = await saveTeamRoleChanges(selectedRole, parseInt(teamId))

            dispatch(setSnackMessage(
                saveChanges ? "Role changes saved successfully!" : "Failed to save role changes."
            ))
        }
    }

    // Handles the removal of a team user seat.
    const handleRemoveSeat = (seatId: number) => {
        removeTeamUserSeat(
            seatId,
            parseInt(teamId),
            undefined
        )
        setChosenSeatId("")
    };

    // Handles the removal of a team role.
    const handleRemoveRole = (roleId: number) => {
        const seatsNotEmpty = renderUserSeats.filter(seat => roleId === seat.Role_ID)
        if (seatsNotEmpty.length) {
            dispatch(setSnackMessage("You cannot remove a role while there are seats assigned to it."))
            return
        }

        removeRolesAndPermissionsByRoleId(roleId, parseInt(teamId))
    }

    // Handles changes to a specific field of the selected team user seat.
    const handleSeatChange = (field: TeamUserSeatFields, value: string) => {
        if (selectedSeat) {
            setSelectedSeat((prevSeat) => ({
                ...prevSeat!,
                [field]: value,
            }));
        }
    };

    // Handles changes to a specific field of the selected team user seat.
    const handleRoleChange = (field: RoleFields, value: string) => {
        if (selectedRole) {
            setSelectedRole((prevRole) => ({
                ...prevRole!,
                [field]: value,
            }));
        }
    };

    // Handles the selection of a team user seat and updates the URL with the selected seat's ID.
    const handleSelectSeat = (seat: TeamUserSeat) => {
        if (!seat.Seat_ID) return

        setChosenSeatId(seat.Seat_ID.toString())
        setChosenRoleId("")
    };

    // Handles the selection of a team role and updates the URL with the selected role's ID.
    const handleSelectRole = (role: Role) => {
        if (!role.Role_ID) return

        setChosenSeatId("")
        setChosenRoleId(role.Role_ID.toString())
    };

    // Toggles a permission for the selected seat by adding or removing it from the permissions list.
    const togglePermission = async (permission: string, isChecked: boolean) => {
        setSelectedRole((prevRole) => {
            if (!prevRole) return prevRole

            const currentPermissions = prevRole.permissions || []

            const isAlreadyIncluded = currentPermissions.some(p => p.Permission_Key === permission)

            let updatedPermissions: Permission[]

            if (isChecked) {
                // Add permission if not already included
                if (!isAlreadyIncluded) {
                    const newPermission: Permission = {
                        Permission_Key: permission,
                        Team_ID: renderTeam ? renderTeam.Team_ID ?? 0 : 0
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

    // ---- Effects ----
    useEffect(() => {
        if (teamId) {
            readTeamById(parseInt(teamId))
            readTeamUserSeatsByTeamId(parseInt(teamId));
            readRolesAndPermissionsByTeamId(parseInt(teamId));
        }
    }, [teamId]);

    useEffect(() => {
        setRenderUserSeats(teamUserSeatsById);
        setRenderTeam(teamById)
    }, [teamUserSeatsById, teamById]);

    // Handle URL seatId changes and update the state accordingly
    useEffect(() => {
        if (!renderTeam) return

        if (chosenSeatId && authUser && canManageTeamMembers === false) {
            setChosenSeatId("")
            return
        }

        if (chosenSeatId && !isNaN(Number(chosenSeatId)) && renderUserSeats.length) {
            const seat = renderUserSeats.find(seat => seat.Seat_ID === parseInt(chosenSeatId))
            setDisplayInviteForm("")
            setDisplayNewRoleForm(false)
            setSelectedSeat(seat)
            setSelectedRole(undefined)
        } else if (chosenSeatId &&
            (
                chosenSeatId === "new" ||
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(chosenSeatId)
            )
        ) {
            setDisplayInviteForm(chosenSeatId)
            setDisplayNewRoleForm(false)
            setSelectedSeat(undefined)
            setSelectedRole(undefined)
        }
    }, [chosenSeatId, renderUserSeats])

    // Handle URL roleId changes and update the state accordingly
    useEffect(() => {
        if (!renderTeam) return

        if (chosenRoleId && authUser && canManageTeamMembers === false) {
            setChosenRoleId("")
            return
        }

        if (chosenRoleId === "new") {
            setDisplayInviteForm("")
            setDisplayNewRoleForm(true)
            setSelectedSeat(undefined)
            setSelectedRole(undefined)
        } else if (chosenRoleId && rolesAndPermissionsByTeamId && rolesAndPermissionsByTeamId.length) {
            const role = rolesAndPermissionsByTeamId.find(role => role.Role_ID === parseInt(chosenRoleId))
            setDisplayInviteForm("")
            setDisplayNewRoleForm(false)
            setSelectedSeat(undefined)
            setSelectedRole(role)
        }
    }, [chosenRoleId, rolesAndPermissionsByTeamId])

    // ---- Render ----
    return (
        <TeamRolesSeatsView
            renderUserSeats={renderUserSeats}
            renderTeam={renderTeam}
            authUser={authUser}
            selectedSeat={selectedSeat}
            displayInviteForm={displayInviteForm}
            selectedRole={selectedRole}
            teamId={teamId}
            t={t}
            availablePermissions={availablePermissions}
            canManageTeamMembers={canManageTeamMembers}
            rolesAndPermissionsByTeamId={rolesAndPermissionsByTeamId}
            addTeamUserSeat={addTeamUserSeat}
            addRole={addRole}
            readTeamUserSeatsByTeamId={readTeamUserSeatsByTeamId}
            readRolesAndPermissionsByTeamId={readRolesAndPermissionsByTeamId}
            handleSelectSeat={handleSelectSeat}
            handleSelectRole={handleSelectRole}
            handleRemoveSeat={handleRemoveSeat}
            handleRemoveRole={handleRemoveRole}
            handleSeatChanges={handleSeatChanges}
            handleRoleChanges={handleRoleChanges}
            handleSeatChange={handleSeatChange}
            handleRoleChange={handleRoleChange}
            setSelectedSeat={setSelectedSeat}
            setDisplayInviteForm={setDisplayInviteForm}
            setSelectedRole={setSelectedRole}
            displayNewRoleForm={displayNewRoleForm}
            setDisplayNewRoleForm={setDisplayNewRoleForm}
            togglePermission={togglePermission}
            togglerIsVisible={togglerIsVisible}
            setTogglerIsVisible={setTogglerIsVisible}
        />
    );
};

export interface TeamRolesSeatsViewProps {
    renderUserSeats: TeamUserSeat[];
    renderTeam: TeamStates;
    authUser: User | undefined;
    selectedSeat: TeamUserSeat | undefined;
    displayInviteForm: string | undefined
    selectedRole: Role | undefined
    teamId: string
    t: TFunction
    availablePermissions: string[]
    canManageTeamMembers: boolean | undefined
    rolesAndPermissionsByTeamId: Role[] | undefined
    addTeamUserSeat: (parentId: number, object?: TeamUserSeat) => Promise<void>
    addRole: (parentId: number, object?: Role | undefined) => Promise<void>
    readTeamUserSeatsByTeamId: (parentId: number) => Promise<void>
    readRolesAndPermissionsByTeamId: (teamId: number) => Promise<boolean>
    handleSelectSeat: (seat: TeamUserSeat) => void;
    handleSelectRole: (role: Role) => void
    handleRemoveSeat: (seatId: number) => void;
    handleRemoveRole: (roleId: number) => void
    handleSeatChanges: () => void;
    handleRoleChanges: () => Promise<void>
    handleSeatChange: (field: TeamUserSeatFields, value: string) => void;
    handleRoleChange: (field: RoleFields, value: string) => void
    setSelectedSeat: React.Dispatch<React.SetStateAction<TeamUserSeat | undefined>>
    setDisplayInviteForm: React.Dispatch<React.SetStateAction<string>>
    setSelectedRole: React.Dispatch<React.SetStateAction<Role | undefined>>
    displayNewRoleForm: boolean
    setDisplayNewRoleForm: React.Dispatch<React.SetStateAction<boolean>>
    togglePermission: (permission: string, isChecked: boolean) => Promise<void>
    togglerIsVisible: string | false
    setTogglerIsVisible: React.Dispatch<React.SetStateAction<string | false>>
}

export const TeamRolesSeatsView: React.FC<TeamRolesSeatsViewProps> = ({
    renderUserSeats,
    renderTeam,
    authUser,
    selectedSeat,
    displayInviteForm,
    selectedRole,
    teamId,
    t,
    availablePermissions,
    canManageTeamMembers,
    rolesAndPermissionsByTeamId,
    displayNewRoleForm,
    addTeamUserSeat,
    addRole,
    readTeamUserSeatsByTeamId,
    readRolesAndPermissionsByTeamId,
    handleSelectSeat,
    handleSelectRole,
    handleRemoveSeat,
    handleRemoveRole,
    handleSeatChanges,
    handleRoleChanges,
    handleSeatChange,
    handleRoleChange,
    setSelectedSeat,
    setDisplayInviteForm,
    setSelectedRole,
    setDisplayNewRoleForm,
    togglePermission,
    togglerIsVisible,
    setTogglerIsVisible
}) => (
    <>
        {!selectedSeat && !displayInviteForm && !selectedRole && !displayNewRoleForm && (
            <ScrollView style={TeamRolesSeatsViewStyles.container}>
                <View style={TeamRolesSeatsViewStyles.header}>
                    <FontAwesomeIcon icon={faChair} size={24} />
                    <Text style={TeamRolesSeatsViewStyles.headerTitle}>{t('team:rolesSeatsManager:manageTeamRolesSeats')}</Text>
                    {renderTeam && <Text style={TeamRolesSeatsViewStyles.subtitle}>{renderTeam.Team_Name}</Text>}
                </View>

                {renderTeam && (
                    <View style={TeamRolesSeatsViewStyles.actions}>
                        {canManageTeamMembers && (
                            <>
                                <TouchableOpacity onPress={() => setDisplayInviteForm('new')}>
                                    <Text style={TeamRolesSeatsViewStyles.link}>
                                        <FontAwesomeIcon icon={faUser} /> {t('team:rolesSeatsManager:newInvite')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setDisplayNewRoleForm(true)}>
                                    <Text style={TeamRolesSeatsViewStyles.link}>
                                        <FontAwesomeIcon icon={faShield} /> {t('team:rolesSeatsManager:newRole')}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}

                <Text style={TeamRolesSeatsViewStyles.sectionTitle}>{t('team:rolesSeatsManager:rolesHeadline')}</Text>
                {renderTeam && Array.isArray(rolesAndPermissionsByTeamId) && (
                    <View style={TeamRolesSeatsViewStyles.cardList}>
                        {rolesAndPermissionsByTeamId.map((role) => (
                            <View key={role.Role_ID} style={TeamRolesSeatsViewStyles.card}>
                                <Text style={TeamRolesSeatsViewStyles.cardTitle}>{role.Role_Name}</Text>
                                <Text style={TeamRolesSeatsViewStyles.cardSubText}>
                                    {t('team:rolesSeatsManager:permissions')}: {role.permissions?.length}
                                </Text>
                                {canManageTeamMembers && (
                                    <View style={TeamRolesSeatsViewStyles.cardButtons}>
                                        <TouchableOpacity
                                            onPress={() => handleSelectRole(role)}
                                            style={TeamRolesSeatsViewStyles.buttonHalf}
                                        >
                                            <Text style={TeamRolesSeatsViewStyles.link}>{t('team:rolesSeatsManager:edit')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => role.Role_ID && handleRemoveRole(role.Role_ID)}
                                            style={TeamRolesSeatsViewStyles.buttonHalf}
                                        >
                                            <Text style={TeamRolesSeatsViewStyles.link}>{t('team:rolesSeatsManager:remove')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                <Text style={TeamRolesSeatsViewStyles.sectionTitle}>{t('team:rolesSeatsManager:seatsHeadline')}</Text>
                {renderTeam && (
                    <View style={TeamRolesSeatsViewStyles.cardList}>
                        {!renderUserSeats.length && authUser?.User_ID === renderTeam?.organisation?.User_ID ? (
                            <Text>{t('team:rolesSeatsManager:length0_iamowner')}</Text>
                        ) : (
                            renderUserSeats.map((seat) => (
                                <View key={seat.Seat_ID} style={TeamRolesSeatsViewStyles.card}>
                                    <Text style={TeamRolesSeatsViewStyles.cardTitle}>
                                        {seat.user?.User_FirstName} {seat.user?.User_Surname}
                                    </Text>
                                    <Text style={TeamRolesSeatsViewStyles.cardSubText}>
                                        {t('team:rolesSeatsManager:role')}: {seat.role?.Role_Name}
                                    </Text>
                                    <Text style={TeamRolesSeatsViewStyles.cardSubText}>
                                        {t('team:rolesSeatsManager:status')}: {seat.Seat_Status}
                                    </Text>
                                    {canManageTeamMembers && (
                                        <View style={TeamRolesSeatsViewStyles.cardButtons}>
                                            <TouchableOpacity
                                                onPress={() => handleSelectSeat(seat)}
                                                style={TeamRolesSeatsViewStyles.buttonHalf}
                                            >
                                                <Text style={TeamRolesSeatsViewStyles.link}>{t('team:rolesSeatsManager:edit')}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => seat.Seat_ID && handleRemoveSeat(seat.Seat_ID)}
                                                style={TeamRolesSeatsViewStyles.buttonHalf}
                                            >
                                                <Text style={TeamRolesSeatsViewStyles.link}>{t('team:rolesSeatsManager:remove')}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>
        )}

        {canManageTeamMembers && renderTeam && (
            <>
                {selectedSeat ? (
                    <SelectedSeatForm
                        selectedSeat={selectedSeat}
                        rolesAndPermissionsByTeamId={rolesAndPermissionsByTeamId}
                        handleSeatChange={handleSeatChange}
                        t={t}
                        availablePermissions={availablePermissions}
                        togglePermission={togglePermission}
                        renderTeam={renderTeam}
                        setSelectedSeat={setSelectedSeat}
                        setDisplayInviteForm={setDisplayInviteForm}
                        handleSeatChanges={handleSeatChanges}
                        togglerIsVisible={togglerIsVisible}
                        setTogglerIsVisible={setTogglerIsVisible}

                    />
                ) : displayInviteForm ? (
                    <InviteUserForm
                        teamId={teamId}
                        t={t}
                        displayInviteForm={displayInviteForm}
                        rolesAndPermissionsByTeamId={rolesAndPermissionsByTeamId}
                        addTeamUserSeat={addTeamUserSeat}
                        readTeamUserSeatsByTeamId={readTeamUserSeatsByTeamId}
                        setSelectedSeat={setSelectedSeat}
                        setDisplayInviteForm={setDisplayInviteForm}
                        togglerIsVisible={togglerIsVisible}
                        setTogglerIsVisible={setTogglerIsVisible}
                    />
                ) : selectedRole ? (
                    <SelectedRoleForm
                        selectedRole={selectedRole}
                        handleRoleChange={handleRoleChange}
                        t={t}
                        availablePermissions={availablePermissions}
                        togglePermission={togglePermission}
                        renderTeam={renderTeam}
                        setSelectedRole={setSelectedRole}
                        setDisplayNewRoleForm={setDisplayNewRoleForm}
                        handleRoleChanges={handleRoleChanges}
                    // togglerIsVisible={togglerIsVisible}
                    // setTogglerIsVisible={setTogglerIsVisible}
                    />
                ) : displayNewRoleForm ? (
                    <NewRoleForm
                        renderTeam={renderTeam}
                        teamId={teamId}
                        t={t}
                        displayNewRoleForm={displayNewRoleForm}
                        rolesAndPermissionsByTeamId={rolesAndPermissionsByTeamId}
                        availablePermissions={availablePermissions}
                        addRole={addRole}
                        readRolesAndPermissionsByTeamId={readRolesAndPermissionsByTeamId}
                        setSelectedRole={setSelectedRole}
                        setDisplayNewRoleForm={setDisplayNewRoleForm}
                        togglerIsVisible={togglerIsVisible}
                        setTogglerIsVisible={setTogglerIsVisible}
                    />
                ) : null}
            </>
        )}
    </>
)

export interface SelectedSeatFormProps {
    selectedSeat: TeamUserSeat
    rolesAndPermissionsByTeamId: Role[] | undefined
    handleSeatChange: (field: TeamUserSeatFields, value: string) => void
    t: TFunction
    availablePermissions: string[]
    togglePermission: (permission: string, isChecked: boolean) => Promise<void>
    renderTeam: Team
    setSelectedSeat: React.Dispatch<React.SetStateAction<TeamUserSeat | undefined>>
    setDisplayInviteForm: React.Dispatch<React.SetStateAction<string>>
    handleSeatChanges: () => void
    togglerIsVisible: string | false
    setTogglerIsVisible: React.Dispatch<React.SetStateAction<string | false>>
}

export const SelectedSeatForm: React.FC<SelectedSeatFormProps> = ({
    selectedSeat,
    rolesAndPermissionsByTeamId,
    handleSeatChange,
    t,
    setSelectedSeat,
    setDisplayInviteForm,
    handleSeatChanges,
    togglerIsVisible,
    setTogglerIsVisible
}) => (
    <>
        <ScrollView style={TeamRolesSeatsViewStyles.container}>
            <View style={editorStyles.rowBetween}>
                <TouchableOpacity onPress={() => {
                    setDisplayInviteForm("")
                    setSelectedSeat(undefined)
                }}>
                    <FontAwesomeIcon icon={faChevronLeft} size={20} />
                </TouchableOpacity>
                <Text style={editorStyles.title}>
                    {selectedSeat.user?.User_FirstName} {selectedSeat.user?.User_Surname}
                </Text>
            </View>

            <View style={editorStyles.formGroup}>
                <Text style={editorStyles.label}>Role</Text>
                <TouchableOpacity
                    style={editorStyles.formGroupItemToggler}
                    onPress={() => setTogglerIsVisible("UserRole")}
                >
                    <Text>
                        {rolesAndPermissionsByTeamId?.find(role => role.Role_ID === selectedSeat.Role_ID)?.Role_Name}
                    </Text>
                    <FontAwesomeIcon icon={faChevronRight} />
                </TouchableOpacity>
            </View>

            <View style={editorStyles.formGroup}>
                <Text style={editorStyles.label}>Status</Text>
                <TouchableOpacity
                    style={editorStyles.formGroupItemToggler}
                    onPress={() => setTogglerIsVisible("UserStatus")}
                >
                    <Text>{selectedSeat.Seat_Status}</Text>
                    <FontAwesomeIcon icon={faChevronRight} />
                </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.button} onPress={handleSeatChanges}>
                    <Text style={styles.buttonText}>Save changes</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>

        <ModalToggler visibility={togglerIsVisible} callback={setTogglerIsVisible}>
            {selectedSeat && (
                <>
                    {togglerIsVisible === "UserRole" ? (
                        <Picker
                            selectedValue={selectedSeat.Role_ID}
                            onValueChange={(itemValue) =>
                                handleSeatChange('Role_ID', itemValue.toString())
                            }>
                            {rolesAndPermissionsByTeamId?.map((role) => (
                                <Picker.Item key={role.Role_ID} label={role.Role_Name} value={role.Role_ID} />
                            ))}
                        </Picker>
                    ) : togglerIsVisible === "UserStatus" ? (
                        <Picker
                            selectedValue={selectedSeat.Seat_Status}
                            onValueChange={(value) => handleSeatChange('Seat_Status', value)}
                        >
                            <Picker.Item label={t('team:rolesSeatsManager:active')} value="Active" />
                            <Picker.Item label={t('team:rolesSeatsManager:inactive')} value="Inactive" />
                            <Picker.Item label={t('team:rolesSeatsManager:pending')} value="Pending" />
                        </Picker>
                    ) : null}
                </>
            )}
        </ModalToggler>
    </>
)

export interface InviteUserFormProps {
    teamId: string
    t: TFunction
    rolesAndPermissionsByTeamId: Role[] | undefined
    displayInviteForm: string | undefined
    addTeamUserSeat: (parentId: number, object?: TeamUserSeat) => Promise<void>
    readTeamUserSeatsByTeamId: (parentId: number) => Promise<void>
    setSelectedSeat: React.Dispatch<React.SetStateAction<TeamUserSeat | undefined>>
    setDisplayInviteForm: React.Dispatch<React.SetStateAction<string>>
    togglerIsVisible: string | false
    setTogglerIsVisible: React.Dispatch<React.SetStateAction<string | false>>
}

export const InviteUserForm: React.FC<InviteUserFormProps> = ({
    teamId,
    t,
    rolesAndPermissionsByTeamId,
    displayInviteForm,
    addTeamUserSeat,
    readTeamUserSeatsByTeamId,
    setSelectedSeat,
    setDisplayInviteForm,
    togglerIsVisible,
    setTogglerIsVisible
}) => {
    const [email, setEmail] = useState<string>(
        __DEV__ ? 'charlie@givetake.net' : ''
    )
    const [user, setUser] = useState<User | undefined>()
    const [role, setRole] = useState<Role | undefined>()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSearchUser = async () => {
        if (!email) return
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(email)) {
            setError(t("team:rolesSeatsManager:invalidEmail"))
            return
        }

        setLoading(true)
        setError(null)
        setUser(undefined)
        setRole(undefined)

        try {
            const { httpPostWithData } = useAxios()
            const data = await httpPostWithData("users/userByEmail", { email })

            if (data.message) {
                throw new Error(t("team:rolesSeatsManager:userNotFound"))
            }

            setUser(data)
        } catch (e: any) {
            console.error(e)
            setError(e.message || "Unknown error")
        } finally {
            setLoading(false)
        }
    }

    const handleSendInvite = async () => {
        if (!user) {
            setError(t("team:rolesSeatsManager:userNotFound"))
            return
        }

        const newSeat: TeamUserSeat = {
            Team_ID: parseInt(teamId),
            User_ID: user.User_ID ?? 0,
            Role_ID: role?.Role_ID ?? 0,
            Seat_Status: "Pending"
        }

        try {
            await addTeamUserSeat(newSeat.Team_ID, newSeat)
            await readTeamUserSeatsByTeamId(parseInt(teamId))
            setDisplayInviteForm("new")
            setSelectedSeat(undefined)
        } catch (err) {
            console.error("Failed to invite user", err)
            setError(t("team:rolesSeatsManager:createSeatError"))
        }
    }

    useEffect(() => {
        if (displayInviteForm && displayInviteForm !== "new") {
            setEmail(displayInviteForm)
            handleSearchUser()
        }
    }, [displayInviteForm])

    return (
        <>
            <ScrollView style={TeamRolesSeatsViewStyles.container}>
                <View style={editorStyles.rowBetween}>
                    <TouchableOpacity onPress={() => {
                        setDisplayInviteForm("")
                        setSelectedSeat(undefined)
                    }}>
                        <FontAwesomeIcon icon={faChevronLeft} size={20} />
                    </TouchableOpacity>
                    <Text style={editorStyles.title}>
                        {t("team:rolesSeatsManager:searchAndInviteUser")}
                    </Text>
                </View>

                <Text style={styles.label}>{t("team:rolesSeatsManager:email")}</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.button} onPress={handleSearchUser}>
                        <Text style={styles.buttonText}>{t("team:rolesSeatsManager:searchUser")}</Text>
                    </TouchableOpacity>
                </View>

                {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
                {error && <Text style={styles.errorText}>{error}</Text>}

                {user && (
                    <>
                        <View style={{ marginBottom: 16 }}>
                            <Text style={[styles.label, { fontWeight: '600' }]}>
                                {t("team:rolesSeatsManager:userFound")}
                            </Text>
                            <Text>{user.User_FirstName} {user.User_Surname}</Text>
                        </View>

                        <View style={editorStyles.formGroup}>
                            <Text style={editorStyles.label}>Select Role</Text>
                            <TouchableOpacity
                                style={editorStyles.formGroupItemToggler}
                                onPress={() => setTogglerIsVisible("UserRole")}
                            >
                                <Text>
                                    {rolesAndPermissionsByTeamId?.find(r => r.Role_ID === role?.Role_ID)?.Role_Name}
                                </Text>
                                <FontAwesomeIcon icon={faChevronRight} />
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {role && (
                    <View>
                        <Text style={[styles.label, { fontWeight: '600' }]}>
                            {t("team:rolesSeatsManager:selectedRole")}
                        </Text>
                        <Text>Name: {role.Role_Name}</Text>
                        <Text>Permissions: {role.permissions?.length}</Text>

                        <TouchableOpacity style={[styles.button, { marginTop: 16 }]} onPress={handleSendInvite}>
                            <Text style={styles.buttonText}>{t("team:rolesSeatsManager:sendInvite")}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <ModalToggler visibility={togglerIsVisible} callback={setTogglerIsVisible}>
                {displayInviteForm && (
                    <>
                        {togglerIsVisible === "UserRole" && (
                            <Picker
                                selectedValue={role?.Role_ID}
                                onValueChange={(value) =>
                                    setRole(rolesAndPermissionsByTeamId?.find(role => role.Role_ID === value))
                                }
                            >
                                <Picker.Item label="-" value="" />
                                {rolesAndPermissionsByTeamId?.map(r => (
                                    <Picker.Item key={r.Role_ID} label={r.Role_Name} value={r.Role_ID} />
                                ))}
                            </Picker>
                        )}
                    </>
                )}
            </ModalToggler>
        </>
    )
}

export interface NewRoleFormProps {
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

const NewRoleForm: React.FC<NewRoleFormProps> = ({
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

                <View style={NewRoleFormStyles.buttonRow}>
                    <TouchableOpacity style={NewRoleFormStyles.button} onPress={handleCreateRole}>
                        <Text style={NewRoleFormStyles.buttonText}>{t('team:rolesSeatsManager:createRole')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <ModalToggler visibility={togglerIsVisible} callback={setTogglerIsVisible}>
                {displayNewRoleForm && (
                    <>
                        {togglerIsVisible === "RoleName" ? (
                            <TextInput
                                style={styles.input}
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
                                            style={NewRoleFormStyles.permissionItem}
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
                                                style={NewRoleFormStyles.permissionItem}
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
                                                style={[NewRoleFormStyles.permissionItem, { paddingLeft: 16 }]}
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

export interface SelectedRoleFormProps {
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

const SelectedRoleForm: React.FC<SelectedRoleFormProps> = ({
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
        <Text style={styles.title}>{t('team:rolesSeatsManager:editRole')}</Text>

        <View style={editorStyles.formGroup}>
            <Text style={editorStyles.label}>{t('team:rolesSeatsManager:roleName')}</Text>
            <TextInput
                style={styles.input}
                value={selectedRole.Role_Name}
                onChangeText={(value) => handleRoleChange('Role_Name', value)}
            />
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>
            {t('team:rolesSeatsManager:permissions')}
        </Text>

        {availablePermissions.map((permission) => {
            const isPermissionActive = selectedRole.permissions?.find(perm => perm.Permission_Key === permission)
            return (
                <TouchableOpacity
                    key={permission}
                    style={NewRoleFormStyles.permissionItem}
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
                        style={NewRoleFormStyles.permissionItem}
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
                        style={[NewRoleFormStyles.permissionItem, { paddingLeft: 16 }]}
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

        <View style={styles.buttonRow}>
            <TouchableOpacity
                onPress={() => {
                    setSelectedRole(undefined)
                    setDisplayNewRoleForm(false)
                }}
            >
                <Text style={NewRoleFormStyles.cancelLink}>{t('Cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleRoleChanges}>
                <Text style={styles.buttonText}>{t('team:rolesSeatsManager:saveChanges')}</Text>
            </TouchableOpacity>
        </View>
    </ScrollView>
)

const TeamRolesSeatsViewStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
        position: 'relative'
    },
    header: {
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 16,
        color: '#777',
        marginTop: 4,
    },
    actions: {
        marginBottom: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    link: {
        color: '#007bff',
        marginRight: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginVertical: 12,
    },
    cardList: {
        marginBottom: 24,
    },
    card: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        backgroundColor: '#f9f9f9',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
    },
    cardSubText: {
        fontSize: 14,
        color: '#555',
    },
    cardButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    buttonHalf: {
        width: '48%',
    },
})

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 16
    },
    label: {
        marginTop: 12,
        fontSize: 14
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 6,
        marginTop: 6
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600'
    },
    cancelText: {
        color: '#888',
        fontSize: 16
    },
    errorText: {
        color: 'red',
        marginTop: 12
    },
    userInfo: {
        marginTop: 20
    }
})

const NewRoleFormStyles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#FFF',
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#CCC',
        padding: 10,
        borderRadius: 6,
        backgroundColor: '#FFF',
    },
    permissionItem: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
    },
    cancelLink: {
        color: '#007bff',
        paddingVertical: 10,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 6,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '600',
    },
});
