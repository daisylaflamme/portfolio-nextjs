"use client";

import Image from "next/image";

/**
 * Renders a single project card (no dialog). Thumbnail 250×150px.
 * Calls onViewDetails(project) when "View Details" is clicked.
 */
export default function ProjectCard({ project, onViewDetails }) {
  return (
    <div className="project-card flex flex-col rounded-xl overflow-hidden">
      <div className="w-full shrink-0 flex justify-center bg-[var(--color-petal-bg)] py-2">
        <Image
          src={project.thumbnail}
          alt={project.imageAlt || project.title}
          width={250}
          height={150}
          className="w-[250px] h-[150px] object-cover object-center shrink-0 rounded-lg border border-[var(--color-petal-border)]"
          sizes="250px"
        />
      </div>
      <div className="flex flex-col flex-1 p-4">
        <h2 className="font-semibold text-[var(--color-font-primary)] text-base mb-2">
          {project.title}
        </h2>
        <p className="project-card__description text-sm flex-1 mb-4 leading-relaxed">
          {project.summary}
        </p>
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm font-medium text-[var(--color-font-primary)] px-3 py-2 rounded-md border border-[var(--color-petal-border)] hover:bg-[var(--color-petal-bg)] transition-colors"
            onClick={() => onViewDetails(project)}
          >
            View Details &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
