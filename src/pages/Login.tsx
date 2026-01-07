import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"
import type { LogInInfo } from "@/types/AuthTypes"
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

const initialValue: LogInInfo = {
    email: "",
    password: "",
}

export default function Login() {
    const { t } = useTranslation()
    const [logInInfo, setLogInInfo] = useState<LogInInfo>(initialValue)
    const { googleSignIn, logIn, user } = useAuth()
    const navigate = useNavigate()


    useEffect(() => {
        if (user !== null) navigate("/week")
    }, [user, navigate])

    const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLogInInfo(prevValue => {
            return {
                ...prevValue,
                [e.target.id]: e.target.value
            }
        })
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            await logIn(logInInfo.email, logInInfo.password)
            navigate("/week")
        } catch (err) {
            console.log('Error with email password sign in: ' + err);
        }

    }

    const handleGoogleSignIn = async () => {
        try {
            await googleSignIn()
            navigate("/week")
        } catch (err) {
            console.log('Error with google sign in: ' + err);
        }
    }

    return (
        <Card className="max-w-md mx-auto">
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle className="text-2xl text-center mb-4">{t('auth.title')}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="grid gap-6">
                        <Button variant="outline" onClick={handleGoogleSignIn} type="button">
                            <svg role="img" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                />
                            </svg>
                            {t('auth.signInWithGoogle')}
                        </Button>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card text-muted-foreground px-2">
                                {t('common.or')}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Label htmlFor="email">{t('auth.email')}</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder={t('auth.emailPlaceholder')}
                            onChange={handleFormChange}
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="password">{t('auth.password')}</Label>
                        <Input id="password" type="password" onChange={handleFormChange} />
                    </div>

                </CardContent>
                <CardFooter className="flex flex-col">
                    <Button className="w-full mt-4">{t('auth.loginButton')}</Button>
                    <p className="mt-3 text-sm text-center">{t('auth.noAccount')} <Link to="/signup" className="underline">{t('nav.signUp')}</Link></p>
                </CardFooter>
            </form>
        </Card>
    )
}
