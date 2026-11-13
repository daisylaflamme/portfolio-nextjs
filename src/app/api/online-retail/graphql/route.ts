import { getOnlineRetailSource } from "@/lib/dashboards/online-retail/data";
import { createOnlineRetailYoga } from "@/lib/dashboards/online-retail/graphql/schema";

/**
 * GraphQL for the Online Retail dashboard. The dashboard's client components use GET (cached
 * by the CDN, since the data never changes); POST works too, uncached. Schema, resolvers and
 * guard rails: src/lib/dashboards/online-retail/graphql/.
 */
const yoga = createOnlineRetailYoga({ getSource: () => getOnlineRetailSource() });

export async function GET(request: Request) {
  return yoga.fetch(request);
}

export async function POST(request: Request) {
  return yoga.fetch(request);
}
