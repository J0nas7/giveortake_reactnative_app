import { TaskMediaFile } from '@/src/Types';
import React from 'react';
import { ActivityIndicator, Button, Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Pdf from 'react-native-pdf';

type MediaFileProps = {
    loading: boolean
    media: TaskMediaFile | undefined
    fileDownloaded: boolean
    fileUrl: string
    fileName: string
    Media_File_Type: string
    downloadFile: () => Promise<void>
}

export const MediaFile: React.FC<MediaFileProps> = ({
    loading,
    media,
    fileDownloaded,
    fileUrl,
    fileName,
    Media_File_Type,
    downloadFile
}) => {
    // Render
    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!media) {
        return (
            <View style={styles.centered}>
                <Text>Media not found.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20 }}>
                <Text style={{ textAlign: "center", fontSize: 20, marginVertical: 10 }}>{fileName}</Text>
                {fileDownloaded ? (
                    <Text>Downloaded</Text>
                ) : (
                    <Button title="Download" onPress={downloadFile} />
                )}
            </View>
            {Media_File_Type === 'pdf' ? (
                <>
                    <Pdf
                        source={{ uri: fileUrl, cache: true }}
                        style={styles.pdf}
                        onError={(error) => console.log('PDF Error:', error)}
                    />
                </>
            ) : (media.Media_File_Type === "jpeg" || media.Media_File_Type === "jpg") ? (
                <Image source={{ uri: fileUrl }} style={styles.image} resizeMode="contain" />
            ) : (
                <Text>Unsupported file type: {Media_File_Type}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
    },
    image: {
        flex: 1,
        width: '100%',
    },
});
