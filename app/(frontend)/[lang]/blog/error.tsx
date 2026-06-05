'use client'

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <section className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-6">
        <h2 className="text-3xl font-bold mb-2">Something went wrong</h2>
        <p className="text-base-content/60 mb-6">{error.message || 'An error occurred loading this blog content.'}</p>
        <button
          onClick={reset}
          className="btn btn-primary"
        >
          Try again
        </button>
      </div>
    </section>
  )
}
