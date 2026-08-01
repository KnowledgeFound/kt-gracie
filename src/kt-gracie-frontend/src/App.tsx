import {
	BrowserRouter,
	Routes,
	Route,
	Navigate,
	Outlet,
	useLocation,
} from 'react-router-dom';
import { UserProvider, useOptionalUser } from '@/features/auth';
import RootLayout from './app/layout';
import HomePage from './app/home/page';
import QuizPage from './app/quiz/page';
import LeaderboardPage from './app/leaderboard/page';
import ProfilePage from './app/profile/page';
import CityScene from './app/city/page';
import SubjectPage from './app/subject/page';
import { TestProgress } from './test/TestProgress';

// ─── Protected route guard ────────────────────────────────────────────────────

/**
 * Renders child routes when a user profile exists.
 * Redirects to /auth otherwise, passing the blocked path in location.state.from
 * so the auth page can send the user back after profile creation.
 */
function ProtectedRoute() {
	const user = useOptionalUser();
	const location = useLocation();
	return user ? (
		<Outlet />
	) : (
		<Navigate to="/" state={{ from: location.pathname }} replace />
	);
}

// ─── Not found ────────────────────────────────────────────────────────────────

const NotFound = () => (
	<div className="flex items-center justify-center min-h-screen text-gray-500 text-xl">
		404 — Page Not Found
	</div>
);

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
	return (
		<UserProvider>
			<BrowserRouter>
				<Routes>
					<Route element={<RootLayout />}>
						{/* Test routes */}
						<Route path="/tests/progress" element={<TestProgress />} />

						{/* Public routes */}
						<Route path="/" element={<HomePage />} />

						{/* Protected routes — require a user profile */}
						<Route element={<ProtectedRoute />}>
							<Route path="/city" element={<CityScene />} />
							<Route path="/leaderboard" element={<LeaderboardPage />} />
							<Route path="/profile" element={<ProfilePage />} />
							<Route path="/subjects" element={<SubjectPage />} />
							<Route path="/quiz" element={<QuizPage />} />
							<Route path="/quiz/:id" element={<QuizPage />} />
						</Route>
					</Route>

					<Route path="*" element={<NotFound />} />
				</Routes>
			</BrowserRouter>
		</UserProvider>
	);
}
