import { InviteUserForm, NewRoleForm, SelectedRoleForm, SelectedSeatForm } from '@/src/Components/Team';
import { Role, RoleFields, TeamStates, TeamUserSeat, TeamUserSeatFields, User } from '@/src/Types';
import { faChair, faShield, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { TFunction } from 'i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type RolesSeatsManagerProps = {
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

export const RolesSeatsManager: React.FC<RolesSeatsManagerProps> = ({
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

export const TeamRolesSeatsViewStyles = StyleSheet.create({
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

export const TeamRolesSeatsViewStyles2 = StyleSheet.create({
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

export const RoleFormStyles = StyleSheet.create({
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
