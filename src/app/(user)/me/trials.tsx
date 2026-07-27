"use client";
import { ClosetCardSkeleton } from "@/components/core/card-skeleton";
import TrialsCard from "@/components/core/trials-card";
import { useQuery } from "@tanstack/react-query";

export default function Trials() {
  const { data, isPending } = useQuery({
    queryKey: ["trials"],
    queryFn: async (): Promise<{
      message: string;
      trials: Array<{
        id: string;
        authorId: string;
        tryonId: string;
        resultImageUrl: string;
        caption: string;
        model: string;
        size: string;
        status: string;
        createdAt: string;
        updatedAt: string;
      }>;
    }> => {
      const res = await fetch("/api/user/trials");
      return res.json();
    },
  });

  if (isPending) {
    return Array.from({ length: 3 }, (_, index) => (
      <ClosetCardSkeleton
        key={`placeholder-${
          // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons
          index
        }`}
      />
    ));
  }

  if (!data?.trials || data.trials.length === 0) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">No trials yet</p>
      </div>
    );
  }

  return data.trials.map((trial) => (
    <TrialsCard
      key={trial.id}
      id={trial.id}
      resultImageUrl={trial.resultImageUrl}
      caption={trial.caption}
      model={trial.model}
      size={trial.size}
      status={trial.status}
      createdAt={trial.createdAt}
      onShare={() => {
        //check in native share works. If not fallback to copying a link to clipboard
        if (navigator.share) {
          navigator.share({
            title: trial.caption || "Trial Result",
            url: `${window.location.origin}/studio/${trial.id}`,
          });
        } else {
          // Fallback to copying link to clipboard
          navigator.clipboard.writeText(
            `${window.location.origin}/studio/${trial.id}`,
          );
        }
      }}
    />
  ));
}
