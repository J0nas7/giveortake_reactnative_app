import { ProjectBacklogsSection, ProjectEditor, ProjectHeader, ProjectModalTogglers, ProjectReadOnly } from '@/src/Components/Project';
import { LoadingState } from '@/src/Core-UI/LoadingState';
import { readonlyVsEditorStyles } from '@/src/Core-UI/ReadonlyVsEditorStyles';
import { ProjectFields, ProjectStates } from '@/src/Types';
import { ScrollView } from 'react-native';

export type ProjectDetailsProps = {
    renderProject: ProjectStates;
    showEditToggles: boolean;
    setShowEditToggles: (show: boolean) => void;
    togglerIsVisible: false | string;
    setTogglerIsVisible: React.Dispatch<React.SetStateAction<string | false>>
    canAccessProject: boolean | undefined;
    canManageProject: boolean | undefined;
    handleProjectChange: (field: ProjectFields, value: string) => void;
    handleSaveChanges: () => void;
    handleDeleteProject: () => void;
    authUser: any;
    accessibleBacklogsCount: number;
};

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({
    renderProject,
    showEditToggles,
    setShowEditToggles,
    togglerIsVisible,
    setTogglerIsVisible,
    canAccessProject,
    canManageProject,
    handleProjectChange,
    handleSaveChanges,
    handleDeleteProject,
    authUser,
    accessibleBacklogsCount
}) => (
    <>
        <ScrollView contentContainerStyle={readonlyVsEditorStyles.container}>
            <LoadingState singular="Project" renderItem={renderProject} permitted={canAccessProject}>
                {renderProject && (
                    <>
                        <ProjectHeader
                            name={renderProject.Project_Name}
                            showEditToggles={showEditToggles}
                            setShowEditToggles={setShowEditToggles}
                            canManageProject={canManageProject}
                        />

                        {canManageProject && showEditToggles ? (
                            <ProjectEditor
                                project={renderProject}
                                onFieldChange={handleProjectChange}
                                onSave={handleSaveChanges}
                                onDelete={handleDeleteProject}
                                setTogglerIsVisible={setTogglerIsVisible}
                            />
                        ) : (
                            <ProjectReadOnly project={renderProject} />
                        )}

                        {!showEditToggles && (
                            <ProjectBacklogsSection
                                renderProject={renderProject}
                                canManageProject={canManageProject}
                                authUser={authUser}
                                accessibleBacklogsCount={accessibleBacklogsCount}
                            />
                        )}
                    </>
                )}
            </LoadingState>
        </ScrollView>

        <ProjectModalTogglers
            project={renderProject}
            togglerIsVisible={togglerIsVisible}
            setTogglerIsVisible={setTogglerIsVisible}
            onFieldChange={handleProjectChange}
        />
    </>
);
