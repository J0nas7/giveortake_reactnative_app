// External
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Internal
import {
    selectDeleteConfirm,
    selectSnackMessage,
    setDeleteConfirm,
    setSnackMessage,
    useAppDispatch,
    useTypedSelector,
} from '@/src/Redux';

export const SnackBar = () => {
    const dispatch = useAppDispatch();

    const snackMessage = useTypedSelector(selectSnackMessage);
    const deleteConfirm = useTypedSelector(selectDeleteConfirm);

    useEffect(() => {
        const timer = setTimeout(() => {
            resetSnackMessage();
        }, 8000);

        return () => clearTimeout(timer);
    }, [snackMessage]);

    const resetSnackMessage = () => dispatch(setSnackMessage(undefined));

    const handleDeleteConfirm = (answer: boolean) => {
        if (!deleteConfirm) return;

        dispatch(
            setDeleteConfirm({
                ...deleteConfirm,
                confirm: answer,
            })
        );
    };

    if (!snackMessage && deleteConfirm === undefined) return null;

    return (
        <View style={styles.container}>
            {deleteConfirm ? (
                <View style={styles.contentRow}>
                    <Text style={styles.text}>
                        Are you sure you want to delete this {deleteConfirm.singular}?
                    </Text>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity onPress={() => handleDeleteConfirm(false)}>
                            <Text style={styles.cancelButton}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteConfirm(true)} style={styles.confirmButton}>
                            <Text style={styles.confirmButtonText}>Yes, delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.contentRow}>
                    <Text style={styles.text}>{snackMessage}</Text>
                    <TouchableOpacity onPress={resetSnackMessage}>
                        <FontAwesomeIcon icon={faXmark} size={20} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 24,
        left: 16,
        right: 16,
        backgroundColor: '#f5f5f5',
        padding: 16,
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        zIndex: 100,
    },
    contentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    text: {
        flex: 1,
        fontWeight: '600',
        marginRight: 8,
    },
    cancelButton: {
        color: '#666',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    confirmButton: {
        backgroundColor: '#dc2626',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
