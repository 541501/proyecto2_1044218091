import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 py-8 px-6">
      {/* Header skeleton */}
      <div className="h-10 w-1/3 bg-slate-200 rounded animate-pulse" />
      <div className="h-6 w-2/3 bg-slate-200 rounded animate-pulse" />

      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded animate-pulse" />
          ))}
      </div>

      {/* Table skeleton */}
      <div className="space-y-3">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded animate-pulse" />
          ))}
      </div>
    </div>
  );
}
