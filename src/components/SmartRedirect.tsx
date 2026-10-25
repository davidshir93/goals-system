import { Navigate } from "react-router-dom";
import { useOnboarding } from "@/hooks/useOnboarding";

/* /home: open the first page where there's something to do — the Year page for a
 * brand-new account, the Quarter page once the year has a goal, then the Week. */
export default function SmartRedirect() {
  const { ready, homePage } = useOnboarding();
  if (!ready) return null; // RootLayout shows the loading state
  return <Navigate to={`/${homePage}`} replace />;
}
