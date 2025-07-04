// External
import React from 'react';

// Internal
import {
    BacklogsProvider,
    OrganisationsProvider,
    ProjectsProvider,
    StatusProvider,
    TaskCommentsProvider, TaskMediaFilesProvider,
    TasksProvider, TaskTimeTracksProvider,
    TeamsProvider,
    TeamUserSeatsProvider,
    UsersProvider
} from "@/src/Contexts";

const providers = [
    BacklogsProvider,
    OrganisationsProvider,
    ProjectsProvider,
    UsersProvider,
    StatusProvider,
    TeamsProvider,
    TasksProvider,
    TaskTimeTracksProvider,
    TaskCommentsProvider,
    TaskMediaFilesProvider,
    TeamUserSeatsProvider
]

export const TypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return providers.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, children)
}
