import type { GitHubProfile } from './github';

export type PersonaTag = {
	label: string;
	emoji: string;
	color: string;
};

export function getPersonaTag(stats: Pick<GitHubProfile, 'mostActiveHour' | 'weekendPushRatio' | 'topLanguage' | 'longestStreak' | 'stars' | 'publicRepos'>): PersonaTag {
	if (stats.mostActiveHour !== null && stats.mostActiveHour >= 0 && stats.mostActiveHour <= 4) {
		return { label: 'Night Owl Committer', emoji: '🦉', color: 'from-amber-400/30 to-orange-500/20 border-amber-300/30 text-amber-100' };
	}

	if (stats.weekendPushRatio > 0.4) {
		return { label: 'Weekend Warrior', emoji: '⚔️', color: 'from-rose-400/30 to-orange-500/20 border-rose-300/30 text-rose-100' };
	}

	if (stats.topLanguage?.name === 'TypeScript' && stats.topLanguage.percentage > 60) {
		return { label: 'TypeScript Zealot', emoji: '🔷', color: 'from-cyan-400/30 to-sky-500/20 border-cyan-300/30 text-cyan-100' };
	}

	if (stats.topLanguage?.name === 'Python' && stats.topLanguage.percentage > 60) {
		return { label: 'Python Purist', emoji: '🐍', color: 'from-emerald-400/30 to-green-500/20 border-emerald-300/30 text-emerald-100' };
	}

	if (stats.longestStreak > 20) {
		return { label: 'Consistency Machine', emoji: '🔁', color: 'from-lime-400/30 to-emerald-500/20 border-lime-300/30 text-lime-100' };
	}

	if (stats.stars > 500) {
		return { label: 'Star Collector', emoji: '⭐', color: 'from-yellow-400/30 to-amber-500/20 border-yellow-300/30 text-yellow-100' };
	}

	if (stats.publicRepos > 50) {
		return { label: 'Serial Repo Creator', emoji: '📦', color: 'from-slate-300/20 to-slate-500/10 border-slate-200/20 text-slate-100' };
	}

	return { label: 'Balanced Builder', emoji: '🛠️', color: 'from-amber-400/25 to-slate-500/10 border-amber-300/20 text-amber-50' };
}