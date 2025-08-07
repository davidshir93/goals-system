import type { ReactNode } from "react"
import type { User } from "firebase/auth"
import { createContext, useContext, useEffect, useState } from "react"
import { GoogleAuthProvider, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth"
import { auth } from "../firebase"

type AuthContextType = {
    user: User | null
    loading: boolean
    logIn: typeof logIn
    signUp: typeof signUp
    logOut: typeof logOut
    googleSignIn: typeof googleSignIn
}

const logIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
}

const signUp = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password)
}

const logOut = () => {
    signOut(auth)
}

const googleSignIn = () => {
    const googleAuthProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleAuthProvider)
}

const AuthContext = createContext<AuthContextType | undefined>({
    user: null,
    loading: false,
    logIn,
    signUp,
    logOut,
    googleSignIn
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser)
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading, logIn, logOut, signUp, googleSignIn }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}