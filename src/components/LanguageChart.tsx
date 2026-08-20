import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type LanguageDatum = {
	name: string;
	count: number;
	percentage: number;
};

type Props = {
	languages: LanguageDatum[];
};

export default function LanguageChart({ languages }: Props) {
	if (!languages.length) {
		return (
			<div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
				No language data yet. Public repos without a primary language will show up here as you browse.
			</div>
		);
	}

	return (
		<div className="h-80 rounded-3xl border border-white/10 bg-white/5 p-4 md:p-6">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={languages} layout="vertical" margin={{ top: 8, right: 24, left: 24, bottom: 8 }}>
					<CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" horizontal={false} />
					<XAxis type="number" hide />
					<YAxis type="category" dataKey="name" width={110} tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
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
					<Bar dataKey="count" fill="#f59e0b" radius={[0, 10, 10, 0]} barSize={18} />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}