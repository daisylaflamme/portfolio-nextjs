import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BlogBody from "@/components/BlogBody";
import { blogPath, blogPosts, formatPostDate, getPost } from "@/data/blog";
import { BLOG_POST_PRIORITY, PAGES, SITE_NAME, SITE_URL, jsonLdHtml, pageMetadata } from "@/lib/seo";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const base = pageMetadata({
    path: blogPath(post.slug),
    title: post.title,
    description: post.description,
    priority: BLOG_POST_PRIORITY,
  });
  // A post is an article, to match its BlogPosting JSON-LD.
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: post.date,
      authors: [SITE_NAME],
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = `${SITE_URL}${blogPath(post.slug)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    url,
    author: { "@type": "Person", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="mb-6 font-mono text-[13px] text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href={PAGES.blog.path} className="inline-flex min-h-11 items-center underline hover:text-fg">
              Notes
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-fg" aria-current="page">
            {post.kicker}
          </li>
        </ol>
      </nav>
      <header className="mb-8 border-b border-line pb-6">
        <p className="font-mono text-[13px] text-accent">
          {post.kicker} · {formatPostDate(post.date)}
        </p>
        <h1 className="font-display mt-2 text-[clamp(1.75rem,4.5vw,2.5rem)] font-bold tracking-tight text-balance text-fg">
          {post.title}
        </h1>
        <p className="mt-3 text-base leading-7 text-body">{post.description}</p>
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tags">
          {post.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-line px-3 py-1 font-mono text-[12px] text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      </header>
      <article>
        <BlogBody blocks={post.body} />
      </article>
      <p className="mt-12 border-t border-line pt-6">
        <Link
          href={PAGES.blog.path}
          className="inline-flex min-h-11 items-center font-mono text-[15px] text-accent no-underline hover:underline"
        >
          All notes
        </Link>
      </p>
    </main>
  );
}
