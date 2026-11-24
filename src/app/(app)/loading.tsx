import { Skeleton } from "@/components/lucian/Skeleton";

export default function AppLoading() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Đang tải nội dung"
    >
      <span className="sr-only">Đang tải...</span>

      <div className="space-y-2.5">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
