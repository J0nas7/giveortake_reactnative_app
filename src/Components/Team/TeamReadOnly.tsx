import { ReadOnlyRow } from '@/src/Components/ReadOnlyRow';
import { readonlyVsEditorStyles } from '@/src/Core-UI/ReadonlyVsEditorStyles';
import { TeamStates } from '@/src/Types';
import { View } from 'react-native';

type ReadOnlyProps = {
    team: TeamStates;
};

export const TeamReadOnly: React.FC<ReadOnlyProps> = ({
    team
}) => team && (
    <View style={readonlyVsEditorStyles.section}>
        <ReadOnlyRow label="Name" value={team.Team_Name} />
        <ReadOnlyRow
            label="Description"
            value={team.Team_Description || "No description available"}
        />
    </View>
);
