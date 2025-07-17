import { StyleSheet } from 'react-native';

export const readonlyVsEditorStyles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
        flexGrow: 1,
    },
    section: {
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 14
    },
    headerRow: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    label: {
        marginTop: 6,
        marginBottom: 6,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 6,
        marginTop: 6,
        marginBottom: 12,
        backgroundColor: '#f9f9f9',
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 10,
        marginBottom: 12,
        height: 100,
        textAlignVertical: 'top',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    buttonGroup: {
        marginTop: 20,
        marginBottom: 16,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    saveButton: {
        backgroundColor: '#2563eb',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginRight: 5,
    },
    deleteButton: {
        backgroundColor: '#ef4444',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginLeft: 5,
    },
    buttonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: '600',
    },
    linkButton: {
        width: "48%",
        backgroundColor: "#EFEFFF",
        padding: 10,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8
    },
    linkText: {
        fontSize: 16,
        color: "#007AFF"
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    card: {
        padding: 12,
        marginBottom: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    description: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 6,
        marginBottom: 12,
        fontSize: 14,
        color: '#374151',
    },
    meta: {
        fontSize: 12,
        color: '#6b7280',
    },
    readOnlyText: {
        fontSize: 16,
        marginBottom: 8,
    },
    link: {
        color: '#007bff',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 6,
    },
});
