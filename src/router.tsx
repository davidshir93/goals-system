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
                                path: 'year',
                                children: [
                                    {
                                        index: true,
                                        element: <Year />
                                    },
                                    {
                                        path: 'new',
                                        element: <GoalForm type='year' />
                                    },
                                    {
                                        path: 'edit/:goalId',
                                        element: <EditGoal type='year' />
                                    }
                                ]
                            },
                            {
                                path: 'quarter',
                                children: [
                                    {
                                        index: true,
                                        element: <Quarter />
                                    },
                                    {
                                        path: 'new',
                                        element: <GoalForm type='quarter' />
                                    },
                                    {
                                        path: 'edit/:goalId',
                                        element: <EditGoal type='quarter' />
                                    }
                                ]
                            },
                            {
                                path: 'week',
                                children: [
                                    {
                                        index: true,
                                        element: <Week />
                                    },
                                    {
                                        path: 'new',
                                        element: <GoalForm type='week' />
                                    },
                                    {
                                        path: 'edit/:goalId',
                                        element: <EditGoal type='week' />
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