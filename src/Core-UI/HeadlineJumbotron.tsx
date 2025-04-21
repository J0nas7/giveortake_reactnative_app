import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { selectMainViewJumbotron, useTypedSelector } from "../Redux"
import { StackNavigationProp } from "@react-navigation/stack"
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native"
import { MainStackParamList } from "../Types"
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { useCallback, useState } from "react"

export const HeadlineJumbotron: React.FC = () => {
    const mainViewJumbotron = useTypedSelector(selectMainViewJumbotron)
    const navigation = useNavigation<StackNavigationProp<MainStackParamList>>()

    const [canGoBack, setCanGoBack] = useState<boolean>(false);
    
    useFocusEffect(
        useCallback(() => {
            setCanGoBack(navigation.canGoBack());
        }, [navigation])
    );

    if (mainViewJumbotron.visibility === 0) return null

    return (
        <View style={{
            width: '100%',
            height: 100,
            maxHeight: mainViewJumbotron.visibility,
            opacity: mainViewJumbotron.visibility / 100,
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
                justifyContent: mainViewJumbotron.faIcon ? 'space-between' : 'center',
                alignItems: 'center',
                gap: 4,
                padding: 16
            }}>
                {navigation.canGoBack() && (
                    <TouchableOpacity
                        style={{ padding: 4 }}
                        onPress={() => navigation.goBack()}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} color={'white'} size={20} />
                    </TouchableOpacity>
                )}

                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                    {mainViewJumbotron.htmlIcon && (
                        <>
                            {mainViewJumbotron.htmlIcon}{' '}
                        </>
                    )}
                    {mainViewJumbotron.title}
                </Text>

                {mainViewJumbotron.faIcon && (
                    <View style={{ padding: 4 }}></View>
                )}
            </SafeAreaView>
        </View>
    )
}