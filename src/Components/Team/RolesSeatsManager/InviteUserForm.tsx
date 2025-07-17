import { editorStyles, ModalToggler } from '@/src/Components/ModalToggler'
import { TeamRolesSeatsViewStyles, TeamRolesSeatsViewStyles2 } from '@/src/Components/Team'
import { useAxios } from '@/src/Hooks'
import { Role, TeamUserSeat, User } from '@/src/Types'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { Picker } from '@react-native-picker/picker'
import { TFunction } from 'i18next'
import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

type InviteUserFormProps = {
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

                <Text style={TeamRolesSeatsViewStyles2.label}>{t("team:rolesSeatsManager:email")}</Text>
                <TextInput
                    style={TeamRolesSeatsViewStyles2.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <View style={TeamRolesSeatsViewStyles2.buttonRow}>
                    <TouchableOpacity style={TeamRolesSeatsViewStyles2.button} onPress={handleSearchUser}>
                        <Text style={TeamRolesSeatsViewStyles2.buttonText}>{t("team:rolesSeatsManager:searchUser")}</Text>
                    </TouchableOpacity>
                </View>

                {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
                {error && <Text style={TeamRolesSeatsViewStyles2.errorText}>{error}</Text>}

                {user && (
                    <>
                        <View style={{ marginBottom: 16 }}>
                            <Text style={[TeamRolesSeatsViewStyles2.label, { fontWeight: '600' }]}>
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
                        <Text style={[TeamRolesSeatsViewStyles2.label, { fontWeight: '600' }]}>
                            {t("team:rolesSeatsManager:selectedRole")}
                        </Text>
                        <Text>Name: {role.Role_Name}</Text>
                        <Text>Permissions: {role.permissions?.length}</Text>

                        <TouchableOpacity style={[TeamRolesSeatsViewStyles2.button, { marginTop: 16 }]} onPress={handleSendInvite}>
                            <Text style={TeamRolesSeatsViewStyles2.buttonText}>{t("team:rolesSeatsManager:sendInvite")}</Text>
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
