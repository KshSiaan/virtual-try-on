"use client";

import * as React from "react";
// lucide-react icons not used here
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
} from "@/components/ui/combobox";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { authClient } from "@/lib/auth-client";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function SendFriendRequest() {
  const [people, setPeople] = React.useState<
    Array<{
      id: string;
      name: string;
      email: string;
      image?: string;
      value: string;
    }>
  >([]);

  const [value, setValue] = React.useState<string | null>(null);
  const [searchValue, setSearchValue] = React.useState("");
  const [debouncedSearchValue] = useDebounceValue(searchValue, 300);
  const [selectedMethod, setSelectedMethod] = React.useState<"name" | "email">(
    "name",
  );
  const qcl = useQueryClient();

  const { mutate: sendFriendRequest, isPending } = useMutation({
    mutationKey: ["send-friend-request"],
    mutationFn: async (friendId: string) => {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendID: friendId }),
        credentials: "same-origin",
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(payload?.message || "Failed to send friend request");
      return payload;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Friend request sent");
      setValue(null);
      qcl.invalidateQueries({ queryKey: ["friend-requests"] });
      qcl.invalidateQueries({ queryKey: ["friend-requests", "sent"] });
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to send friend request";
      toast.error(msg);
    },
  });

  React.useEffect(() => {
    const fetchPeople = async () => {
      const res = await authClient.admin.listUsers({
        query: {
          limit: 10,
          searchField: selectedMethod === "name" ? "name" : "email",
          searchValue: debouncedSearchValue,
        },
      });
      setPeople(
        res.data?.users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          image:
            user.image ??
            `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${user?.name}`,
          value: user.id,
        })) || [],
      );
    };
    fetchPeople();
  }, [debouncedSearchValue, selectedMethod]);

  return (
    <Card className="mt-6 w-full">
      <CardContent className="grid grid-cols-2 gap-4 pt-6">
        <div className="col-span-2">
          <Combobox
            value={value}
            onValueChange={(v) => setValue(v === value ? "" : v)}
          >
            <div className="w-full">
              <ComboboxInput
                placeholder={`Type a ${selectedMethod}...`}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full border"
                showTrigger
              />
            </div>

            <ComboboxContent sideOffset={6} align="start">
              <ComboboxList>
                <ComboboxEmpty>No person found.</ComboboxEmpty>
                <ComboboxGroup>
                  {people.map((person) => (
                    <ComboboxItem key={person.value} value={person.value}>
                      {selectedMethod === "name" ? person.name : person.email}
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        <Button
          variant={selectedMethod === "name" ? "secondary" : "outline"}
          onClick={() => setSelectedMethod("name")}
        >
          By Name
        </Button>
        <Button
          variant={selectedMethod === "email" ? "secondary" : "outline"}
          onClick={() => setSelectedMethod("email")}
        >
          By Email
        </Button>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 border-t pt-6">
        {value && (
          <div className="flex flex-col items-center gap-2">
            <Avatar>
              <AvatarImage src={people.find((p) => p.value === value)?.image} />
              <AvatarFallback>
                {people
                  .find((p) => p.value === value)
                  ?.name?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">
              Selected:{" "}
              <span className="font-medium text-foreground">
                {people.find((p) => p.value === value)?.name ||
                  people.find((p) => p.value === value)?.email}
              </span>
            </p>
          </div>
        )}
        <Button
          className="w-full"
          disabled={!value || isPending}
          onClick={() => {
            if (!value) return;
            sendFriendRequest(value);
          }}
        >
          {isPending ? "Sending..." : "Send Friend Request"}
        </Button>
      </CardFooter>
    </Card>
  );
}
// removed unused helper
