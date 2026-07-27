import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
export function ClosetCardSkeleton() {
  return (
    <Card className="gap-0 py-3 pb-6">
      <CardContent className="flex h-[40dvh] items-center justify-center rounded-lg! p-0">
        <Skeleton className="h-full w-full rounded-lg!" />
      </CardContent>
      <CardContent className="space-y-3 border-t p-6">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
        </div>
      </CardContent>
      <CardContent className="flex items-center justify-between gap-2 border-t p-4">
        <Skeleton className="h-9 w-9 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
