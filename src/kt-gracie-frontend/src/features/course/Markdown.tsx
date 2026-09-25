import { Fragment, type ReactNode } from 'react';

/**
 * Tiny markdown renderer for lesson text — headings, quotes, bullet lists,
 * paragraphs, **bold**, *italic* and [links](url). No HTML is ever injected;
 * everything becomes React nodes.
 */

function inline(text: string): ReactNode[] {
	const out: ReactNode[] = [];
	const re = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
	let last = 0;
	let m: RegExpExecArray | null;
	let key = 0;

	while ((m = re.exec(text)) !== null) {
		if (m.index > last) out.push(text.slice(last, m.index));
		const tok = m[0];
		if (tok.startsWith('**')) {
			out.push(<strong key={key++} className="font-bold text-ink-deep">{tok.slice(2, -2)}</strong>);
		} else if (tok.startsWith('*')) {
			out.push(<em key={key++}>{tok.slice(1, -1)}</em>);
		} else {
			const [, label, url] = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok)!;
			const safe = /^https?:\/\//.test(url) ? url : '#';
			out.push(
				<a key={key++} href={safe} target="_blank" rel="noreferrer" className="text-brand-600 underline">
					{label}
				</a>,
			);
		}
		last = m.index + tok.length;
	}
	if (last < text.length) out.push(text.slice(last));
	return out;
}

export default function Markdown({ source }: { source: string }) {
	const blocks: ReactNode[] = [];
	const lines = source.split('\n');
	let i = 0;
	let key = 0;

	while (i < lines.length) {
		const line = lines[i];

		if (!line.trim()) {
			i++;
		} else if (/^#{1,3}\s/.test(line)) {
			const level = line.match(/^#+/)![0].length;
			const text = line.replace(/^#+\s*/, '');
			blocks.push(
				level === 1 ? (
					<h2 key={key++} className="text-2xl md:text-3xl font-extrabold text-ink-deep leading-tight">
						{inline(text)}
					</h2>
				) : (
					<h3 key={key++} className="text-xl font-bold text-ink-deep">
						{inline(text)}
					</h3>
				),
			);
			i++;
		} else if (line.startsWith('>')) {
			const quote: string[] = [];
			while (i < lines.length && lines[i].startsWith('>')) quote.push(lines[i++].replace(/^>\s?/, ''));
			blocks.push(
				<blockquote key={key++} className="border-l-4 border-brand-300 pl-4 py-1 text-lg font-semibold italic text-ink-mid">
					{inline(quote.join(' '))}
				</blockquote>,
			);
		} else if (/^[-*]\s/.test(line)) {
			const items: string[] = [];
			while (i < lines.length && /^[-*]\s/.test(lines[i])) items.push(lines[i++].replace(/^[-*]\s+/, ''));
			blocks.push(
				<ul key={key++} className="list-disc pl-6 space-y-1.5 text-ink-mid">
					{items.map((it, n) => (
						<li key={n}>{inline(it)}</li>
					))}
				</ul>,
			);
		} else {
			const para: string[] = [];
			while (
				i < lines.length &&
				lines[i].trim() &&
				!/^(#{1,3}\s|>|[-*]\s)/.test(lines[i])
			) {
				para.push(lines[i++]);
			}
			blocks.push(
				<p key={key++} className="text-ink-mid leading-relaxed">
					{inline(para.join(' '))}
				</p>,
			);
		}
	}

	return (
		<div className="space-y-4 text-base md:text-lg">
			{blocks.map((b, n) => (
				<Fragment key={n}>{b}</Fragment>
			))}
		</div>
	);
}
