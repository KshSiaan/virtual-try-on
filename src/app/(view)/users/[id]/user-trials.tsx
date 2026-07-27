"use client";

import TrialsCard from "@/components/core/trials-card";

type Trial = {
  id: string;
  resultImageUrl: string;
  caption: string | null;
  model: string | null;
  size: string | null;
  status: string;
  createdAt: string;
};

export default function UserTrials({ trials }: { trials: Trial[] }) {
  if (trials.length === 0) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed mt-12">
        <p className="text-muted-foreground">No trials yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6 pt-12">
      {trials.map((trial) => (
        <TrialsCard
          key={trial.id}
          id={trial.id}
          resultImageUrl={trial.resultImageUrl}
          caption={trial.caption ?? ""}
          model={trial.model ?? ""}
          size={trial.size ?? ""}
          status={trial.status}
          createdAt={trial.createdAt}
          onShare={() => {
            const url = `${window.location.origin}/studio/${trial.id}`;
            if (navigator.share) {
              navigator.share({ title: trial.caption || "Trial Result", url });
            } else {
              navigator.clipboard.writeText(url);
            }
          }}
        />
      ))}
    </div>
  );
}
