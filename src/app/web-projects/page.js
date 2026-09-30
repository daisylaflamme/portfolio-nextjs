"use client";

import { useState, useMemo } from "react";
import { projects, featuredProjectIds } from "@/data/projects";
import { groupProjects } from "@/lib/projectSections";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModal";
import ProjectFilterBar from "./ProjectFilterBar";
import { PROJECT_FILTERS } from "./projectFilters";
import GoToTop from "../GoToTop";

export default function Page() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState(() => new Set());

  const { featured, earlier } = useMemo(() => {
    const activeFilters = PROJECT_FILTERS.filter((filter) => selectedFilters.has(filter.id));
    return groupProjects(projects, featuredProjectIds, activeFilters);
  }, [selectedFilters]);
  const resultCount = featured.length + earlier.length;
  const hasResults = resultCount > 0;

  const toggleFilter = (filterId) => {
    setSelectedFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filterId)) next.delete(filterId);
      else next.add(filterId);
      return next;
    });
  };
  const clearFilters = () => setSelectedFilters(new Set());

  const renderGrid = (items) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onViewDetails={setSelectedProject}
        />
      ))}
    </div>
  );

  return (
    <main className="font-inter min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto rounded-2xl p-6 md:p-8 shadow-md">
        <div className="mb-8">
          <ProjectFilterBar
            selected={selectedFilters}
            onToggle={toggleFilter}
            onClear={clearFilters}
          />
          <p className="sr-only" aria-live="polite">
            {selectedFilters.size === 0
              ? `Showing all ${resultCount} projects`
              : `Showing ${resultCount} matching ${resultCount === 1 ? "project" : "projects"}`}
          </p>
        </div>
        {!hasResults ? (
          <div
            className="rounded-xl border border-[var(--color-petal-border)] bg-[var(--color-petal-bg)] p-6 md:p-8 text-center"
            role="status"
          >
            <p className="text-[var(--color-font-primary)] font-medium text-lg mb-2">
              No projects match these filters.
            </p>
            <p className="text-[var(--color-font-secondary)] text-sm max-w-md mx-auto mb-4">
              Try removing a filter, or show every project again.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--color-petal-border)] bg-[var(--color-primary-bg)] text-[var(--color-font-primary)] font-medium text-sm hover:bg-[var(--color-center-circle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-shadow-accent)] focus:ring-offset-2 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {featured.length > 0 ? (
              <section aria-labelledby="featured-work-heading">
                <h2
                  id="featured-work-heading"
                  className="font-playfair-display font-medium text-2xl text-[var(--color-font-primary)] mb-5"
                >
                  Featured Engineering Work
                </h2>
                {renderGrid(featured)}
              </section>
            ) : null}
            {earlier.length > 0 ? (
              <section
                aria-labelledby="earlier-work-heading"
                className={
                  featured.length > 0
                    ? "mt-14 pt-10 border-t border-[var(--color-petal-border)]"
                    : undefined
                }
              >
                <h2
                  id="earlier-work-heading"
                  className="font-playfair-display font-medium text-xl text-[var(--color-font-primary)] mb-1"
                >
                  Earlier Web &amp; UI Work
                </h2>
                <p className="text-sm text-[var(--color-font-secondary)] mb-5">
                  Web development, UI/design, CMS, education, and volunteer projects from earlier in my career.
                </p>
                {renderGrid(earlier)}
              </section>
            ) : null}
          </>
        )}
      </div>
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      <GoToTop />
    </main>
  );
}
