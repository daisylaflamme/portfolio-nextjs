/** Shown when none of a category's images have been added to public/ yet. */
export default function EmptyArchive() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
      <p className="rounded-2xl border border-line bg-surface p-8 text-center text-muted">
        This collection is being moved over from my old portfolio. Check back soon.
      </p>
    </div>
  );
}
