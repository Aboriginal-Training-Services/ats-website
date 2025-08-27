import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import matter from "gray-matter";

type Frontmatter = {
  title: string;
  summary: string;
  slug: string;
  date: string;
  cover?: string;
};

type Post = {
  frontmatter: Frontmatter;
  path: string;
};

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  // Collect all markdown files in src/posts
  const files = useMemo(
    () =>
      import.meta.glob("/src/posts/**/*.md", {
        as: "raw",
        eager: true,
      }) as Record<string, string>,
    []
  );

  useEffect(() => {
    const loaded: Post[] = [];

    for (const path in files) {
      const raw = files[path];
      const parsed = matter(raw);
      const fm = parsed.data as Frontmatter;

      loaded.push({
        frontmatter: fm,
        path,
      });
    }

    // sort newest → oldest
    loaded.sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    );

    setPosts(loaded);
  }, [files]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900">Blog</h1>
          <p className="text-lg text-gray-600 mt-2">
            Insights, updates, and stories from Aboriginal Training Services.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {posts.length === 0 ? (
          <div className="text-gray-600">No posts yet — check back soon.</div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(({ frontmatter }) => (
              <Link
                key={frontmatter.slug}
                to={`/blog/${frontmatter.slug}`}
                className="block bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
              >
                {frontmatter.cover && (
                  <img
                    src={frontmatter.cover}
                    alt={frontmatter.title}
                    className="h-48 w-full object-cover"
                  />
                )}
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {frontmatter.title}
                  </h2>
                  <p className="mt-2 text-gray-600">{frontmatter.summary}</p>
                  <p className="mt-3 text-sm text-gray-500">
                    {new Date(frontmatter.date).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12">
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Blog;
