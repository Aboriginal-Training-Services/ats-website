// src/pages/BlogPost.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

type Frontmatter = {
  title: string;
  date: string;      // ISO or readable
  cover?: string;    // e.g. "/images/blog/protecting-our-lands/cover.jpg"
  slug?: string;     // optional (we’ll also match by filename)
  summary?: string;
};

type LoadedPost = {
  frontmatter: Required<Pick<Frontmatter, "title" | "date">> &
    Pick<Frontmatter, "cover" | "slug" | "summary">;
  content: string;
  path: string;
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const [post, setPost] = useState<LoadedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Collect all markdown files in src/posts; load raw only when needed
  const postFiles = useMemo(
    () =>
      import.meta.glob("/src/posts/**/*.md", {
        as: "raw",
        eager: false,
      }) as Record<string, () => Promise<string>>,
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!slug) return;
      setLoading(true);
      setNotFound(false);

      let found: LoadedPost | null = null;

      // Try to find a matching file by filename or frontmatter slug
      for (const path in postFiles) {
        const raw = await postFiles[path]();
        const parsed = matter(raw);
        const fm = parsed.data as Frontmatter;

        const filenameMatches = path.endsWith(`/${slug}.md`);
        const fmMatches = fm.slug === slug;

        if (filenameMatches || fmMatches) {
          found = {
            frontmatter: {
              title: fm.title ?? slug,
              date: fm.date ?? "",
              cover: fm.cover,
              slug: fm.slug,
              summary: fm.summary,
            },
            content: parsed.content,
            path,
          };
          break;
        }
      }

      if (cancelled) return;

      if (!found) {
        setNotFound(true);
        setPost(null);
      } else {
        setPost(found);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, postFiles]);

  function formatDate(d: string) {
    if (!d) return "";
    const date = new Date(d);
    if (isNaN(date.getTime())) return d;
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // If a Markdown image is written as "photo.jpg", rewrite to /images/blog/<slug>/photo.jpg
  function resolveImageSrc(src?: string) {
    if (!src) return "";
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
      return src; // absolute/fully-qualified path
    }
    return `/images/blog/${slug}/${src}`;
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <p className="text-sm text-gray-500">Loading post…</p>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <p className="text-lg font-semibold mb-4">Post not found</p>
        <Link to="/blog" className="text-blue-600 hover:underline">
          ← Back to all posts
        </Link>
      </div>
    );
  }

  const { frontmatter, content } = post;

  return (
    <article className="max-w-4xl mx-auto px-4 py-10">
      {/* Back link */}
      <div className="mb-6">
        <Link to="/blog" className="text-blue-600 hover:underline">
          ← Back to all posts
        </Link>
      </div>

      {/* Cover */}
{frontmatter.cover && (
  <div className="w-full aspect-video mb-6">
    <img
      src={frontmatter.cover}
      alt={frontmatter.title}
      loading="eager"
      className="w-full h-full object-cover rounded-xl"
    />
  </div>
)}

      {/* Title + meta */}
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {frontmatter.title}
        </h1>
        {frontmatter.date && (
          <p className="mt-2 text-sm text-gray-500">{formatDate(frontmatter.date)}</p>
        )}
      </header>

      {/* Content */}
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
components={{
  img: ({ node, ...props }) => (
    <figure className="my-8">
      <div className="w-full aspect-video">
        <img
          {...props}
          src={resolveImageSrc(props.src)}
          alt={props.alt ?? ""}
          loading="lazy"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      {props.title ? (
        <figcaption className="mt-2 text-center text-sm text-gray-500 italic">
          {props.title}
        </figcaption>
      ) : null}
    </figure>
  ),
  a: ({ node, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer" />
  ),
  h2: ({ node, ...props }) => <h2 {...props} className="scroll-mt-24" />,
  h3: ({ node, ...props }) => <h3 {...props} className="scroll-mt-24" />,
}}

        >
          {content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
