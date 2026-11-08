import type { Project, ProjectTag } from "@/data/types";

/** The part of a filter that matching needs; see PROJECT_FILTERS. */
export interface TagFilter {
  tags: readonly ProjectTag[];
}

/** True when no filters are active, or the project has a tag from any active filter (OR). */
export function matchesAnyFilter(project: Pick<Project, "tags">, activeFilters: readonly TagFilter[]): boolean {
  if (activeFilters.length === 0) return true;
  return activeFilters.some((filter) => filter.tags.some((tag) => project.tags.includes(tag)));
}

/**
 * Split projects into featured (in `featuredIds` order) and earlier (in source order),
 * then apply the active filters to each group.
 */
export function groupProjects<P extends Pick<Project, "id" | "tags">>(
  projects: readonly P[],
  featuredIds: readonly string[],
  activeFilters: readonly TagFilter[]
): { featured: P[]; earlier: P[] } {
  const byId = new Map(projects.map((project) => [project.id, project]));
  const featuredIdSet = new Set(featuredIds);

  const featured = featuredIds
    .map((id) => byId.get(id))
    .filter((project): project is P => project !== undefined && matchesAnyFilter(project, activeFilters));

  const earlier = projects.filter(
    (project) => !featuredIdSet.has(project.id) && matchesAnyFilter(project, activeFilters)
  );

  return { featured, earlier };
}
