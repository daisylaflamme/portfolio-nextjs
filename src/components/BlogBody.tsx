import Link from "next/link";
import { headingIds } from "@/data/blog";
import type { BlogBlock } from "@/data/types";

export default function BlogBody({ blocks }: { blocks: readonly BlogBlock[] }) {
  const ids = headingIds(blocks);
  return (
    <div className="flex flex-col gap-5 text-[17px] leading-7 text-body">
      {blocks.map((block, index) => {
        if (block.type === "p") {
          return (
            <p key={index}>
              {block.text}
              {block.link ? (
                <>
                  {" "}
                  <Link href={block.link.href} className="text-accent underline underline-offset-4 hover:text-fg">
                    {block.link.label}
                  </Link>
                </>
              ) : null}
            </p>
          );
        }
        if (block.type === "h2") {
          return (
            <h2
              id={ids.get(index)}
              key={index}
              className="font-display mt-4 text-xl font-semibold text-fg sm:text-2xl scroll-mt-24"
            >
              {block.text}
            </h2>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={index} className="flex list-disc flex-col gap-2 pl-5">
              {block.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          );
        }
        // A scrollable <pre> must be focusable; role="region" lets it carry the caption as its name.
        const captionId = `code-${index}`;
        return (
          <figure key={index} className="my-1 max-w-full min-w-0">
            <figcaption id={captionId} className="mb-2 font-mono text-[13px] text-accent">
              {block.caption}
            </figcaption>
            <pre
              tabIndex={0}
              role="region"
              aria-labelledby={captionId}
              className="max-w-full min-w-0 overflow-x-auto rounded-xl border border-line bg-surface p-4 text-[13px] leading-5 text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <code>{block.code}</code>
            </pre>
          </figure>
        );
      })}
    </div>
  );
}
