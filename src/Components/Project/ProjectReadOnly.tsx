import { ReadOnlyRow } from '@/src/Components/ReadOnlyRow';
import { readonlyVsEditorStyles } from '@/src/Core-UI/ReadonlyVsEditorStyles';
import { ProjectStates } from '@/src/Types';
import { Text } from 'react-native';

type ReadOnlyProps = {
    project: ProjectStates;
};

export const ProjectReadOnly: React.FC<ReadOnlyProps> = ({
    project
}) => project && (
    <>
        <ReadOnlyRow label="Key" value={project.Project_Key} />
        <ReadOnlyRow label="Status" value={project.Project_Status} />
        <Text style={readonlyVsEditorStyles.label}>Description:</Text>
        <Text style={readonlyVsEditorStyles.description}>{project.Project_Description || 'N/A'}</Text>
        <ReadOnlyRow label="Start Date" value={project.Project_Start_Date} />
        <ReadOnlyRow label="End Date" value={project.Project_End_Date} />
    </>
);
