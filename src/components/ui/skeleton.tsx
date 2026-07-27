<<<<<<< HEAD
import { cn } from "@/lib/utils";
=======
import { cn } from "@/lib/utils"
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
<<<<<<< HEAD
      className={cn("animate-pulse rounded-2xl bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
=======
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
>>>>>>> 9c30fdb6d669207e970434959966c84fc592eb7d
