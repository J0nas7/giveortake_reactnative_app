// External
import { NavigationProp, useFocusEffect, useNavigation } from "@react-navigation/native"
import React, { useCallback, useEffect } from "react"

// Internal
import { Startpage, StartpageProps } from '@/src/Components/Auth'
import { useOrganisationsContext, useTeamUserSeatsContext } from "@/src/Contexts"
import { AppDispatch, selectAuthUser, setSnackMessage, useTypedSelector } from "@/src/Redux"
import { faUser } from "@fortawesome/free-regular-svg-icons"
import { useDispatch } from 'react-redux'
import useMainViewJumbotron from "../Hooks/useMainViewJumbotron"
import { MainStackParamList, TeamUserSeat } from "../Types"

export const StartpageView = () => {
    // Hooks
    const dispatch = useDispatch<AppDispatch>()
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const { organisationsById, readOrganisationsByUserId } = useOrganisationsContext()
    const { saveTeamUserSeatChanges, removeTeamUserSeat } = useTeamUserSeatsContext()
    const { handleScroll, handleFocusEffect } = useMainViewJumbotron({
        title: `Give Or Take`,
        faIcon: undefined,
        visibility: 100,
        rightIcon: faUser,
        rightIconActionRoute: "Profile",
    })

    // State
    const authUser = useTypedSelector(selectAuthUser)

    // Effects
    useEffect(() => {
        if (authUser?.User_ID) readOrganisationsByUserId(authUser.User_ID)
    }, [authUser])

    useFocusEffect(
        useCallback(() => {
            handleFocusEffect()
        }, [])
    )

    // Methods
    const approvePending = async (mySeat: TeamUserSeat) => {
        if (!authUser?.User_ID) return

        mySeat.Seat_Status = "Active"; // Set the seat status to active
        const saveChanges = await saveTeamUserSeatChanges(mySeat, mySeat.Team_ID)

        dispatch(setSnackMessage(
            saveChanges ? "Seat approved successfully!" : "Failed to approve seat. Try again."
        ))

        readOrganisationsByUserId(authUser.User_ID)
    }

    const startpageProps: StartpageProps = {
        navigation,
        authUser,
        organisationsById,
        approvePending,
        removeTeamUserSeat
    }

    return <Startpage {...startpageProps} />
}
