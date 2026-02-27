import { Outlet } from 'react-router-dom';
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function Layout() {
    return (
        <div className="app-container">
            <Outlet />
        </div>
    );
}
