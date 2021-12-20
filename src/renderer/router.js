import { useRoutes } from "react-router-dom";
import App from './App';
import LoginPage from './pages/Login';
import ProjectPage from './pages/Project';
import RegisterPage from "./pages/Login/Register";
const AppRouter = function () {
    let element = useRoutes([
        { path: "/", element: <App /> },
        {
            path: "/login", element: <LoginPage />,
            children: [
                { path: "/register", element: <RegisterPage /> },
            ]
        },
        {
            path: "/project",
            element: <ProjectPage />
        },
    ]);

    return ({ element });
}
export default AppRouter;