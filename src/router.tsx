import { createBrowserRouter } from 'react-router-dom'
import Login from './pages/Login'
import { RootLayout } from './layouts/RootLayout'
import Error from './pages/Error'
import Signup from './pages/Signup'
import Year from './pages/Year'
import Quarter from './pages/Quarter'
import Week from './pages/Week'
import ProtectedRoutes from './components/ProtectedRoutes'
import GoalForm from './components/GoalForm'
import EditGoal from './components/EditGoal'
import SmartRedirect from './components/SmartRedirect'
import { LevelGuard } from './components/LevelGuard'

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            {
                errorElement: <Error />,
                children: [
                    {
                        index: true,
                        element: <Login />
                    },
                    {
                        path: 'login',
                        element: <Login />
                    },
                    {
                        path: 'signup',
                        element: <Signup />
                    },
                    {
                        element: <ProtectedRoutes />,
                        children: [
                            {
                                path: 'home',
                                element: <SmartRedirect />
                            },
                            {
                                path: 'year',
                                children: [
                                    {
                                        index: true,
                                        element: <LevelGuard level="year"><Year /></LevelGuard>
                                    },
                                    {
                                        path: 'new',
                                        element: <LevelGuard level="year" adding><GoalForm type='year' /></LevelGuard>
                                    },
                                    {
                                        path: 'edit/:goalId',
                                        element: <LevelGuard level="year"><EditGoal type='year' /></LevelGuard>
                                    }
                                ]
                            },
                            {
                                path: 'quarter',
                                children: [
                                    {
                                        index: true,
                                        element: <LevelGuard level="quarter"><Quarter /></LevelGuard>
                                    },
                                    {
                                        path: 'new',
                                        element: <LevelGuard level="quarter" adding><GoalForm type='quarter' /></LevelGuard>
                                    },
                                    {
                                        path: 'edit/:goalId',
                                        element: <LevelGuard level="quarter"><EditGoal type='quarter' /></LevelGuard>
                                    }
                                ]
                            },
                            {
                                path: 'week',
                                children: [
                                    {
                                        index: true,
                                        element: <LevelGuard level="week"><Week /></LevelGuard>
                                    },
                                    {
                                        path: 'new',
                                        element: <LevelGuard level="week" adding><GoalForm type='week' /></LevelGuard>
                                    },
                                    {
                                        path: 'edit/:goalId',
                                        element: <LevelGuard level="week"><EditGoal type='week' /></LevelGuard>
                                    }
                                ]
                            }
                        ]
                    },
                ]
            }
        ]
    }
])