# Git Wrapped

Live GitHub profile pages with a deterministic persona tag, language breakdown chart, and shareable OG image.

## Setup

1. Install dependencies:

	```sh
	npm install
	```

2. Create a `.env` file from `.env.example` and set `GITHUB_TOKEN` if you want the higher GitHub rate limit.

## GitHub Token

Create a personal access token in GitHub at Settings → Developer settings → Personal access tokens. No scopes are needed for public profile data. The app works without a token, but live requests are limited to 60 per hour instead of 5000.

## Run Locally

```sh
npm run dev
```

## Build

```sh
npm run build
```

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import it into Vercel.
3. Add `GITHUB_TOKEN` in the Vercel project environment variables.
4. Deploy. The Astro Vercel adapter handles the SSR page and the OG image route.
