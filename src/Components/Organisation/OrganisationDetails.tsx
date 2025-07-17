import { OrganisationEditor, OrganisationHeader, OrganisationReadOnly, OrganisationTeamsOverview } from '@/src/Components/Organisation';
import { LoadingState } from '@/src/Core-UI/LoadingState';
import { readonlyVsEditorStyles } from '@/src/Core-UI/ReadonlyVsEditorStyles';
import { MainStackParamList, OrganisationStates } from '@/src/Types';
import { NavigationProp } from '@react-navigation/native';
import { ScrollView } from 'react-native';

export type OrganisationDetailsProps = {
    organisation: OrganisationStates;
    canModifyOrganisationSettings: boolean | undefined;
    showEditToggles: boolean;
    setShowEditToggles: React.Dispatch<React.SetStateAction<boolean>>;
    navigation: NavigationProp<MainStackParamList>;
    handleOrganisationChange: (field: string, value: string) => void;
    handleSaveChanges: () => void;
    handleDeleteOrganisation: () => void;
    handleScroll?: (e: any) => void;
};

export const OrganisationDetails: React.FC<OrganisationDetailsProps> = ({
    organisation,
    canModifyOrganisationSettings,
    showEditToggles,
    setShowEditToggles,
    navigation,
    handleOrganisationChange,
    handleSaveChanges,
    handleDeleteOrganisation,
    handleScroll
}) => (
    <ScrollView style={readonlyVsEditorStyles.container} onScroll={handleScroll}>
        <LoadingState singular="Organisation" renderItem={organisation} permitted={undefined}>
            {organisation && (
                <>
                    <OrganisationHeader
                        organisationName={organisation.Organisation_Name}
                        canEdit={!!canModifyOrganisationSettings}
                        showEditToggles={showEditToggles}
                        setShowEditToggles={setShowEditToggles}
                    />

                    {canModifyOrganisationSettings && showEditToggles ? (
                        <OrganisationEditor
                            organisation={organisation}
                            onChange={handleOrganisationChange}
                            onSave={handleSaveChanges}
                            onDelete={handleDeleteOrganisation}
                            navigation={navigation}
                        />
                    ) : (
                        <OrganisationReadOnly organisation={organisation} />
                    )}

                    {!showEditToggles && (
                        <OrganisationTeamsOverview organisation={organisation} navigation={navigation} />
                    )}
                </>
            )}
        </LoadingState>
    </ScrollView>
);
