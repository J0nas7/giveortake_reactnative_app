// External
import React from 'react';

// Internal
import { 
    UsersProvider, TeamsProvider, ProjectsProvider, 
    OrganisationsProvider, TeamUserSeatsProvider,
    TasksProvider, TaskTimeTracksProvider, TaskCommentsProvider, TaskMediaFilesProvider
} from "@/src/Contexts"

const providers = [
    UsersProvider,
    TeamsProvider,
    TasksProvider,
    TaskTimeTracksProvider,
    TaskCommentsProvider,
    TaskMediaFilesProvider,
    ProjectsProvider,
    OrganisationsProvider,
    TeamUserSeatsProvider
]

export const TypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return providers.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, children)
}