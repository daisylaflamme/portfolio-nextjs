/**
 * True when no filters are active, or the project has a tag from any active filter (OR).
 *
 * @param {{ tags?: string[] }} project
 * @param {Array<{ tags: string[] }>} activeFilters
 */
export function matchesAnyFilter(project, activeFilters) {
  if (activeFilters.length === 0) return true;
  const tags = project.tags || [];
  return activeFilters.some((filter) => filter.tags.some((tag) => tags.includes(tag)));
}

/**
 * Split projects into featured (in `featuredIds` order) and earlier (in source order),
 * then apply the active filters to each group.
 *
 * @template {{ id: string, tags?: string[] }} P
 * @param {P[]} projects
 * @param {string[]} featuredIds
 * @param {Array<{ tags: string[] }>} activeFilters
 * @returns {{ featured: P[], earlier: P[] }}
 */
export function groupProjects(projects, featuredIds, activeFilters) {
  const byId = new Map(projects.map((project) => [project.id, project]));
  const featuredIdSet = new Set(featuredIds);

  const featured = featuredIds
    .map((id) => byId.get(id))
    .filter((project) => project && matchesAnyFilter(project, activeFilters));

  const earlier = projects.filter(
    (project) => !featuredIdSet.has(project.id) && matchesAnyFilter(project, activeFilters)
  );

  return { featured, earlier };
}
