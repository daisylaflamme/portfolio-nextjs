/** Whether "Summarize this view" is available: decided on the server from ANTHROPIC_API_KEY (never sent to the browser). */
export function summariesEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return Boolean(env.ANTHROPIC_API_KEY?.trim());
}
