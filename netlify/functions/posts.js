exports.handler = async () => {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo  = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  const postsPath = 'posts';

  try {
    // Get list of files
    const listRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${postsPath}?ref=${branch}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );

    if (!listRes.ok) throw new Error('Could not list posts');
    const files = await listRes.json();
    const mdFiles = files.filter(f => f.name.endsWith('.md'));

    // Fetch each post
    const posts = await Promise.all(mdFiles.map(async file => {
      const raw = await fetch(file.download_url);
      const text = await raw.text();
      return { slug: file.name.replace('.md', ''), content: text };
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      },
      body: JSON.stringify(posts)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
