// External
import { faClock, faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// Internal
import { TimeTracks, TimeTracksProps } from '@/src/Components/Project';
import { useProjectsContext, useTaskTimeTrackContext, useTeamUserSeatsContext } from "@/src/Contexts";
import { Backlog, Project, Task, TaskTimeTrack, TeamUserSeat } from "@/src/Types";
import useMainViewJumbotron from "../Hooks/useMainViewJumbotron";

export const TimeTracksView = () => {
    // Hooks
    const route = useRoute();
    const navigation = useNavigation();
    const { t } = useTranslation(["timetrack"]);
    const { projectById, readProjectById } = useProjectsContext();
    const { taskTimeTracksByProjectId, getTaskTimeTracksByProject } = useTaskTimeTrackContext();
    const { teamUserSeatsById, readTeamUserSeatsByTeamId } = useTeamUserSeatsContext();
    const { handleScroll, handleFocusEffect } = useMainViewJumbotron({
        title: `Time Entries`,
        faIcon: faClock,
        visibility: 100,
        rightIcon: faLightbulb,
        rightIconActionRoute: "Project",
        rightIconActionParams: { id: ((projectById && projectById?.Project_ID) ?? "").toString() },
    })

    const {
        id: projectId,
        startDate: startDateParam,
        endDate: endDateParam,
        userIds: urlUserIds,
        backlogIds: urlBacklogIds,
        taskIds: urlTaskIds
    } = route.params as {
        id: string;
        startDate?: string;
        endDate?: string;
        userIds?: string;
        backlogIds?: string;
        taskIds?: string;
    };

    // State
    const [filterTimeEntries, setFilterTimeEntries] = useState(false);

    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
    const [selectedBacklogIds, setSelectedBacklogIds] = useState<string[]>([])


    const [renderProject, setRenderProject] = useState<Project | undefined>();
    const [renderTimeTracks, setRenderTimeTracks] = useState<TaskTimeTrack[] | undefined>();

    const [sortedByDuration, setSortedByDuration] = useState<TaskTimeTrack[]>([]);
    const [sortedByLatest, setSortedByLatest] = useState<TaskTimeTrack[]>([]);

    // Extract all tasks from the project's backlogs
    const allProjectTasks = renderProject && renderProject?.backlogs
        ?.flatMap((backlog) => backlog.tasks || []) || [];

    // Methods
    const getPreviousWeekStartAndEnd = (): { startTime: string; endTime: string } => {
        const today = new Date();

        // Set time to midnight for accuracy
        today.setHours(0, 0, 0, 0);

        // Get current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        const dayOfWeek = today.getDay();

        // Adjust so Monday is the first day of the week
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days; else go back (dayOfWeek - 1)

        // Start of previous week (last week's Monday)
        const startOfPreviousWeek = new Date(today);
        startOfPreviousWeek.setDate(today.getDate() - mondayOffset - 7); // Go back 7 days from this week's Monday

        // End of previous week (last week's Sunday)
        const endOfPreviousWeek = new Date(startOfPreviousWeek);
        endOfPreviousWeek.setDate(startOfPreviousWeek.getDate() + 6); // Move to Sunday of that week
        endOfPreviousWeek.setHours(23, 59, 59, 0);

        // Format function to YYYY-MM-DD HH:mm:ss
        const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            // return `${year}-${month}-${day}`;
        };

        return {
            startTime: formatDate(startOfPreviousWeek),
            endTime: formatDate(endOfPreviousWeek),
        };
    };

    const { startTime: defaultStart, endTime: defaultEnd } = getPreviousWeekStartAndEnd();
    const [startDate, setStartDate] = useState<string>(startDateParam || defaultStart);
    const [endDate, setEndDate] = useState<string>(endDateParam || defaultEnd);

    // Effects
    // Sync selected backlog IDs with URL or default to all backlogs
    useEffect(() => {
        if (!renderProject) return

        if (urlBacklogIds) {
            // If backlogIds exist in the URL, use them
            const backlogIdsFromURL = urlBacklogIds ? urlBacklogIds.split(",") : [];
            setSelectedBacklogIds(backlogIdsFromURL);
        } else if (renderProject?.backlogs?.length) {
            // If no backlogIds in URL, select all backlogs by default
            const allBacklogIds = renderProject.backlogs
                .map((backlog: Backlog) => backlog.Backlog_ID?.toString())
                .filter((backlogId) => backlogId !== undefined) // Remove undefined values
            setSelectedBacklogIds(allBacklogIds)
        }
    }, [urlBacklogIds, renderProject])

    useEffect(() => {
        if (urlUserIds) {
            // If userIds exist in the URL, use them
            const userIdsFromURL = urlUserIds ? urlUserIds.split(",") : [];
            setSelectedUserIds(userIdsFromURL);
        } else if (teamUserSeatsById.length) {
            // If no userIds in URL, select all users by default
            const allUserIds = teamUserSeatsById
                .map((userSeat: TeamUserSeat) => userSeat.user?.User_ID?.toString())
                .filter((userId) => userId !== undefined) // Remove undefined values
            setSelectedUserIds(allUserIds)
        }
    }, [urlUserIds, teamUserSeatsById]);

    useEffect(() => {
        if (urlTaskIds) {
            // If taskIds exist in the URL, use them
            const taskIdsFromURL = urlTaskIds ? urlTaskIds.split(",") : []
            setSelectedTaskIds(taskIdsFromURL)
        } else if (allProjectTasks.length) {
            // If no taskIds in URL, select all tasks by default
            const allTaskIds = allProjectTasks
                .map((task: Task) => task.Task_ID?.toString())
                .filter((taskId): taskId is string => taskId !== undefined) // Remove undefined values

            setSelectedTaskIds(allTaskIds);
        }
    }, [urlTaskIds, renderProject]);

    useEffect(() => {
        const loadRenders = async () => {
            console.log("loadRenders", selectedBacklogIds, selectedUserIds, selectedTaskIds)
            if (selectedBacklogIds.length && selectedUserIds.length && selectedTaskIds.length) {
                await getTaskTimeTracksByProject(
                    parseInt(projectId),
                    startDate,
                    endDate,
                    selectedBacklogIds,
                    selectedUserIds,
                    selectedTaskIds
                )
            }
        }
        loadRenders()
    }, [projectId, selectedBacklogIds, selectedUserIds, selectedTaskIds, startDate, endDate])

    useEffect(() => {
        if (projectId) {
            readProjectById(parseInt(projectId));
        }
    }, [projectId]);

    useEffect(() => {
        if (projectById) {
            setRenderProject(projectById);
        }
    }, [projectById]);

    useEffect(() => {
        if (taskTimeTracksByProjectId?.length) {
            setRenderTimeTracks(taskTimeTracksByProjectId);
        } else {
            setRenderTimeTracks(undefined);
        }
    }, [taskTimeTracksByProjectId]);

    useEffect(() => {
        if (renderTimeTracks?.length) {
            setSortedByDuration([...renderTimeTracks].sort((a, b) => (b.Time_Tracking_Duration ?? 0) - (a.Time_Tracking_Duration ?? 0)));
            setSortedByLatest([...renderTimeTracks].sort((a, b) => (b.Time_Tracking_ID ?? 0) - (a.Time_Tracking_ID ?? 0)));
        } else {
            setSortedByDuration([]);
            setSortedByLatest([]);
        }
    }, [renderTimeTracks]);

    useEffect(() => {
        if (renderProject?.team?.Team_ID && !teamUserSeatsById.length) {
            readTeamUserSeatsByTeamId(renderProject.team.Team_ID);
        }
    }, [renderProject]);

    useFocusEffect(
        useCallback(() => {
            handleFocusEffect();
        }, [])
    );

    if (!renderProject) return null

    const timeTracksProps: TimeTracksProps = {
        selectedTaskIds,
        renderProject,
        renderTimeTracks,
        startDate,
        endDate,
        sortedByLatest,
        sortedByDuration
    }

    return <TimeTracks {...timeTracksProps} />
};
