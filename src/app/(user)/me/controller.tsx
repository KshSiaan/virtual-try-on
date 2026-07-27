"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Edit3Icon, LogOutIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FriendRequest } from "./friends/requests/friend-request-tabs";
import { Badge } from "@/components/ui/badge";

type User = typeof auth.$Infer.Session.user;

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Controller({
  data,
}: Readonly<{
  data: User;
}>) {
  const navig = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data: receivedData } = useQuery<{ data: FriendRequest[] }>({
    queryKey: ["friend-requests", "received"],
    queryFn: async () => {
      const res = await fetch("/api/friends/request?type=received");
      if (!res.ok) throw new Error("Failed to fetch received requests");
      return res.json();
    },
  });

  const pendingReceivedCount = (receivedData?.data ?? []).filter(
    (r) => r.status === "pending",
  ).length;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: data?.name ?? "",
      email: data?.email ?? "",
    },
  });

  const onSubmit = async (formData: ProfileFormData) => {
    const result = await authClient.updateUser({
      name: formData.name,
    });

    if (result.error) {
      toast.error(result.error.message);
      return;
    }
    toast.success("Profile updated successfully!");
    navig.refresh();
    setOpen(false);
    reset(formData);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Edit3Icon />
            Edit Profile
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Username</FieldLabel>
                <Input
                  id="name"
                  placeholder="Your name"
                  {...register("name")}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <span className="text-sm text-red-500">
                    {errors.name.message}
                  </span>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email"
                  {...register("email")}
                  disabled
                />
                {errors.email && (
                  <span className="text-sm text-red-500">
                    {errors.email.message}
                  </span>
                )}
              </Field>
            </FieldGroup>
          </form>
          <DialogFooter>
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button variant={"outline"} className="relative" asChild>
        <Link href="/me/friends">
          <UsersIcon /> Friends
          {pendingReceivedCount > 0 && (
            <Badge className="absolute -top-2 -right-2 rounded-full text-xs! aspect-square!">
              {pendingReceivedCount}
            </Badge>
          )}
        </Link>
      </Button>
      <Button
        variant={"destructive"}
        disabled={isLoggingOut}
        onClick={() => {
          setIsLoggingOut(true);
          authClient.signOut(
            {},
            {
              onError: () => {
                setIsLoggingOut(false);
              },
              onSuccess: () => {
                window.location.href = "/auth/signin";
              },
            },
          );
        }}
      >
        <LogOutIcon /> {isLoggingOut ? "Logging out..." : "Log out"}
      </Button>
    </>
  );
}
