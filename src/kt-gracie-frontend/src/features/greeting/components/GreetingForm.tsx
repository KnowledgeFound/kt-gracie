import { FormEvent } from 'react';
import { useGreet } from '../hooks/useGreet';

export default function GreetingForm() {
	const greet = useGreet();

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const name = formData.get('name') as string;
		greet.mutate({ name });
	}

	return (
		<>
			<form
				action="#"
				onSubmit={handleSubmit}
				className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm"
			>
				<label htmlFor="name" className="sr-only">
					Enter your name
				</label>
				<input
					id="name"
					name="name"
					type="text"
					placeholder="Enter your name"
					className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
				/>
				<button
					type="submit"
					className="px-5 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition"
				>
					Greet
				</button>
			</form>
			{greet.data && (
				<p
					id="greeting"
					className="mt-4 px-6 py-3 border border-gray-200 rounded-lg text-ink-deep"
				>
					{greet.data}
				</p>
			)}
		</>
	);
}
