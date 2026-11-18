import Link from "next/link";
import type { Metadata } from "next";
import { blogPath, blogPosts, formatPostDate } from "@/data/blog";
import { PAGES, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGES.blog);

export default function BlogIndexPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10">
        <p className="font-mono text-[13px] text-accent">{"// notes"}</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight text-fg">
          {PAGES.blog.title}
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-body">{PAGES.blog.description}</p>
      </header>
      <ul className="flex flex-col gap-4">
        {blogPosts.map((post) => (
          <li key={post.slug}>
            <article className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <p className="font-mono text-[13px] text-accent">
                {post.kicker} · {formatPostDate(post.date)}
              </p>
              <h2 className="font-display mt-2 text-xl font-semibold text-fg sm:text-2xl">
                <Link
                  href={blogPath(post.slug)}
                  className="underline decoration-transparent underline-offset-4 hover:decoration-accent"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-[15px] leading-6 text-body">{post.description}</p>
              <p className="mt-4">
                <Link
                  href={blogPath(post.slug)}
                  className="inline-flex min-h-11 items-center font-mono text-[15px] text-accent no-underline hover:underline"
                >
                  Read post
                </Link>
              </p>
            </article>
          </li>
        ))}
      </ul>
    </main>
  );
}
