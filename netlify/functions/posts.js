const fs = require('fs');
const path = require('path');

exports.handler = async () => {
  try {
    const postsDir = path.join(process.cwd(), 'posts');
    const files = fs.readdirSync(postsDir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse();

    const posts = files.map(filename => {
      const content = fs.readFileSync(path.join(postsDir, filename), 'utf8');
      return { slug: filename.replace('.md', ''), content };
    });

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
