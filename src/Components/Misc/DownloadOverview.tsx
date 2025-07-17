import { MainStackParamList } from '@/src/Types';
import { NavigationProp } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

export type DisplayFile = {
    mediaId: string;
    filePath: string;
    metadataPath: string;
    displayName: string;
    taskTitle?: string;
    taskKey?: string;
    projectKey?: string;
};

export type OverviewProps = {
    favoriteMedia: DisplayFile | undefined
    navigation: NavigationProp<MainStackParamList>
    groupedFiles: Record<string, DisplayFile[]>
    renderLeftActions: (file: DisplayFile) => React.JSX.Element
    renderRightActions: (file: DisplayFile) => React.JSX.Element
};

export const DownloadOverview: React.FC<OverviewProps> = ({
    favoriteMedia,
    navigation,
    groupedFiles,
    renderLeftActions,
    renderRightActions
}) => (
    <View style={downloadOverviewStyles.container}>
        <Text style={downloadOverviewStyles.title}>Downloaded Files</Text>

        {favoriteMedia && (
            <View style={downloadOverviewStyles.group}>
                <Text style={downloadOverviewStyles.groupTitle}>Favorite ★</Text>
                <TouchableOpacity style={downloadOverviewStyles.item} onPress={() => navigation.navigate('Media', {
                    projectKey: favoriteMedia.projectKey ?? "",
                    taskKey: (favoriteMedia.taskKey ?? "").toString(),
                    mediaID: favoriteMedia.mediaId
                })}>
                    <Text>{favoriteMedia.displayName}</Text>
                </TouchableOpacity>
            </View>
        )}

        {Object.entries(groupedFiles).map(([taskTitle, files]) => (
            <View key={taskTitle} style={downloadOverviewStyles.group}>
                <Text style={downloadOverviewStyles.groupTitle}>Task: {taskTitle}</Text>
                {files.map((file) => (
                    <Swipeable
                        key={file.mediaId}
                        renderLeftActions={() => renderLeftActions(file)}
                        renderRightActions={() => renderRightActions(file)}
                    >
                        <TouchableOpacity style={downloadOverviewStyles.item} onPress={() => navigation.navigate('Media', {
                            projectKey: file.projectKey ?? "",
                            taskKey: (file.taskKey ?? "").toString(),
                            mediaID: file.mediaId
                        })}>
                            <Text>{file.displayName}</Text>
                        </TouchableOpacity>
                    </Swipeable>
                ))}
            </View>
        ))}
    </View>
);

export const downloadOverviewStyles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    group: { marginBottom: 20 },
    groupTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
    item: { padding: 15, backgroundColor: '#f9f9f9', borderBottomWidth: 1, borderColor: '#ddd' },
    swipeActionsButton: {
        display: 'flex',
        gap: 2,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        marginVertical: 1,
    },
    favoriteButton: {
        backgroundColor: '#FFD700', // gold color
    },
    favoriteText: {
        color: '#000',
        fontWeight: 'bold',
    },
    deleteButton: {
        backgroundColor: 'red',
    },
    deleteText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
