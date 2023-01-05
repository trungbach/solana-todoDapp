import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import TodoDAO from "./TodoDAO"

export function useTodo() {
    const { connection } = useConnection()
    const { publicKey } = useWallet()
    const anchorWallet = useAnchorWallet()

    const [initialized, setInitialized] = useState(false)
    const [lastTodo, setLastTodo] = useState(0)
    const [todos, setTodos] = useState([])

    // Muc dich su dung ca loading ca transactionPending de
    // tranh vong lap vo han o ham findProfileAccounts.
    const [loading, setLoading] = useState(false)
    const [transactionPending, setTransactionPending] = useState(false)
    const [input, setInput] = useState("")

    // init Todo program
    const todoProgram = useMemo(() => {
        if (anchorWallet) {
            return new TodoDAO(connection, anchorWallet)
        }
    }, [connection, anchorWallet])

    useEffect(() => {
        // fetch a userProfile if there is a profile then get its TodoAccounts
        // first: find PDA.
        const findProfileAccounts = async () => {
            try {
                setLoading(true)
                const [profilePda, profileBump] = todoProgram.findProgramAddress("USER_STATE", publicKey)

                const profileAccount = await todoProgram.getUserProfile(profilePda)
                if (profileAccount) {
                    setLastTodo(profileAccount.lastTodo)
                    setInitialized(true)
                    const todoAccounts = await todoProgram.getTodoAccount(publicKey)
                    console.log("todoAccounts", todoAccounts)
                    setTodos(todoAccounts)
                } else {
                    console.log("not yet initialize")
                    setInitialized(false)
                }
            } catch (error) {
                console.log("error findProfileAccounts:", error)
                setInitialized(false)
                setTodos([])
            } finally {
                setLoading(false)
            }
        }
        if (todoProgram && publicKey && !transactionPending) {
            findProfileAccounts()
        }
    }, [initialized, publicKey, transactionPending, todoProgram])

    const handleChange = (e) => setInput(e.target.value)

    const initializeUser = async () => {
        // check program exist and wallet connected
        if (todoProgram && publicKey) {
            try {
                setTransactionPending(true)
                const [profilePda, profileBump] = todoProgram.findProgramAddress("USER_STATE", publicKey)
                const transaction = await todoProgram.initializeUser(publicKey, profilePda)
                console.log("transaction", transaction)
                setInitialized(true)
                toast.success("Successfully initialized")
            } catch (error) {
                console.log("error initializeUser", error)
            } finally {
                setTransactionPending(false)
            }
        }
    }

    const addTodo = async (e) => {
        e.preventDefault()
        if (input) {
            try {
                setLoading(true)
                setTransactionPending(true)
                const [profilePda] = todoProgram.findProgramAddress("USER_STATE", publicKey)
                const [todoPda] = todoProgram.findProgramAddress("TODO_STATE", publicKey, lastTodo)
                const transaction = await todoProgram.addTodo(publicKey, profilePda, todoPda, input)
                console.log("transaction", transaction)
                toast.success(`Successfully add todo, tx: ${transaction}`)
                setInput("")
            } catch (error) {
                console.log("error addTodo", error)
            } finally {
                setTransactionPending(false)
                setLoading(false)
            }
        }
    }

    const markTodo = async (todoID) => {
        try {
            setLoading(true)
            setTransactionPending(true)
            const [profilePda] = todoProgram.findProgramAddress("USER_STATE", publicKey)
            const [todoPda] = todoProgram.findProgramAddress("TODO_STATE", publicKey, todoID)
            const transaction = await todoProgram.markTodo(publicKey, profilePda, todoPda, todoID)
            console.log("transaction", transaction)
        } catch (error) {
            console.log("error markTodo", error)
        } finally {
            setTransactionPending(false)
            setLoading(false)
        }
    }

    const removeTodo = async (todoID) => {
        try {
            setTransactionPending(true)
            setLoading(true)
            const [profilePda] = todoProgram.findProgramAddress("USER_STATE", publicKey)
            const [todoPda] = todoProgram.findProgramAddress("TODO_STATE", publicKey, todoID)
            const transaction = await todoProgram.removeTodo(publicKey, profilePda, todoPda, todoID)
            console.log("transaction", transaction)
        } catch (error) {
            console.log("error removeTodo", error)
        } finally {
            setTransactionPending(false)
            setLoading(false)
        }
    }

    const incompleteTodos = useMemo(() => todos.filter((todo) => !todo.account.marked), [todos])
    const completedTodos = useMemo(() => todos.filter((todo) => todo.account.marked), [todos])

    return {
        initialized,
        loading,
        transactionPending,
        completedTodos,
        incompleteTodos,
        removeTodo,
        input,
        setInput,
        handleChange,
        initializeUser,
        addTodo,
        markTodo,
    }
}
