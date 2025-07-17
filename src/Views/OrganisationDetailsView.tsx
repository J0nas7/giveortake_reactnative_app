// External
import { faBuilding } from '@fortawesome/free-solid-svg-icons';
import { NavigationProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert
} from 'react-native';

// Internal
import {
    OrganisationDetails,
    OrganisationDetailsProps
} from '@/src/Components/Organisation';
import { useOrganisationsContext } from '@/src/Contexts';
import useRoleAccess from '@/src/Hooks/useRoleAccess';
import { selectAuthUser, useTypedSelector } from '@/src/Redux';
import useMainViewJumbotron from '../Hooks/useMainViewJumbotron';
import { MainStackParamList, OrganisationStates } from '../Types';

export const OrganisationDetailsView = () => {
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const route = useRoute();
    const { id: organisationId } = route.params as { id: string };

    const { organisationById, readOrganisationById, saveOrganisationChanges, removeOrganisation } = useOrganisationsContext();
    const { handleScroll, handleFocusEffect } = useMainViewJumbotron({
        title: `Organisation Settings`,
        faIcon: faBuilding,
        visibility: 100,
    });

    const { canModifyOrganisationSettings } = useRoleAccess(
        organisationById ? organisationById?.User_ID : 0,
        "organisation",
        organisationById ? organisationById?.Organisation_ID : 0
    );

    const authUser = useTypedSelector(selectAuthUser);
    const [organisation, setOrganisation] = useState<OrganisationStates>();
    const [showEditToggles, setShowEditToggles] = useState<boolean>(false);

    useEffect(() => {
        readOrganisationById(parseInt(organisationId));
    }, [organisationId]);

    useEffect(() => {
        if (organisationById) {
            setOrganisation(organisationById);
        }
    }, [organisationById]);

    useFocusEffect(
        useCallback(() => {
            handleFocusEffect();
        }, [])
    );

    const handleOrganisationChange = (field: string, value: string) => {
        setOrganisation((prev: any) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSaveChanges = async () => {
        if (organisation) {
            await saveOrganisationChanges(organisation, organisation.User_ID);
            Alert.alert('Changes saved');
        }
    };

    const handleDeleteOrganisation = async () => {
        if (!organisation || !organisation?.Organisation_ID) return;
        await removeOrganisation(organisation.Organisation_ID, organisation.User_ID, undefined);
        navigation.navigate('Home');
    };

    const organisationDetailsProps: OrganisationDetailsProps = {
        organisation,
        canModifyOrganisationSettings,
        showEditToggles,
        setShowEditToggles,
        navigation,
        handleOrganisationChange,
        handleSaveChanges,
        handleDeleteOrganisation,
        handleScroll
    }

    return <OrganisationDetails {...organisationDetailsProps} />
};
