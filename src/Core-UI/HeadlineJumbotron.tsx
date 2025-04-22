// External
import { useCallback, useEffect, useState } from "react"
import { useFocusEffect, useNavigation, useNavigationState } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Alert, SafeAreaView, Text, TouchableOpacity, View } from "react-native"
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"
import { faArrowLeft, faBuilding, faClock, faGauge, faLightbulb, faList, faUsers, faWindowRestore } from "@fortawesome/free-solid-svg-icons"

// Internal
import { selectMainViewJumbotron, useTypedSelector } from "../Redux"
import { MainStackParamList } from "../Types"
import { useProjectsContext, useTeamsContext } from "../Contexts"

export const HeadlineJumbotron: React.FC = () => {
    // const mainViewJumbotron = useTypedSelector(selectMainViewJumbotron)
    const navigation = useNavigation<StackNavigationProp<MainStackParamList>>()

    const currentRoute = useNavigationState((state) => {
        if (!state) return null; // Handle undefined state
        const tabRoute = state.routes[state.index];
        // If tabRoute has nested routes (like stacks), you may want to go deeper:
        const nestedRoute = tabRoute?.state?.routes?.[tabRoute.state.index ?? 0]?.name;
        return nestedRoute ?? tabRoute?.name;
    });

    const faIcons: Record<string, any> = {
        Organisation: faBuilding,
        Team: faUsers,
        Project: faLightbulb,
        Dashboard: faGauge,
        Backlog: faList,
        Kanban: faWindowRestore,
        Time: faClock,
    }

    // if (mainViewJumbotron.visibility === 0) return null

    return (
        <View style={{
            width: '100%',
            height: 100,
            maxHeight: 100,//mainViewJumbotron.visibility,
            opacity: 1,//mainViewJumbotron.visibility / 100,
            borderBottomWidth: 1,
            borderBottomColor: '#ccc',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            backgroundColor: '#4ade80', // Tailwind bg-green-400 equivalent
        }}>
            <SafeAreaView style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 4,
                padding: 16
            }}>
                <TouchableOpacity
                    style={{ padding: 4 }}
                    onPress={() => navigation.goBack()}
                >
                    {navigation.canGoBack() && (
                        <FontAwesomeIcon icon={faArrowLeft} color={'white'} size={20} />
                    )}
                </TouchableOpacity>

                <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    {/* {mainViewJumbotron.htmlIcon ? (
                        <>
                            {mainViewJumbotron.htmlIcon}{' '}
                        </>
                    ) : mainViewJumbotron.faIcon ? (
                        <>
                            <FontAwesomeIcon icon={mainViewJumbotron.faIcon} color={'white'} size={20} />{' '}
                        </>
                    ) : null} */}
                    {currentRoute && faIcons[currentRoute] && (
                        <FontAwesomeIcon icon={faIcons[currentRoute]} color={'white'} size={20} />
                    )}
                    {/* {mainViewJumbotron.title} */}
                    <Text style={{
                        color: 'white',
                        fontSize: 20,
                        fontWeight: 'bold'
                    }}>{' '}{currentRoute}</Text>
                </View>

                <View style={{ minWidth: 20 }}>
                    <ParentButton currentRoute={currentRoute} />
                    {/* {mainViewJumbotron.rightIcon && (
                        <TouchableOpacity
                            style={{ padding: 4 }}
                            onPress={() => {
                                if (mainViewJumbotron.rightIconActionRoute) {
                                    navigation.navigate(
                                        mainViewJumbotron.rightIconActionRoute as keyof MainStackParamList,
                                        mainViewJumbotron.rightIconActionParams
                                    );
                                }
                            }}
                        >
                            <FontAwesomeIcon icon={mainViewJumbotron.rightIcon} color={'white'} size={20} />
                        </TouchableOpacity>
                    )} */}
                </View>
            </SafeAreaView>
        </View>
    )
}

const ParentButton: React.FC<{ currentRoute: string | null }> = ({ currentRoute }) => {
    const navigation = useNavigation<StackNavigationProp<MainStackParamList>>()
    const { teamById } = useTeamsContext();
    const { projectById } = useProjectsContext();

    const faParentIcons: Record<string, any> = {
        Team: faBuilding,
        Project: faUsers,
        Dashboard: faLightbulb,
        Backlog: faLightbulb,
        Kanban: faLightbulb,
        Time: faLightbulb,
    }

    const parentRoute: Record<string, any> = {
        Team: "Organisation",
        Project: "Team",
        Dashboard: "Project",
        Backlog: "Project",
        Kanban: "Project",
        Time: "Project",
    }

    const parentParems: Record<string, any> = {
        Team: { id: ((teamById && teamById.Organisation_ID) ?? "").toString() },
        Project: { id: ((projectById && projectById?.team?.Team_ID) ?? "").toString() },
        Dashboard: { id: ((projectById && projectById?.Project_ID) ?? "").toString() },
        Backlog: { id: ((projectById && projectById?.Project_ID) ?? "").toString() },
        Kanban: { id: ((projectById && projectById?.Project_ID) ?? "").toString() },
        Time: { id: ((projectById && projectById?.Project_ID) ?? "").toString() },
    }

    if (!projectById && !teamById) return null

    return (
        <TouchableOpacity
            style={{ padding: 4 }}
            onPress={() => {
                if (currentRoute) {
                    navigation.navigate(
                        parentRoute[currentRoute] as keyof MainStackParamList,
                        parentParems[currentRoute]
                    );
                }
            }}
        >
            {currentRoute && faParentIcons[currentRoute] && (
                <FontAwesomeIcon icon={faParentIcons[currentRoute]} color={'white'} size={20} />
            )}
        </TouchableOpacity>
    )
}