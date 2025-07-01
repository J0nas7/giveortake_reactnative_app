// External
import React from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

// Internal
import { BacklogStates, CommentStates, OrganisationStates, ProjectStates, TeamStates } from '@/src/Types'

type LoadingStateType = {
    singular: string
    renderItem: OrganisationStates | TeamStates | ProjectStates | BacklogStates | CommentStates
    permitted: boolean | undefined
    children?: React.ReactNode
}

export const LoadingState: React.FC<LoadingStateType> = ({
    singular,
    renderItem,
    permitted,
    children,
}) => {
    if (renderItem === undefined) {
        return (
            <View style={styles.spinnerContainer}>
                <ActivityIndicator size="large" color="#888" />
            </View>
        )
    }

    if (permitted !== undefined && !permitted) {
        return (
            <View style={styles.center}>
                <Text style={styles.message}>
                    You don't have permission to view this {singular.toLowerCase()}
                </Text>
            </View>
        )
    }

    if (renderItem === false) {
        return (
            <View style={styles.center}>
                <Text style={styles.message}>{singular} not found</Text>
            </View>
        )
    }

    return <>{children}</>
}

const styles = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    message: {
        color: '#888',
        textAlign: 'center',
    },
    spinnerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
})
