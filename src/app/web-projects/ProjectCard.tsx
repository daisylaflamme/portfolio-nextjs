"use client";

import Image from "next/image";
import type { Project } from "@/data/types";
import { projectImages, topicLabels } from "@/lib/projectDisplay";

// The 250px files in /thumbnails look soft when stretched across a card, so cards use
// the first full-size screenshot and fall back to the thumbnail only when there is none.
const cardImage = (project: Project): string => projectImages(project)[0] || project.thumbnail;

interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project) => void;
  /** The large first card: wider layout and the page's LCP image (priority). */
  featured?: boolean;
}

/**
 * Case-study card. The "View details" button opens the project dialog;
 * its accessible name includes the project title.
 */
export default function ProjectCard({ project, onOpen, featured = false }: ProjectCardProps) {
  const topics = topicLabels(project).join(" · ");
  const src = cardImage(project);

  if (featured) {
    return (
      <article className="overflow-hidden rounded-3xl border border-line bg-surface md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="relative aspect-[16/10] bg-img md:aspect-auto md:min-h-80">
          <Image
            src={src}
            alt={project.imageAlt || ""}
            fill
            priority
            sizes="(min-width: 1152px) 600px, (min-width: 768px) 52vw, calc(100vw - 2rem)"
            className="object-cover object-top"
          />
        </div>
        <div className="flex flex-col gap-4 p-6 sm:p-8">
          <p className="font-mono text-[13px] text-accent">{"// featured"}</p>
          <h3 className="font-display text-[clamp(1.6rem,3.5vw,2.1rem)] font-semibold leading-tight text-fg">
            {project.title}
          </h3>
          <p className="text-base leading-relaxed text-body sm:text-[17px]">{project.summary}</p>
          {topics ? <p className="font-mono text-[13px] text-muted">{topics}</p> : null}
          <button
            type="button"
            onClick={() => onOpen(project)}
            className="mt-1 inline-flex min-h-12 items-center self-start rounded-lg bg-accent px-6 font-mono text-[15px] font-medium text-on-accent transition-opacity hover:opacity-90"
          >
            read case study<span className="sr-only">: {project.title}</span>
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="relative aspect-[16/10] bg-img">
        <Image
          src={src}
          alt={project.imageAlt || ""}
          fill
          sizes="(min-width: 1152px) 360px, (min-width: 1024px) 31vw, (min-width: 640px) 48vw, calc(100vw - 2rem)"
          className="object-cover object-top"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5 sm:p-6">
        {topics ? <p className="font-mono text-xs text-accent">{topics}</p> : null}
        <h3 className="font-display text-xl font-semibold leading-snug text-fg">{project.title}</h3>
        <p className="flex-1 text-[15px] leading-relaxed text-muted">{project.summary}</p>
        <button
          type="button"
          onClick={() => onOpen(project)}
          className="mt-1 inline-flex min-h-11 items-center self-start font-semibold text-fg underline-offset-4 hover:text-accent hover:underline"
        >
          View details<span className="sr-only">: {project.title}</span> <span aria-hidden="true">&nbsp;→</span>
        </button>
      </div>
    </article>
  );
}

/** Compact row for "Earlier work". */
export function ProjectRow({ project, onOpen }: Omit<ProjectCardProps, "featured">) {
  return (
    <li className="border-t border-line first:border-t-0">
      <button
        type="button"
        onClick={() => onOpen(project)}
        className="group flex w-full items-center gap-4 py-4 text-left"
      >
        <span className="relative hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-img sm:block">
          <Image src={project.thumbnail} alt="" fill sizes="96px" className="object-cover" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="font-semibold text-fg group-hover:text-accent">{project.title}</span>
          <span className="line-clamp-2 text-sm leading-relaxed text-muted">{project.summary}</span>
        </span>
        <span aria-hidden="true" className="text-muted group-hover:text-accent">→</span>
      </button>
    </li>
  );
}
