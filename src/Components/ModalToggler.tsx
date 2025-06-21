import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

type ModalTogglerProps = {
    visibility: string | false
    callback: React.Dispatch<React.SetStateAction<string | false>>
    children: React.ReactNode
}

export const ModalToggler: React.FC<ModalTogglerProps> = ({
    visibility,
    callback,
    children
}) => {
    // ---- Toggler Logic & Animation ----
    const screenHeight = Dimensions.get('window').height;
    const MODAL_HEIGHT = screenHeight * 0.75; // Or your maxHeight
    const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
    const [togglerIsVisible, setTogglerIsVisible] = useState<false | string>(false)

    const handleTogglerVisibility = (visibility: false | string) => {
        if (visibility === false) {
            // Slide out
            Animated.timing(slideAnim, {
                toValue: screenHeight,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                // hide component after animation
                setTogglerIsVisible(false);
                callback(false)
            });
        } else {
            // Slide in

            // Set visible first to render component
            setTogglerIsVisible(visibility);

            // Delay needed so component is in the tree before animating
            requestAnimationFrame(() => {
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            });
        }
    }

    useEffect(() => {
        handleTogglerVisibility(visibility)
    }, [visibility])

    return (
        <ModalTogglerView
            slideAnim={slideAnim}
            togglerIsVisible={togglerIsVisible}
            handleTogglerVisibility={handleTogglerVisibility}
        >
            {children}
        </ModalTogglerView>
    )
}

type BulkEditTogglerViewProps = {
    slideAnim: Animated.Value
    togglerIsVisible: string | false
    handleTogglerVisibility: (visibility: false | string) => void
    children: React.ReactNode
}

export const ModalTogglerView: React.FC<BulkEditTogglerViewProps> = ({
    slideAnim,
    togglerIsVisible,
    handleTogglerVisibility,
    children
}) => togglerIsVisible && (
    <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        style={StyleSheet.absoluteFill}
    >
        <View style={modalTogglerStyles.wrapper}>
            <Animated.View style={[
                modalTogglerStyles.container,
                { transform: [{ translateY: slideAnim }] }
            ]}>
                <View style={modalTogglerStyles.header}>
                    <Text style={modalTogglerStyles.title}>Select {togglerIsVisible}</Text>
                    <TouchableOpacity onPress={() => handleTogglerVisibility(false)}>
                        <FontAwesomeIcon icon={faXmark} size={20} />
                    </TouchableOpacity>
                </View>
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {children}
                </ScrollView>
            </Animated.View>
        </View>
    </KeyboardAvoidingView>
)

const modalTogglerStyles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: 'flex-end', // Push modal to bottom via flex
    },
    container: {
        width: '100%',
        maxHeight: '75%',
        padding: 16,
        backgroundColor: '#fff',
        position: 'absolute',
        zIndex: 1000,
        top: 'auto',
        // bottom: 0,

        opacity: 0.95,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        // Add borderWidth and borderColor for all borders, but mask bottom
        borderWidth: 1,
        borderColor: '#ccc',
        borderBottomWidth: 0, // Hide bottom border
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: { fontWeight: 'bold', fontSize: 20 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    bulkEditItem: {
        position: 'relative',
        width: '100%',
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        marginBottom: 16
    },
    bulkEditItemToggler: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        flex: 1,
        right: 0,
        marginBottom: 0,
        padding: 12,
        borderRadius: 8
    },
    label: { fontWeight: '600', fontSize: 18, marginTop: 12, marginBottom: 4, width: 100 },
    picker: { backgroundColor: '#e5e5e5', marginBottom: 12 },
    actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 }
})
