import { editorStyles, ModalToggler } from '@/src/Components/ModalToggler'
import { TeamRolesSeatsViewStyles, TeamRolesSeatsViewStyles2 } from '@/src/Components/Team'
import { Role, Team, TeamUserSeat, TeamUserSeatFields } from '@/src/Types'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { Picker } from '@react-native-picker/picker'
import { TFunction } from 'i18next'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

type SelectedSeatFormProps = {
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

            <View style={TeamRolesSeatsViewStyles2.buttonRow}>
                <TouchableOpacity style={TeamRolesSeatsViewStyles2.button} onPress={handleSeatChanges}>
                    <Text style={TeamRolesSeatsViewStyles2.buttonText}>Save changes</Text>
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
