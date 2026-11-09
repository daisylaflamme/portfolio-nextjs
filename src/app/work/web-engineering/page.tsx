"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { projects, featuredProjectIds } from "@/data/projects";
import type { Project } from "@/data/types";
import { groupProjects } from "@/lib/projectSections";
import ProjectCard, { ProjectRow } from "./ProjectCard";
import ProjectModal from "./ProjectModal";
import FilterChips from "./FilterChips";
import { PROJECT_FILTERS } from "./projectFilters";
import WorkHeader from "../WorkHeader";

const PROJECT_PARAM = "project";

// The open case study lives in the URL (?project=<id>), so deep links and reloads work.
// Next.js syncs useSearchParams with history.replaceState; pass null (not the current
// history.state, which Next marks as its own) so the update isn't skipped.
function setProjectParam(id: string | null) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set(PROJECT_PARAM, id);
  else url.searchParams.delete(PROJECT_PARAM);
  window.history.replaceState(null, "", url);
}

// Reads ?project= — kept in its own Suspense boundary so the rest of the page still prerenders.
interface CaseStudyFromUrlProps {
  /** Projects on screen, in order, for prev/next. */
  visible: Project[];
  onOpen: (project: Project) => void;
  onClose: () => void;
}

function CaseStudyFromUrl({ visible, onOpen, onClose }: CaseStudyFromUrlProps) {
  const id = useSearchParams().get(PROJECT_PARAM);
  const selectedProject = (id && projects.find((p) => p.id === id)) || null;

  // Prev/next follow the order currently on screen (or the full list for deep links).
  const sequence = selectedProject && visible.some((p) => p.id === selectedProject.id) ? visible : projects;
  const position = selectedProject ? sequence.findIndex((p) => p.id === selectedProject.id) : -1;
  const prevProject = position > 0 ? sequence[position - 1] : null;
  const nextProject = position >= 0 && position < sequence.length - 1 ? sequence[position + 1] : null;

  return (
    <ProjectModal
      project={selectedProject}
      onClose={onClose}
      prevProject={prevProject}
      nextProject={nextProject}
      onNavigate={onOpen}
    />
  );
}

export default function WorkPage() {
  const [selectedFilters, setSelectedFilters] = useState<ReadonlySet<string>>(() => new Set());

  const { featured, earlier } = useMemo(() => {
    const active = PROJECT_FILTERS.filter((f) => selectedFilters.has(f.id));
    return groupProjects(projects, featuredProjectIds, active);
  }, [selectedFilters]);

  const [hero, ...grid] = featured;
  const visible = useMemo(() => [...featured, ...earlier], [featured, earlier]);
  const resultCount = visible.length;

  const openProject = useCallback((project: Project) => setProjectParam(project.id), []);
  const closeProject = useCallback(() => setProjectParam(null), []);

  const toggleFilter = (id: string) => {
    setSelectedFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const clearFilters = () => setSelectedFilters(new Set());

  return (
    <main className="flex-1">
      <WorkHeader
        current="web-engineering"
        intro="Case studies from multi-brand e-commerce, marketing and product teams — the problem, what I built, and what changed."
      />

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <FilterChips selected={selectedFilters} onToggle={toggleFilter} onClear={clearFilters} />
        <p className="mt-3 text-sm text-muted" role="status" aria-live="polite">
          {selectedFilters.size === 0
            ? `${resultCount} projects`
            : `${resultCount} matching ${resultCount === 1 ? "project" : "projects"}`}
        </p>
      </div>

      {resultCount === 0 ? (
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="rounded-2xl border border-line bg-surface p-8 text-center">
            <p className="text-lg font-semibold text-fg">No projects match these filters.</p>
            <p className="mx-auto mt-2 max-w-md text-muted">Try removing a filter, or show every project again.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex min-h-11 items-center rounded-lg border border-field px-5 font-semibold text-fg hover:border-fg"
            >
              Clear all filters
            </button>
          </div>
        </div>
      ) : null}

      {hero ? (
        <section aria-labelledby="featured-heading" className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
          <h2 id="featured-heading" className="sr-only">
            Featured case studies
          </h2>
          <ProjectCard project={hero} onOpen={openProject} featured />
          {grid.length > 0 ? (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {grid.map((project) => (
                <li key={project.id}>
                  <ProjectCard project={project} onOpen={openProject} />
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {earlier.length > 0 ? (
        <section aria-labelledby="earlier-heading" className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
          <h2 id="earlier-heading" className="sr-only">
            Earlier web and UI work
          </h2>
          <details className="group rounded-2xl border border-line bg-surface px-5 sm:px-6" open={selectedFilters.size > 0 || featured.length === 0}>
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
              <span className="flex flex-col gap-1">
                <span className="font-display text-lg font-semibold text-fg sm:text-xl">Earlier web and UI work</span>
                <span className="text-sm text-muted">
                  {earlier.length} {earlier.length === 1 ? "project" : "projects"} · WordPress, campaigns, prototypes, education and volunteer work
                </span>
              </span>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="shrink-0 text-muted transition-transform group-open:rotate-180">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <ul className="pb-2">
              {earlier.map((project) => (
                <ProjectRow key={project.id} project={project} onOpen={openProject} />
              ))}
            </ul>
          </details>
        </section>
      ) : (
        <div className="pb-16" />
      )}

      <Suspense fallback={null}>
        <CaseStudyFromUrl visible={visible} onOpen={openProject} onClose={closeProject} />
      </Suspense>
    </main>
  );
}
