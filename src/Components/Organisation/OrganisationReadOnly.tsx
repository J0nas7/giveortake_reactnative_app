import { ReadOnlyRow } from '@/src/Components/ReadOnlyRow';
import { readonlyVsEditorStyles } from '@/src/Core-UI/ReadonlyVsEditorStyles';
import { OrganisationStates } from '@/src/Types';
import { View } from 'react-native';

type ReadOnlyProps = {
    organisation: OrganisationStates;
};

export const OrganisationReadOnly: React.FC<ReadOnlyProps> = ({
    organisation
}) => organisation && (
    <View style={readonlyVsEditorStyles.section}>
        <ReadOnlyRow label="Name" value={organisation.Organisation_Name} />
        <ReadOnlyRow
            label="Description"
            value={organisation.Organisation_Description || 'No description available'}
        />
    </View>
);
