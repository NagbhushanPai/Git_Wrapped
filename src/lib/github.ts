export type GitHubProfile = {
	username: string;
	avatarUrl: string;
	bio: string | null;
	publicRepos: number;
	followers: number;
	following: number;
	accountAgeYears: number;
	githubSince: string;
	stars: number;
	contributionScore: number;
	topRepositories: Array<{ name: string; stars: number; url: string }>;
	languages: Array<{ name: string; count: number; percentage: number }>;
	activityHeatmap: Array<{ date: string; count: number }>;
	collaborationStyle: string;
	mostProductiveWeekday: string | null;
	topLanguage: { name: string; percentage: number } | null;
	longestStreak: number;
	mostActiveHour: number | null;
	weekendPushRatio: number;
	responseWindowDays: number;
};

export type GitHubErrorKind = 'not_found' | 'rate_limited' | 'fetch_error';

export type GitHubResult =
	| { ok: true; profile: GitHubProfile }
	| { ok: false; kind: GitHubErrorKind; message: string };

type GitHubUser = {
	avatar_url: string;
	bio: string | null;
	public_repos: number;
	followers: number;
	following: number;
	created_at: string;
};

type GitHubRepo = {
	name: string;
	html_url: string;
	stargazers_count: number;
	language: string | null;
};

type GitHubEvent = {
	type: string;
	created_at: string;
};

const GITHUB_API = 'https://api.github.com';

function authHeaders() {
	return {
		Accept: 'application/vnd.github+json',
		'X-GitHub-Api-Version': '2022-11-28',
		'User-Agent': 'Git-Wrapped-MVP',
		...(import.meta.env.GITHUB_TOKEN
			? { Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}` }
			: {}),
	};
}

async function fetchJson<T>(url: string): Promise<{ ok: true; data: T } | { ok: false; status: number }> {
	const response = await fetch(url, {
		headers: authHeaders(),
		cache: 'no-store',
	});

	if (!response.ok) {
		return { ok: false, status: response.status };
	}

	return { ok: true, data: (await response.json()) as T };
}

function countLanguagePercentages(repos: GitHubRepo[]) {
	const counts = new Map<string, number>();
	let countedRepos = 0;

	for (const repo of repos) {
		if (!repo.language) continue;
		countedRepos += 1;
		counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
	}

	const languages = [...counts.entries()]
		.sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
		.map(([name, count]) => ({
			name,
			count,
			percentage: countedRepos ? (count / countedRepos) * 100 : 0,
		}));

	return { languages };
}

function getLongestStreak(pushDates: string[]) {
	const sortedDates = [...new Set(pushDates)].sort();
	let longest = 0;
	let current = 0;
	let previousDate: Date | null = null;

	for (const dateValue of sortedDates) {
		const currentDate = new Date(`${dateValue}T00:00:00Z`);
		if (!previousDate) {
			current = 1;
			longest = 1;
			previousDate = currentDate;
			continue;
		}

		const deltaDays = (currentDate.getTime() - previousDate.getTime()) / 86_400_000;
		if (deltaDays === 1) {
			current += 1;
		} else {
			current = 1;
		}

		longest = Math.max(longest, current);
		previousDate = currentDate;
	}

	return longest;
}

function getMostActiveHour(hours: number[]) {
	if (hours.length === 0) return null;
	const buckets = new Map<number, number>();
	for (const hour of hours) buckets.set(hour, (buckets.get(hour) ?? 0) + 1);

	let winner: number | null = null;
	let winnerCount = -1;
	for (const [hour, count] of buckets.entries()) {
		if (count > winnerCount || (count === winnerCount && (winner === null || hour < winner))) {
			winner = hour;
			winnerCount = count;
		}
	}

	return winner;
}

export async function getGitHubProfile(username: string): Promise<GitHubResult> {
	const normalized = username.trim();
	if (!normalized) {
		return { ok: false, kind: 'fetch_error', message: 'Missing username.' };
	}

	try {
		const [userResult, reposResult, eventsResult] = await Promise.all([
			fetchJson<GitHubUser>(`${GITHUB_API}/users/${encodeURIComponent(normalized)}`),
			fetchJson<GitHubRepo[]>(`${GITHUB_API}/users/${encodeURIComponent(normalized)}/repos?per_page=100&sort=updated`),
			fetchJson<GitHubEvent[]>(`${GITHUB_API}/users/${encodeURIComponent(normalized)}/events/public?per_page=100`),
		]);

		if (!userResult.ok) {
			if (userResult.status === 404) {
				return { ok: false, kind: 'not_found', message: 'We could not find that GitHub user.' };
			}

			if (userResult.status === 403) {
				return { ok: false, kind: 'rate_limited', message: 'GitHub rate limit hit. Try again in a bit.' };
			}

			return { ok: false, kind: 'fetch_error', message: 'Unable to load that profile right now.' };
		}

		if (!reposResult.ok) {
			if (reposResult.status === 403) {
				return { ok: false, kind: 'rate_limited', message: 'GitHub rate limit hit. Try again in a bit.' };
			}

			return { ok: false, kind: 'fetch_error', message: 'Unable to load repositories.' };
		}

		if (!eventsResult.ok) {
			if (eventsResult.status === 403) {
				return { ok: false, kind: 'rate_limited', message: 'GitHub rate limit hit. Try again in a bit.' };
			}

			return { ok: false, kind: 'fetch_error', message: 'Unable to load recent activity.' };
		}

		const { languages } = countLanguagePercentages(reposResult.data);
		const totalStars = reposResult.data.reduce((sum, repo) => sum + repo.stargazers_count, 0);
		const topRepositories = [...reposResult.data].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 3).map((repo) => ({ name: repo.name, stars: repo.stargazers_count, url: repo.html_url }));
		const topLanguage = languages[0] ?? null;

		// Approximate: the public events API only exposes a recent slice of activity, not a full commit history.
		const pushEvents = eventsResult.data.filter((event) => event.type === 'PushEvent');
		const pushDates = pushEvents.map((event) => event.created_at.slice(0, 10));
		const pushHours = pushEvents.map((event) => new Date(event.created_at).getUTCHours());
		const weekendPushes = pushEvents.filter((event) => {
			const day = new Date(event.created_at).getUTCDay();
			return day === 0 || day === 6;
		}).length;
		const weekdayCounts = new Map<string, number>();
		const heatmapCounts = new Map<string, number>();
		for (const event of pushEvents) {
			const date = event.created_at.slice(0, 10);
			heatmapCounts.set(date, (heatmapCounts.get(date) ?? 0) + 1);
			const weekday = new Date(event.created_at).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
			weekdayCounts.set(weekday, (weekdayCounts.get(weekday) ?? 0) + 1);
		}
		const mostProductiveWeekday = [...weekdayCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
		const accountAgeYears = Math.max(0, Math.floor((Date.now() - Date.parse(userResult.data.created_at)) / (365.25 * 86_400_000)));
		const contributionScore = Math.min(100, Math.round(pushEvents.length * 0.7 + Math.min(totalStars, 500) * 0.04 + Math.min(userResult.data.followers, 1000) * 0.01));
		const collaborationStyle = eventsResult.data.some((event) => ['PullRequestEvent', 'PullRequestReviewEvent', 'IssuesEvent'].includes(event.type)) ? 'Community collaborator' : pushEvents.length > 20 ? 'Focused shipper' : 'Independent builder';

		return {
			ok: true,
			profile: {
				username: normalized,
				avatarUrl: userResult.data.avatar_url,
				bio: userResult.data.bio,
				publicRepos: userResult.data.public_repos,
				followers: userResult.data.followers,
				following: userResult.data.following,
				accountAgeYears,
				githubSince: new Date(userResult.data.created_at).getUTCFullYear().toString(),
				stars: totalStars,
				contributionScore,
				topRepositories,
				languages,
				activityHeatmap: [...heatmapCounts.entries()].map(([date, count]) => ({ date, count })),
				collaborationStyle,
				mostProductiveWeekday,
				topLanguage: topLanguage ? { name: topLanguage.name, percentage: topLanguage.percentage } : null,
				longestStreak: getLongestStreak(pushDates),
				mostActiveHour: getMostActiveHour(pushHours),
				weekendPushRatio: pushEvents.length ? weekendPushes / pushEvents.length : 0,
				responseWindowDays: 90,
			},
		};
	} catch {
		return { ok: false, kind: 'fetch_error', message: 'Something went wrong while reaching GitHub.' };
	}
}
