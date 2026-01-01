import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = 3000;
const GITHUB_API = 'https://api.github.com/graphql';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Enable CORS for Frontend
app.use(cors({
  origin:'*',
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization','X-Requested-With']
}));

app.get('/api/contributions', async (req, res) => {
  const { login, from, to } = req.query;
  if (!login || !from || !to) {
    return res.status(400).json({ error: 'Missing login, from, or to parameter.' });
  }

  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks { contributionDays { date contributionCount contributionLevel } }
          }
        }
      }
    }
  `;

  const variables = { login, from, to };

  // Log the GraphQL query and variables
  console.log('GitHub GraphQL Query:', query);
  console.log('Variables:', variables);

  try {
    const ghRes = await fetch(GITHUB_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'contributions-app'
      },
      body: JSON.stringify({ query, variables })
    });
    const data = await ghRes.json();
    if (!ghRes.ok || data.errors) {
      console.log('GitHub API returned error:', data.errors);
      return res.status(502).json({ error: 'GitHub API error', details: data.errors });
    }
    const calendar = data.data.user.contributionsCollection.contributionCalendar;
    const totalContributions = calendar.totalContributions;
    const contributions = calendar.weeks.flatMap(week =>
      week.contributionDays.map(day => ({
        date: day.date,
        value: day.contributionCount,
        level: day.contributionLevel
      }))
    );
    console.log('Result populated:', contributions.length > 0);
    res.set('Cache-Control', 'public, max-age=21600');
    res.json({ totalContributions, contributions });
  } catch (err) {
    console.log('Internal server error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Activity Mix - Contribution breakdown by category
app.get('/api/activity-mix', async (req, res) => {
  const { login, from, to } = req.query;
  if (!login || !from || !to) {
    return res.status(400).json({ error: 'Missing login, from, or to parameter.' });
  }

  const query = `
    query ActivityMix($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
        }
      }
    }
  `;

  const variables = { login, from, to };

  // Log the GraphQL query and variables
  console.log('GitHub GraphQL Query (activity-mix):', query);
  console.log('Variables:', variables);

  try {
    const ghRes = await fetch(GITHUB_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'contributions-app'
      },
      body: JSON.stringify({ query, variables })
    });
    const data = await ghRes.json();
    if (!ghRes.ok || data.errors) {
      console.log('GitHub API returned error (activity-mix):', data.errors);
      return res.status(502).json({ error: 'GitHub API error', details: data.errors });
    }

    const collection = data.data.user.contributionsCollection;
    const commits = collection.totalCommitContributions || 0;
    const issues = collection.totalIssueContributions || 0;
    const prs = collection.totalPullRequestContributions || 0;
    const reviews = collection.totalPullRequestReviewContributions || 0;

    const total = commits + issues + prs + reviews;

    // Calculate percentages (handle zero case)
    let percentages;
    if (total === 0) {
      percentages = { commits: 0, issues: 0, prs: 0, reviews: 0 };
    } else {
      percentages = {
        commits: Math.round((commits / total) * 100),
        issues: Math.round((issues / total) * 100),
        prs: Math.round((prs / total) * 100),
        reviews: Math.round((reviews / total) * 100)
      };
    }

    const result = {
      totals: { commits, issues, prs, reviews },
      percentages
    };

    console.log('Activity mix result:', result);
    res.set('Cache-Control', 'public, max-age=21600');
    res.json(result);
  } catch (err) {
    console.log('Internal server error (activity-mix):', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Activity Contribs - List of repositories contributed to
app.get('/api/activity-contribs', async (req, res) => {
  const { login, from, to } = req.query;
  if (!login || !from || !to) {
    return res.status(400).json({ error: 'Missing login, from, or to parameter.' });
  }

  const query = `
    query ActivityRepos($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          commitContributionsByRepository(maxRepositories: 50) {
            repository {
              nameWithOwner
              url
            }
            contributions(first: 1) {
              nodes {
                occurredAt
              }
            }
          }
          pullRequestContributionsByRepository(maxRepositories: 50) {
            repository {
              nameWithOwner
              url
            }
            contributions(first: 1) {
              nodes {
                occurredAt
              }
            }
          }
          issueContributionsByRepository(maxRepositories: 50) {
            repository {
              nameWithOwner
              url
            }
            contributions(first: 1) {
              nodes {
                occurredAt
              }
            }
          }
          pullRequestReviewContributionsByRepository(maxRepositories: 50) {
            repository {
              nameWithOwner
              url
            }
            contributions(first: 1) {
              nodes {
                occurredAt
              }
            }
          }
          repositoryContributions(first: 50) {
            nodes {
              repository {
                nameWithOwner
                url
              }
              occurredAt
            }
          }
        }
      }
    }
  `;

  const variables = { login, from, to };

  console.log('GitHub GraphQL Query (activity-contribs):', query);
  console.log('Variables:', variables);

  try {
    const ghRes = await fetch(GITHUB_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'contributions-app'
      },
      body: JSON.stringify({ query, variables })
    });
    const data = await ghRes.json();
    if (!ghRes.ok || data.errors) {
      console.log('GitHub API returned error (activity-contribs):', data.errors);
      return res.status(502).json({ error: 'GitHub API error', details: data.errors });
    }

    const collection = data.data.user.contributionsCollection;

    // Merge all repository contributions into a single map
    const repoMap = new Map();

    // Helper to process repository contributions
    const processRepos = (contribs) => {
      if (!contribs) return;
      contribs.forEach(contrib => {
        const repo = contrib.repository;
        const occurredAt = contrib.contributions?.nodes?.[0]?.occurredAt;
        if (!repo || !occurredAt) return;

        const key = repo.nameWithOwner;
        if (!repoMap.has(key) || new Date(occurredAt) > new Date(repoMap.get(key).occurredAt)) {
          repoMap.set(key, {
            nameWithOwner: repo.nameWithOwner,
            url: repo.url,
            occurredAt
          });
        }
      });
    };

    // Process all contribution types
    processRepos(collection.commitContributionsByRepository);
    processRepos(collection.pullRequestContributionsByRepository);
    processRepos(collection.issueContributionsByRepository);
    processRepos(collection.pullRequestReviewContributionsByRepository);
    
    // Process repository creations
    if (collection.repositoryContributions?.nodes) {
      collection.repositoryContributions.nodes.forEach(contrib => {
        const repo = contrib.repository;
        const occurredAt = contrib.occurredAt;
        if (!repo || !occurredAt) return;

        const key = repo.nameWithOwner;
        if (!repoMap.has(key) || new Date(occurredAt) > new Date(repoMap.get(key).occurredAt)) {
          repoMap.set(key, {
            nameWithOwner: repo.nameWithOwner,
            url: repo.url,
            occurredAt
          });
        }
      });
    }

    // Convert to array and sort by latest occurredAt
    const allRepos = Array.from(repoMap.values())
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

    // Get top 3 and count extras
    const top = allRepos.slice(0, 3).map(r => ({
      nameWithOwner: r.nameWithOwner,
      url: r.url
    }));
    const extraCount = Math.max(allRepos.length - 3, 0);
    const total = allRepos.length;

    const result = { top, extraCount, total };

    console.log('Activity contribs result:', result);
    res.set('Cache-Control', 'public, max-age=21600');
    res.json(result);
  } catch (err) {
    console.log('Internal server error (activity-contribs):', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Popular repositories for a user (most starred public repos)
app.get('/api/pinned', async (req, res) => {
  const { login, first = '6' } = req.query;
  if (!login) {
    return res.status(400).json({ error: 'Missing login parameter.' });
  }

  const query = `
    query UserTopPublicRepos($login: String!, $first: Int!) {
      user(login: $login) {
        repositories(first: $first, privacy: PUBLIC, orderBy: {field: UPDATED_AT, direction: DESC}) {
          nodes {
            name
            description
            stargazerCount
            updatedAt
            url
            isPrivate
            primaryLanguage { name color }
            isFork
            parent {
              nameWithOwner
            }
          }
        }
      }
    }
  `;

  const variables = { login, first: Number(first) };

  console.log('Variables:', variables);

  try {
    const ghRes = await fetch(GITHUB_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'contributions-app'
      },
      body: JSON.stringify({ query, variables })
    });
    // Log raw response text before parsing
    const rawText = await ghRes.text();
    console.log('Raw GitHub API response text for', login, ':', rawText);
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (jsonErr) {
      console.error('Error parsing GitHub response as JSON:', jsonErr);
      return res.status(500).json({ error: 'Failed to parse GitHub response' });
    }
    // Log parsed response for debugging
    console.log('Parsed GitHub API response for', login, ':', JSON.stringify(data, null, 2));
    if (!ghRes.ok || data.errors) {
      console.log('GitHub API returned error (popular):', data.errors);
      return res.status(502).json({ error: 'GitHub API error', details: data.errors });
    }

    const nodes = data?.data?.user?.repositories?.nodes ?? [];
    const repos = nodes.map(n => ({
      name: n.name,
      description: n.description,
      stargazerCount: n.stargazerCount,
      updatedAt: n.updatedAt,
      url: n.url,
      language: n.primaryLanguage?.name ?? null,
      languageColor: n.primaryLanguage?.color ?? null,
      isFork: n.isFork,
      parentNameWithOwner: n.parent?.nameWithOwner ?? null
    }));

    // Cache for 1 hour (tune as needed)
    res.set('Cache-Control', 'public, max-age=3600');
    res.json({ repos });
  } catch (err) {
    console.log('Internal server error (popular):', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Profile details for a user
app.get('/api/profile', async (req, res) => {
  const { login } = req.query;
  if (!login) return res.status(400).json({ error: 'Missing login parameter.' });

  const query = `
    query UserProfile($login: String!) {
      user(login: $login) {
        avatarUrl(size: 460)
        name
        login
        bio
        company
        location
        email
        websiteUrl
        twitterUsername
        followers { totalCount }
        following { totalCount }
        organizations(first: 12) {
          nodes {
            login
            url
            avatarUrl(size: 80)
          }
        }
      }
    }
  `;

  const variables = { login };

  console.log('GitHub GraphQL Query (/api/profile):', query);
  console.log('Variables:', variables);

  try {
    const ghRes = await fetch(GITHUB_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'contributions-app'
      },
      body: JSON.stringify({ query, variables })
    });

    const data = await ghRes.json();
    if (!ghRes.ok || data.errors) {
      console.log('GitHub API returned error (profile):', data.errors);
      return res.status(502).json({ error: 'GitHub API error', details: data.errors });
    }

    const u = data?.data?.user;
    if (!u) return res.status(404).json({ error: 'User not found' });

    // Map to exactly what your UI needs
    const profile = {
      avatarUrl: u.avatarUrl,
      name: u.name,
      login: u.login,
      bio: u.bio,
      company: u.company,
      location: u.location,
      email: u.email,               // only if user made it public
      websiteUrl: u.websiteUrl,
      twitterUsername: u.twitterUsername,
      followers: u.followers?.totalCount ?? 0,
      following: u.following?.totalCount ?? 0,
      organizations: (u.organizations?.nodes ?? []).map(o => ({
        login: o.login,
        url: o.url,
        avatarUrl: o.avatarUrl
      }))
    };

    res.set('Cache-Control', 'public, max-age=1800'); // 30 min
    res.json({ profile });
  } catch (err) {
    console.log('Internal server error (profile):', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Profile counts for tabs (repos, projects, packages, stars)
app.get('/api/profile-counts', async (req, res) => {
  const { login } = req.query;
  if (!login) return res.status(400).json({ error: 'Missing login parameter.' });

  const query = `
    query ProfileCounts($login: String!) {
      user(login: $login) {
        repositories {
          totalCount
        }
        projectsV2(first: 0) {
          totalCount
        }
        packages {
          totalCount
        }
        starredRepositories {
          totalCount
        }
      }
    }
  `;

  const variables = { login };

  console.log('GitHub GraphQL Query (/api/profile-counts):', query);
  console.log('Variables:', variables);

  try {
    const ghRes = await fetch(GITHUB_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'contributions-app'
      },
      body: JSON.stringify({ query, variables })
    });

    const data = await ghRes.json();
    if (!ghRes.ok || data.errors) {
      console.log('GitHub API returned error (profile-counts):', data.errors);
      return res.status(502).json({ error: 'GitHub API error', details: data.errors });
    }

    const u = data?.data?.user;
    if (!u) return res.status(404).json({ error: 'User not found' });

    const counts = {
      repoCount: u.repositories?.totalCount ?? 0,
      projectCount: u.projectsV2?.totalCount ?? 0,
      packageCount: u.packages?.totalCount ?? 0,
      starCount: u.starredRepositories?.totalCount ?? 0
    };

    console.log('Profile counts result:', counts);
    res.set('Cache-Control', 'public, max-age=1800'); // 30 min
    res.json(counts);
  } catch (err) {
    console.log('Internal server error (profile-counts):', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Global error logging
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
  process.exit(1);

});

