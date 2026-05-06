"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { authClient } from "@/lib/auth-client";
import { SearchIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
type AdminUser = {
  role?: string;
  banned: boolean | null;
  banReason?: string | null;
  banExpires?: Date | string | null;
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
};
const PAGE_SIZE = 10;

export default function Page() {
  const [input, setInput] = useState("");
  const [debouncedValue] = useDebounceValue(input, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));
  useEffect(() => {
    let isCancelled = false;

    async function loadUsers() {
      setLoading(true);

      const offset = (currentPage - 1) * PAGE_SIZE;

      const result = await authClient.admin.listUsers({
        query: {
          limit: PAGE_SIZE,
          offset,
          sortBy: "createdAt",
          sortDirection: "desc",
          searchValue: debouncedValue || undefined,
          searchField: "name",
          searchOperator: "contains",
        },
      });

      if (isCancelled) {
        return;
      }

      if (result.error) {
        setUsers([]);
        setTotalUsers(0);
        setLoading(false);
        return;
      }

      const payload = result.data as
        | { users?: AdminUser[]; total?: number }
        | undefined;

      setUsers(Array.isArray(payload?.users) ? payload.users : []);
      setTotalUsers(typeof payload?.total === "number" ? payload.total : 0);
      setLoading(false);
    }

    loadUsers().catch(() => {
      if (isCancelled) {
        return;
      }

      setUsers([]);
      setTotalUsers(0);
      setLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [currentPage, debouncedValue]);

  return (
    <div className="h-full w-full">
      <Card className="h-full w-full">
        <CardHeader className="flex flex-col gap-4 lg:flex-row justify-between items-center">
          <CardTitle>Manage Users</CardTitle>
          <InputGroup className="w-full lg:w-75">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search Users..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </InputGroup>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Closet</TableHead>
                <TableHead>Tryouts</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.emailVerified ? "✓" : "—"}</TableCell>
                    <TableCell>{user.role || "user"}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} ({totalUsers} total)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages || loading}
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
