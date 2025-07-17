import { CreateTaskView, RenderBacklogView } from '@/src/Components/Backlog';
import { LoadingState } from '@/src/Core-UI/LoadingState';
import { BacklogStates, MainStackParamList, Task, TaskFields } from '@/src/Types';
import { NavigationProp } from '@react-navigation/native';
import { TFunction } from 'i18next';

export type BacklogProps = {
    renderBacklog?: BacklogStates;
    sortedTasks: Task[];
    currentSort: string;
    currentOrder: string;
    t: TFunction
    navigation: NavigationProp<MainStackParamList>
    selectedTaskIds: string[]
    setSelectedTaskIds: React.Dispatch<React.SetStateAction<string[]>>
    selectedStatusIds: string[]
    selectAll: boolean
    canAccessBacklog: boolean | undefined
    canManageBacklog: boolean | undefined
    backlogsViewRefreshing: boolean
    handleSort: (column: string) => void;
    handleCreateTask: () => void;
    ifEnter: (e: React.KeyboardEvent) => Promise<void> | null
    handleInputKeyPress: (e: any) => void
    newTask: Task | undefined
    handleChangeNewTask: (field: TaskFields, value: string) => Promise<void>
    setTaskDetail: (task: Task) => void;
    handleCheckboxChange: (taskId: string) => void
    handleSelectAllChange: (checked: boolean) => void
    displaySubview: string
    setDisplaySubview: React.Dispatch<React.SetStateAction<string>>
    backlogViewRefresh: () => Promise<void>
}

export const Backlog: React.FC<BacklogProps> = ({
    renderBacklog,
    sortedTasks,
    currentSort,
    currentOrder,
    t,
    navigation,
    selectedTaskIds,
    setSelectedTaskIds,
    selectedStatusIds,
    selectAll,
    canAccessBacklog,
    canManageBacklog,
    backlogsViewRefreshing,
    handleSort,
    handleCreateTask,
    ifEnter,
    handleInputKeyPress,
    newTask,
    handleChangeNewTask,
    setTaskDetail,
    handleCheckboxChange,
    handleSelectAllChange,
    displaySubview,
    setDisplaySubview,
    backlogViewRefresh
}) => !backlogsViewRefreshing && (
    <LoadingState singular="Backlog" renderItem={renderBacklog} permitted={canAccessBacklog}>
        {displaySubview === "CreateTask" && renderBacklog ? (
            <CreateTaskView
                renderBacklog={renderBacklog}
                newTask={newTask}
                handleChangeNewTask={handleChangeNewTask}
                handleInputKeyPress={handleInputKeyPress}
                handleCreateTask={handleCreateTask}
                setDisplaySubview={setDisplaySubview}
                backlogsViewRefreshing={backlogsViewRefreshing}
                backlogViewRefresh={backlogViewRefresh}
            />
        ) : displaySubview === "FilterStatuses" && renderBacklog ? (
            <>

            </>
        ) : renderBacklog ? (
            <RenderBacklogView
                navigation={navigation}
                renderBacklog={renderBacklog}
                sortedTasks={sortedTasks}
                selectAll={selectAll}
                selectedStatusIds={selectedStatusIds}
                selectedTaskIds={selectedTaskIds}
                handleCheckboxChange={handleCheckboxChange}
                handleSelectAllChange={handleSelectAllChange}
                setDisplaySubview={setDisplaySubview}
                backlogsViewRefreshing={backlogsViewRefreshing}
                backlogViewRefresh={backlogViewRefresh}
                setSelectedTaskIds={setSelectedTaskIds}
            />
        ) : null}
    </LoadingState>
);
