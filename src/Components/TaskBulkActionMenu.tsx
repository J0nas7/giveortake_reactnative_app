import React, { useState } from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
// import Clipboard from '@react-native-clipboard/clipboard'
import { useNavigation, useRoute } from '@react-navigation/native'

// Internal
import { useProjectsContext, useTasksContext } from '@/src/Contexts'
import { useAxios } from '@/src/Hooks'
import { faCheck, faCopy, faPencilAlt, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'

type TaskBulkActionMenuProps = {
    selectedTaskIds: string[]
    setSelectedTaskIds: React.Dispatch<React.SetStateAction<string[]>>
}

export const TaskBulkActionMenu: React.FC<TaskBulkActionMenuProps> = ({
    selectedTaskIds,
    setSelectedTaskIds
}) => {
    // ---- Hooks ----
    const navigation = useNavigation()
    const route = useRoute()
    const { httpPostWithData } = useAxios()
    const { readTasksByBacklogId } = useTasksContext()
    const { readProjectById } = useProjectsContext()

    // ---- State ----
    const { id: projectId } = route.params as { id: string };  // Get id as projectId from route params
    const [copySuccess, setCopySuccess] = useState(false)
    const [taskBulkEditing, setTaskBulkEditing] = useState(false)

    // ---- Methods ----
    const handleCopy = async (text: string) => {
        // Clipboard.setString(text)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
    }

    const handleDelete = async () => {
        if (!selectedTaskIds.length) return
        Alert.alert("Confirm", "Are you sure you want to delete the items?", [
            {
                text: "Cancel",
                style: "cancel"
            },
            {
                text: "Delete",
                onPress: async () => {
                    const result = await httpPostWithData("tasks/bulk-destroy", {
                        task_ids: JSON.stringify(selectedTaskIds)
                    })

                    if (result.success) {
                        await readProjectById(parseInt(projectId))
                        setSelectedTaskIds([])
                    }
                }
            }
        ])
    }

    if (!selectedTaskIds.length) return null

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.counter}>{selectedTaskIds.length} tasks selected</Text>
                <TouchableOpacity onPress={() => setSelectedTaskIds([])}>
                    <FontAwesomeIcon icon={faXmark} size={20} />
                </TouchableOpacity>
            </View>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.button} onPress={() => setTaskBulkEditing(true)}>
                    <FontAwesomeIcon icon={faPencilAlt} size={18} />
                    <Text>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => handleCopy("exampleText")}>
                    <FontAwesomeIcon icon={copySuccess ? faCheck : faCopy} size={18} />
                    <Text>{copySuccess ? `${selectedTaskIds.length} copied` : 'Copy to clipboard'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleDelete}>
                    <FontAwesomeIcon icon={faTrash} size={18} />
                    <Text>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 16,
        backgroundColor: '#fff',
        position: 'absolute',
        zIndex: 1000,
        top: 'auto',

        opacity: 0.95,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        // Add borderWidth and borderColor for all borders, but mask bottom
        borderWidth: 1,
        borderColor: '#ccc',
        borderBottomWidth: 0, // Hide bottom border
        bottom: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    counter: { fontWeight: 'bold', fontSize: 20 },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 8,
        gap: 8,
        width: '100%'
    },
    button: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 8 }
})
