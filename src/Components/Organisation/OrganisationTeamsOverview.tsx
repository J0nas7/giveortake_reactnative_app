import { CreatedAtToTimeSince } from '@/src/Components/CreatedAtToTimeSince';
import { readonlyVsEditorStyles } from '@/src/Core-UI/ReadonlyVsEditorStyles';
import { MainStackParamList, OrganisationStates } from '@/src/Types';
import { NavigationProp } from '@react-navigation/native';
import { Text, View } from 'react-native';

type TeamsOverviewProps = {
    organisation: OrganisationStates;
    navigation: NavigationProp<MainStackParamList>;
};

export const OrganisationTeamsOverview: React.FC<TeamsOverviewProps> = ({
    organisation,
    navigation
}) => organisation && (
    <View style={readonlyVsEditorStyles.section}>
        <Text style={readonlyVsEditorStyles.sectionTitle}>Teams Overview</Text>
        {organisation.teams?.map((team) => (
            <View key={team.Team_ID} style={readonlyVsEditorStyles.card}>
                <Text
                    style={readonlyVsEditorStyles.link}
                    onPress={() =>
                        navigation.navigate('Team', { id: (team.Team_ID || "").toString() })
                    }
                >
                    {team.Team_Name}
                </Text>
                <Text style={readonlyVsEditorStyles.description}>
                    {team.Team_Description || 'No description available'}
                </Text>
                {team.Team_CreatedAt && (
                    <Text style={readonlyVsEditorStyles.meta}>
                        Created: <CreatedAtToTimeSince dateCreatedAt={team.Team_CreatedAt} />
                    </Text>
                )}
                <Text style={readonlyVsEditorStyles.meta}>Members: {team.user_seats?.length || 0}</Text>
            </View>
        ))}
    </View>
);
