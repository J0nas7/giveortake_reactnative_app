import { TeamEditor, TeamHeader, TeamProjectsOverview, TeamReadOnly } from '@/src/Components/Team';
import { LoadingState } from '@/src/Core-UI/LoadingState';
import { readonlyVsEditorStyles } from '@/src/Core-UI/ReadonlyVsEditorStyles';
import { MainStackParamList, TeamFields, TeamStates } from '@/src/Types';
import { NavigationProp } from '@react-navigation/native';
import { ScrollView } from 'react-native';

export type TeamDetailsProps = {
    localTeam: TeamStates;
    canManageTeamMembers: boolean | undefined
    canModifyTeamSettings: boolean | undefined
    navigation: NavigationProp<MainStackParamList>
    showEditToggles: boolean;
    setShowEditToggles: React.Dispatch<React.SetStateAction<boolean>>
    handleTeamChange: (field: TeamFields, value: string) => void;
    handleSaveChanges: () => void;
    handleDeleteTeam: () => void;
    handleScroll?: (e: any) => void;
};

export const TeamDetails: React.FC<TeamDetailsProps> = ({
    localTeam,
    canManageTeamMembers,
    canModifyTeamSettings,
    navigation,
    showEditToggles,
    setShowEditToggles,
    handleTeamChange,
    handleSaveChanges,
    handleDeleteTeam,
    handleScroll
}) => (
    <ScrollView style={readonlyVsEditorStyles.container} onScroll={handleScroll}>
        <LoadingState singular="Team" renderItem={localTeam} permitted={undefined}>
            {localTeam && (
                <>
                    <TeamHeader
                        teamName={localTeam.Team_Name}
                        teamId={localTeam.Team_ID}
                        canModifyTeamSettings={canModifyTeamSettings}
                        canManageTeamMembers={canManageTeamMembers}
                        showEditToggles={showEditToggles}
                        setShowEditToggles={setShowEditToggles}
                        navigation={navigation}
                    />

                    {canModifyTeamSettings && showEditToggles ? (
                        <TeamEditor
                            team={localTeam}
                            onChange={handleTeamChange}
                            onSave={handleSaveChanges}
                            onDelete={handleDeleteTeam}
                            navigation={navigation}
                        />
                    ) : (
                        <TeamReadOnly team={localTeam} />
                    )}

                    {!showEditToggles && (
                        <TeamProjectsOverview team={localTeam} navigation={navigation} />
                    )}
                </>
            )}
        </LoadingState>
    </ScrollView>
);
