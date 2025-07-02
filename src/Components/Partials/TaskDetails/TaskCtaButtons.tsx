import { useTasksContext } from '@/src/Contexts';
import { AppDispatch, setSnackMessage } from '@/src/Redux';
import { MainStackParamList, Task } from '@/src/Types';
import { faArrowUpFromBracket, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Clipboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';

export const CtaButtons: React.FC<{ task: Task }> = ({ task }) => {
    const dispatch = useDispatch<AppDispatch>()
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const { removeTask, readTasksByBacklogId } = useTasksContext();

    const archiveTask = async (task: Task) => {
        if (!task.Task_ID) return;

        const removed = await removeTask(task.Task_ID, task.Backlog_ID, undefined);
        // if (!removed) return;

        await readTasksByBacklogId(task.Backlog_ID, true);

        navigation.navigate('Project', { id: (task.Backlog_ID).toString() });
    };

    const shareTask = async () => {
        try {
            const url = `https://yourapp.com/task/${task.Task_ID}`; // Update URL logic as necessary
            await Clipboard.setString(url); // Using Clipboard API from React Native
            dispatch(setSnackMessage("Link to task was copied to your clipboard"))
        } catch (err) {
            dispatch(setSnackMessage("Failed to copy link to task"))
        }
    };

    return (
        <CtaButtonsView
            task={task}
            archiveTask={archiveTask}
            shareTask={shareTask}
            navigation={navigation}
        />
    );
};

interface CtaButtonsViewProps {
    task: Task;
    archiveTask: (task: Task) => Promise<void>;
    shareTask: () => Promise<void>;
    navigation: NavigationProp<MainStackParamList>
}

const CtaButtonsView: React.FC<CtaButtonsViewProps> = ({
    task,
    archiveTask,
    shareTask,
    navigation
}) => (
    <View style={ctaButtonsStyles.ctaButtons}>
        <TouchableOpacity
            style={ctaButtonsStyles.ctaButton}
            onPress={() => archiveTask(task)}
        >
            <FontAwesomeIcon icon={faTrashCan} size={20} />
            <Text style={ctaButtonsStyles.buttonText}>Archive</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={ctaButtonsStyles.ctaButton}
            onPress={() => shareTask()}
        >
            <FontAwesomeIcon icon={faArrowUpFromBracket} size={20} />
            <Text style={ctaButtonsStyles.buttonText}>Share</Text>
        </TouchableOpacity>
    </View>
);

const ctaButtonsStyles = StyleSheet.create({
    ctaButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 8,
        margin: 5,
    },
    buttonText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 16,
    },
});
