import { Backlog, BacklogStates } from '@/src/Types';
import { Button, Text, TextInput, View } from 'react-native';

type DetailsEditorProps = {
    localBacklog: BacklogStates;
    canManageBacklog: boolean | undefined
    handleBacklogInputChange: (name: keyof Backlog, value: string) => void
    handleSaveBacklogChanges: () => Promise<void>;
    handleDeleteBacklog: () => Promise<void>;
    handleBacklogChange: (field: keyof Backlog, value: string) => void;
}

export const BacklogDetailsEditor: React.FC<Partial<DetailsEditorProps>> = ({
    localBacklog,
    canManageBacklog,
    handleBacklogInputChange,
    handleSaveBacklogChanges,
    handleDeleteBacklog,
    handleBacklogChange,
}) => localBacklog && handleBacklogInputChange && handleBacklogChange && (
    <View style={{ marginVertical: 20 }}>
        <Text style={{ fontSize: 18 }}>Edit Backlog Details</Text>
        <TextInput
            placeholder="Backlog Name"
            value={localBacklog.Backlog_Name}
            onChangeText={(text) => handleBacklogInputChange('Backlog_Name', text)}
            style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
        />
        <TextInput
            placeholder="Backlog Description"
            value={localBacklog.Backlog_Description}
            onChangeText={(text) => handleBacklogChange('Backlog_Description', text)}
            multiline
            numberOfLines={4}
            style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
        />
        <TextInput
            placeholder="Start Date"
            value={localBacklog.Backlog_StartDate}
            onChangeText={(text) => handleBacklogChange('Backlog_StartDate', text)}
            style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
        />
        <TextInput
            placeholder="End Date"
            value={localBacklog.Backlog_EndDate}
            onChangeText={(text) => handleBacklogChange('Backlog_EndDate', text)}
            style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button title="Save Changes" onPress={handleSaveBacklogChanges} />
            <Button title="Delete Backlog" color="red" onPress={handleDeleteBacklog} />
        </View>
    </View>
);
