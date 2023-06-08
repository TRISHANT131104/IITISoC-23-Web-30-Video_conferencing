import { createContext } from "react"

const Context = createContext()

export const ContextProvider = ({ children }) => {
    const ContextData = {

    }
    return <Context.Provider value={ContextData}>{children}</Context.Provider>
}

export default Context;