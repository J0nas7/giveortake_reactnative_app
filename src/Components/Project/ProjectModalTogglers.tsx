import { ModalToggler } from '@/src/Components/ModalToggler';
import { ProjectFields, ProjectStates } from '@/src/Types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, View } from 'react-native';

type ModalTogglersProps = {
    project: ProjectStates;
    togglerIsVisible: string | false;
    setTogglerIsVisible: React.Dispatch<React.SetStateAction<string | false>>;
    onFieldChange: (field: ProjectFields, value: string) => void;
};

export const ProjectModalTogglers: React.FC<ModalTogglersProps> = ({
    project,
    togglerIsVisible,
    setTogglerIsVisible,
    onFieldChange,
}) => (
    <ModalToggler visibility={togglerIsVisible} callback={setTogglerIsVisible}>
        {project && (
            <>
                {togglerIsVisible === 'ProjectStatus' && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        {['Planned', 'Active', 'Completed', 'On Hold'].map((status) => (
                            <View key={status} style={{ width: '48%', marginBottom: 4 }}>
                                <Button
                                    title={status}
                                    onPress={() => onFieldChange('Project_Status', status)}
                                    color={project.Project_Status === status ? '#007AFF' : '#ccc'}
                                />
                            </View>
                        ))}
                    </View>
                )}
                {togglerIsVisible && ['ProjectStartDate', 'ProjectEndDate'].includes(togglerIsVisible) && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={new Date(project[togglerIsVisible as 'Project_Start_Date' | 'Project_End_Date'] || Date.now())}
                        mode="date"
                        is24Hour
                        display="spinner"
                        onChange={(event, selectedDate) => {
                            if (selectedDate) {
                                onFieldChange(
                                    togglerIsVisible === 'ProjectStartDate' ? 'Project_Start_Date' : 'Project_End_Date',
                                    selectedDate.toISOString()
                                );
                            }
                        }}
                    />
                )}
            </>
        )}
    </ModalToggler>
);
