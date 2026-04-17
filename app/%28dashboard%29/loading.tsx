export default function DashboardLoading() {
  return (
    <div className="space-y-6 px-6 py-8">
      <div className="h-10 w-1/3 animate-pulse rounded bg-slate-200" />
      <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded bg-slate-200" />
          ))}
      </div>

      <div className="space-y-3">
        {Array(5)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded bg-slate-200" />
          ))}
      </div>
    </div>
  );
}
