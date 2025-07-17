import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type HeaderProps = {
    subtitle: string
    showEditToggles: boolean
    setShowEditToggles: (value: boolean) => void
}

export const BacklogsHeader: React.FC<HeaderProps> = ({
    subtitle,
    showEditToggles,
    setShowEditToggles
}) => (
    <>
        <TouchableOpacity onPress={() => setShowEditToggles(!showEditToggles)}>
            <Text style={{ color: 'blue', fontSize: 16 }}>{showEditToggles ? "OK" : "Edit"}</Text>
        </TouchableOpacity>

        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </>
)

const styles = StyleSheet.create({
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 12,
    }
});
