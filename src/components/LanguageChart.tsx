import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type LanguageDatum = {
	name: string;
	count: number;
	percentage: number;
};

type Props = {
	languages: LanguageDatum[];
};

export default function LanguageChart({ languages }: Props) {
	const colors: Record<string, string> = { TypeScript: '#38bdf8', JavaScript: '#facc15', Python: '#4ade80', Rust: '#fb923c', Go: '#22d3ee', Java: '#f87171', CSS: '#a78bfa', HTML: '#fb7185', Shell: '#cbd5e1' };
	if (!languages.length) {
		return (
			<div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm leading-7 text-slate-300">
				Just getting started — there isn&apos;t enough language data in the last 90 days of public repos to build a chart yet.
			</div>
		);
	}

	return (
		<div className="h-80 rounded-3xl border border-white/10 bg-white/5 p-3 sm:p-4 md:p-6">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={languages} layout="vertical" margin={{ top: 8, right: 20, left: 14, bottom: 8 }}>
					<CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" horizontal={false} />
					<XAxis type="number" hide />
					<YAxis type="category" dataKey="name" width={86} tick={{ fill: '#cbd5e1', fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
					<Tooltip
						cursor={{ fill: 'rgba(245, 158, 11, 0.08)' }}
						contentStyle={{
							background: 'rgba(8, 17, 31, 0.95)',
							border: '1px solid rgba(255,255,255,0.12)',
							borderRadius: '16px',
							color: '#e2e8f0',
							boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
						}}
						formatter={(value: number) => [`${value} repos`, 'language count']}
					/>
					<Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={18} isAnimationActive animationDuration={950}>
						{languages.map((language) => <Cell key={language.name} fill={colors[language.name] ?? '#f59e0b'} />)}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
