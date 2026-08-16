import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, ShieldAlert, Trash2, UserRound } from 'lucide-react';
import { useUser } from '@/features/auth';
import { AGE_BUCKET_LABELS, REGION_LABELS } from '@/features/auth/constants';
import { useSettings } from '../context';
import { clearIntroShown } from '../service';
import SettingRow from './SettingRow';
import SettingsCard from './SettingsCard';

function formatDate(iso?: string): string {
	if (!iso) return '—';
	const date = new Date(iso);
	return Number.isNaN(date.getTime())
		? '—'
		: date.toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
		  });
}

const dangerButton =
	'flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors ' +
	'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
	'focus-visible:ring-offset-surface-card';

/** Profile summary, a reset for these settings, and account deletion. */
export default function AccountPanel() {
	const navigate = useNavigate();
	const { user, deleteUser } = useUser();
	const { reset } = useSettings();
	const [confirmingDelete, setConfirmingDelete] = useState(false);

	return (
		<div className="space-y-4">
			<SettingsCard
				icon={UserRound}
				title="Profile"
				description="Everything here lives on this device only."
				footer={
					<button
						type="button"
						onClick={() => navigate('/profile')}
						className="text-xs font-bold text-brand-600 hover:underline dark:text-brand-300"
					>
						Edit profile details →
					</button>
				}
			>
				<SettingRow title="Name">
					<span className="text-sm font-semibold text-ink-deep">
						{user?.firstName ?? '—'}
					</span>
				</SettingRow>
				<SettingRow title="Age range">
					<span className="text-sm text-ink-mid">
						{user ? AGE_BUCKET_LABELS[user.ageBucket] : '—'}
					</span>
				</SettingRow>
				<SettingRow title="Region">
					<span className="text-sm text-ink-mid">
						{user ? REGION_LABELS[user.region] : '—'}
					</span>
				</SettingRow>
				<SettingRow title="Mayor since">
					<span className="text-sm text-ink-mid">
						{formatDate(user?.createdAt)}
					</span>
				</SettingRow>
			</SettingsCard>

			<SettingsCard
				icon={ShieldAlert}
				title="Data & reset"
				description="Undo your customisations, or clear this device entirely."
			>
				<SettingRow
					title="Reset settings"
					description="Restores the default theme, guide and city options. Your progress is untouched."
				>
					<button
						type="button"
						onClick={reset}
						className={`${dangerButton} border border-line-strong text-ink-deep hover:bg-surface-raised focus-visible:ring-brand-400`}
					>
						<RotateCcw className="size-3.5" />
						Reset
					</button>
				</SettingRow>

				<SettingRow
					title="Delete profile"
					description="Removes your mayor profile, city and progress from this device. This cannot be undone."
					stacked={confirmingDelete}
				>
					{confirmingDelete ? (
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-xs font-semibold text-rose-600">
								Delete everything on this device?
							</span>
							<button
								type="button"
								onClick={() => {
									deleteUser();
									// The next profile on this device is a new mayor — they
									// should meet Gracie from the top.
									clearIntroShown();
									navigate('/');
								}}
								className={`${dangerButton} bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-400`}
							>
								<Trash2 className="size-3.5" />
								Yes, delete
							</button>
							<button
								type="button"
								onClick={() => setConfirmingDelete(false)}
								className={`${dangerButton} border border-line-strong text-ink-deep hover:bg-surface-raised focus-visible:ring-brand-400`}
							>
								Cancel
							</button>
						</div>
					) : (
						<button
							type="button"
							onClick={() => setConfirmingDelete(true)}
							className={`${dangerButton} border border-rose-300 text-rose-600 hover:bg-rose-50 focus-visible:ring-rose-400`}
						>
							<Trash2 className="size-3.5" />
							Delete
						</button>
					)}
				</SettingRow>
			</SettingsCard>
		</div>
	);
}
