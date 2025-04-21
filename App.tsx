// External
import React from 'react'
import { Provider } from 'react-redux'

// Internal
import { ContentView } from "@/src/Views"
import { store } from '@/src/Redux'
import { TypeProvider } from '@/src/Core-UI/TypeProvider'

function App() {
    return (
        <ContentView />
    )
}

const AppProvider = () => (
    <Provider store={store}>
        <TypeProvider>
            <App />
        </TypeProvider>
    </Provider>
)

export default AppProvider