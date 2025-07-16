import { View } from "react-native";
import { Text } from "react-native-gesture-handler";

export const ReadOnlyRow = ({ label, value }: { label: string; value?: string | null }) => (
    <View style={{ marginBottom: 10 }}>
        <Text style={{ fontWeight: "600" }}>{label}:</Text>
        <Text style={{ color: "#444" }}>{value || "No information available"}</Text>
    </View>
);
