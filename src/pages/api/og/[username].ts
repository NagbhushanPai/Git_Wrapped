import { createElement } from 'react';
import { ImageResponse } from '@vercel/og';
import { getGitHubProfile } from '../../../lib/github';
import { getPersonaTag } from '../../../lib/persona';

export const prerender = false;
export const runtime = 'edge';

const size = { width: 1200, height: 630 };

export async function GET({ params }: { params: { username?: string } }) {
	const username = params.username ?? '';
	const result = await getGitHubProfile(username);

	if (!result.ok) {
		return new Response(result.message, { status: result.kind === 'not_found' ? 404 : 500 });
	}

	const persona = getPersonaTag(result.profile);
	const topLanguage = result.profile.topLanguage ? `${result.profile.topLanguage.name} · ${result.profile.topLanguage.percentage.toFixed(0)}%` : 'No dominant language yet';

	return new ImageResponse(
		createElement(
			'div',
			{ style: { display: 'flex', width: '100%', height: '100%', background: 'linear-gradient(180deg, #08111f 0%, #04070d 100%)', color: '#f8fafc', fontFamily: 'sans-serif' } },
			createElement('div', { style: { position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(245, 158, 11, 0.20), transparent 30%)' } }),
			createElement(
				'div',
				{ style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', padding: '64px' } },
				createElement(
					'div',
					{ style: { display: 'flex', alignItems: 'center', gap: '28px' } },
					createElement('img', { src: result.profile.avatarUrl, alt: 'avatar', width: 144, height: 144, style: { borderRadius: '36px', border: '4px solid rgba(255,255,255,0.14)' } }),
					createElement(
						'div',
						{ style: { display: 'flex', flexDirection: 'column' } },
						createElement('div', { style: { fontSize: 22, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(253, 224, 71, 0.85)' } }, 'Git Wrapped'),
						createElement('div', { style: { fontSize: 72, fontWeight: 800, lineHeight: 1, marginTop: 10 } }, result.profile.username),
						createElement('div', { style: { fontSize: 34, marginTop: 20, color: '#cbd5e1', maxWidth: 860 } }, result.profile.bio || 'No bio on file, but the public activity still leaves a signature.')
					)
				),

				createElement(
					'div',
					{ style: { display: 'flex', gap: '20px', alignItems: 'stretch' } },
					createElement(
						'div',
						{ style: { display: 'flex', flexDirection: 'column', flex: 1, borderRadius: 32, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', padding: '28px 32px' } },
						createElement('div', { style: { fontSize: 20, color: 'rgba(226,232,240,0.7)' } }, 'Persona'),
						createElement('div', { style: { fontSize: 42, fontWeight: 800, marginTop: 8 } }, `${persona.emoji} ${persona.label}`)
					),
					createElement(
						'div',
						{ style: { display: 'flex', flexDirection: 'column', width: 280, borderRadius: 32, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', padding: '28px 32px' } },
						createElement('div', { style: { fontSize: 20, color: 'rgba(226,232,240,0.7)' } }, 'Stars'),
						createElement('div', { style: { fontSize: 46, fontWeight: 800, marginTop: 8 } }, String(result.profile.stars))
					),
					createElement(
						'div',
						{ style: { display: 'flex', flexDirection: 'column', width: 280, borderRadius: 32, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', padding: '28px 32px' } },
						createElement('div', { style: { fontSize: 20, color: 'rgba(226,232,240,0.7)' } }, 'Top language'),
						createElement('div', { style: { fontSize: 34, fontWeight: 800, marginTop: 8 } }, topLanguage)
					)
				)
			)
		),
		size,
	);
}
