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
					className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
				/>
				<button
					type="submit"
					className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
				>
					Greet
				</button>
			</form>
			{greet.data && (
				<p
					id="greeting"
					className="mt-4 px-6 py-3 border border-gray-300 rounded-lg text-gray-800"
				>
					{greet.data}
				</p>
			)}
		</>
	);
}
