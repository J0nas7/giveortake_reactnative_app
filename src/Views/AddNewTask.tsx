import { Picker } from '@react-native-picker/picker'
import React from 'react'
import { Button, View } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'

const AddNewTask = () => {
    return (
        <></>
        // <View style={styles.addContainer}>
        //     <TextInput
        //         style={styles.input}
        //         placeholder={t('backlog:task_title')}
        //         value={newTask?.Task_Title}
        //         onChangeText={(text) => handleChangeNewTask('Task_Title', text)}
        //     />

        //     <Picker
        //         selectedValue={newTask?.Task_Status}
        //         onValueChange={(value) => handleChangeNewTask('Task_Status', value)}
        //         style={styles.picker}
        //     >
        //         <Picker.Item label="To Do" value="To Do" />
        //         <Picker.Item label="In Progress" value="In Progress" />
        //         <Picker.Item label="Waiting for Review" value="Waiting for Review" />
        //         <Picker.Item label="Done" value="Done" />
        //     </Picker>

        //     <Button title={t('backlog:create')} onPress={handleCreateTask} />
        // </View>
    )
}

export default AddNewTask
