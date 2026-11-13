/**
 * Guard rails for the GraphQL endpoint, as graphql-js validation rules (no extra dependency).
 * Both walk each operation, expanding fragments, before anything executes.
 *
 * - depthLimit: the schema has no cycles, so real queries stay shallow; this caps anything else.
 * - complexityLimit: every field costs 1, and fields that run a DataSource call (the `dashboard`
 *   root and its views) cost HEAVY, so aliasing `dashboard` dozens of times is refused.
 */
import { GraphQLError, Kind, type ASTVisitor, type SelectionSetNode, type ValidationContext, type ValidationRule } from "graphql";

/** Fields that query the data source. */
const HEAVY_FIELDS = new Set([
  "dashboard",
  "kpis",
  "monthlyRevenue",
  "countries",
  "topProducts",
  "basket",
  "cohorts",
  "segments",
  "returns",
  "searchProducts",
  "productMonthly",
  "status",
]);
export const HEAVY = 10;

function walk(
  context: ValidationContext,
  set: SelectionSetNode,
  depth: number,
  seen: Set<string>,
  visit: (field: string, depth: number) => void,
): void {
  for (const sel of set.selections) {
    if (sel.kind === Kind.FIELD) {
      visit(sel.name.value, depth);
      if (sel.selectionSet) walk(context, sel.selectionSet, depth + 1, seen, visit);
    } else if (sel.kind === Kind.INLINE_FRAGMENT) {
      walk(context, sel.selectionSet, depth, seen, visit);
    } else {
      const name = sel.name.value;
      // A fragment spread inside itself is caught by the standard rules; don't loop here.
      if (seen.has(name)) continue;
      const fragment = context.getFragment(name);
      if (fragment) walk(context, fragment.selectionSet, depth, new Set(seen).add(name), visit);
    }
  }
}

export function depthLimit(max: number): ValidationRule {
  return (context): ASTVisitor => ({
    OperationDefinition(node) {
      let deepest = 0;
      walk(context, node.selectionSet, 1, new Set(), (_, depth) => {
        deepest = Math.max(deepest, depth);
      });
      if (deepest > max) {
        context.reportError(new GraphQLError(`Query is too deep: ${deepest} levels (max ${max}).`, { nodes: [node] }));
      }
    },
  });
}

export function complexityLimit(max: number): ValidationRule {
  return (context): ASTVisitor => ({
    OperationDefinition(node) {
      let cost = 0;
      walk(context, node.selectionSet, 1, new Set(), (field) => {
        cost += HEAVY_FIELDS.has(field) ? HEAVY : 1;
      });
      if (cost > max) {
        context.reportError(new GraphQLError(`Query is too complex: cost ${cost} (max ${max}).`, { nodes: [node] }));
      }
    },
  });
}
