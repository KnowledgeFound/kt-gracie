import type { ReactNode } from 'react';

/** Shared input styling for the account forms. */
export const inputCls =
	'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 transition';

export function Field({
	label,
	htmlFor,
	hint,
	children,
}: {
	label: string;
	htmlFor: string;
	hint?: string;
	children: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<label htmlFor={htmlFor} className="text-sm font-semibold text-gray-700">
				{label}
			</label>
			{children}
			{hint && <p className="text-xs text-gray-500">{hint}</p>}
		</div>
	);
}
