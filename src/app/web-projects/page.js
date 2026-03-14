"use client";

import { useState, useMemo } from "react";
import { projects } from "@/data/projects";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModal";
import GoToTop from "../GoToTop";
import FilterDropdown from "../FilterDropdown";

const PROJECT_FILTER_CATEGORIES = [
  {
    id: "frontend",
    label: "Frontend",
    options: [
      { id: "angular", label: "Angular" },
      { id: "react", label: "React" },
      { id: "nextjs", label: "Next.js" },
      { id: "javascript", label: "JavaScript" },
      { id: "html", label: "HTML" },
    ],
  },
  {
    id: "styling",
    label: "Styling",
    options: [
      { id: "css", label: "CSS" },
      { id: "scss", label: "SCSS" },
      { id: "tailwind", label: "Tailwind" },
      { id: "bootstrap", label: "Bootstrap" },
    ],
  },
  {
    id: "project-type",
    label: "Project Type",
    options: [
      { id: "ecommerce", label: "Ecommerce" },
      { id: "startup", label: "Startup" },
      { id: "volunteer", label: "Volunteer" },
      { id: "small-business", label: "Small Business" },
    ],
  },
  {
    id: "other",
    label: "Other",
    options: [
      { id: "ai", label: "AI" },
      { id: "cms", label: "CMS" },
      { id: "instructional-design", label: "Instructional Design" },
    ],
  },
];

export default function Page() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState(() => new Set());

  const filteredProjects = useMemo(() => {
    if (selectedFilters.size === 0) return projects;
    return projects.filter((project) => {
      const tags = project.tags || [];
      return Array.from(selectedFilters).every((filterId) => tags.includes(filterId));
    });
  }, [selectedFilters]);

  return (
    <main className="font-inter min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto rounded-2xl p-6 md:p-8 shadow-md">
        <div className="mb-6">
          <FilterDropdown
            label="Filter projects by"
            categories={PROJECT_FILTER_CATEGORIES}
            selected={selectedFilters}
            onChange={setSelectedFilters}
          />
        </div>
        {selectedFilters.size > 0 && filteredProjects.length === 0 ? (
          <div
            className="rounded-xl border border-[var(--color-petal-border)] bg-[var(--color-petal-bg)] p-6 md:p-8 text-center"
            role="status"
            aria-live="polite"
          >
            <p className="text-[var(--color-font-primary)] font-medium text-lg mb-2">
              No projects match all of your selected filters.
            </p>
            <p className="text-[var(--color-font-secondary)] text-sm max-w-md mx-auto mb-4">
              Projects must have every selected filter. Try removing one or more filters to see more results—use the × on each chip above or open the filter menu and choose &ldquo;Unselect all&rdquo; to start over.
            </p>
            <button
              type="button"
              onClick={() => setSelectedFilters(new Set())}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--color-petal-border)] bg-[var(--color-primary-bg)] text-[var(--color-font-primary)] font-medium text-sm hover:bg-[var(--color-center-circle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-shadow-accent)] focus:ring-offset-2 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewDetails={setSelectedProject}
              />
            ))}
          </div>
        )}
      </div>
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      <GoToTop />
    </main>
  );
}
