"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteAffiliateItem, type AffiliateProduct } from "@/lib/api/affiliates/functions";
import { PackageXIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Add from "./add";
import Edit from "./edit";

export default function Page() {
  const qcl = useQueryClient();

  const { data, isLoading } = useQuery<{ data: AffiliateProduct[] }>({
    queryKey: ["affiliate-items"],
    queryFn: async () => {
      const res = await fetch("/api/affiliates?limit=100");
      if (!res.ok) throw new Error("Failed to fetch affiliate products");
      return res.json();
    },
  });

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteAffiliateItem(id),
    onSuccess: () => {
      toast.success("Affiliate product deleted");
      qcl.invalidateQueries({ queryKey: ["affiliate-items"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete affiliate product");
    },
  });

  const items = data?.data ?? [];

  return (
    <div>
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="font-bold text-2xl">Manage Affiliates</h1>
          <p className="text-sm text-muted-foreground">
            Here you can manage your affiliate products and their visibility in the feed.
          </p>
        </div>
        <Add />
      </div>

      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              (["sk-a", "sk-b", "sk-c", "sk-d", "sk-e"] as const).map((key) => (
                <TableRow key={key}>
                  <TableCell>
                    <Skeleton className="size-10 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-24 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                    <PackageXIcon className="size-12 text-muted-foreground/40" />
                    <p className="font-medium text-muted-foreground">No affiliate products yet</p>
                    <p className="text-sm text-muted-foreground">
                      Create your first affiliate product using the button above.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="size-10 rounded-md object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium max-w-48 truncate">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">{item.brand ?? "—"}</TableCell>
                <TableCell className="capitalize text-muted-foreground">
                  {item.type ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.price != null
                    ? `${item.currency ?? "USD"} ${item.price}`
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={item.isActive ? "default" : "secondary"}>
                    {item.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Edit item={item} />

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isDeleting}
                        >
                          <Trash2Icon className="size-3.5" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete &quot;{item.name}&quot;?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove the affiliate product and its image. This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => remove(item.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
