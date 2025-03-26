import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Search, UserX, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const profileSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone_number: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
}


type ProfileFormValues = z.infer<typeof profileSchema>;

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false); // New state for update dialog
  const PAGE_SIZE = 15;
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: selectedUser?.username || "",
      email: selectedUser?.email || "",
      phone_number: selectedUser?.phone_number || "",
      first_name: selectedUser?.first_name || "",
      last_name: selectedUser?.last_name || "",
    },
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const queryParams = new URLSearchParams({
        page: String(currentPage - 1),
        page_size: String(PAGE_SIZE),
        order: "desc",
        sort: "create_at",
      });

      if (searchTerm.trim()) {
        queryParams.append("search", searchTerm);
      }

      const response = await fetch(
        `http://127.0.0.1:8080/api/v1/users/all?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const responseData = await response.json();
      if (responseData && responseData.data && Array.isArray(responseData.data.data)) {
        setUsers(responseData.data.data);
        setTotalPages(responseData.data.total_pages || Math.ceil(responseData.data.total / PAGE_SIZE));
        setTotalUsers(responseData.data.total || responseData.data.data.length);
      } else {
        throw new Error("Unexpected response structure");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSubmit = async (data: ProfileFormValues) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast({
          title: "Error",
          description: "You must be logged in to update the user profile",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8080/api/v1/users/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: data.username,
            email: data.email,
            phone_number: data.phone_number,
            first_name: data.first_name,
            last_name: data.last_name,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user profile");
      }

      const updatedUser = await response.json();
      setUsers((prev) =>
        prev.map((user) =>
          user.id === updatedUser.data.id ? updatedUser.data : user
        )
      );
      toast({
        title: "Success",
        description: "User profile updated successfully",
      });
      setUpdateDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user profile",
        variant: "destructive",
      });
    }
  };

  const openUpdateDialog = (user: User) => {
    setSelectedUser(user);
    setUpdateDialogOpen(true);
  };

  
  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  return (
    <AdminLayout title="Manage Users">
      <Card className="w-full p-6">
        <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">User Management</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                      </div>
                      <div className="mt-2">Loading users...</div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.first_name}</TableCell>
                      <TableCell>{user.last_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone_number}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUpdateDialog(user)}
                        >
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Update User Dialog */}
          <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update User</DialogTitle>
                <DialogDescription>
                  Edit the details for the user.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleUpdateSubmit)}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username">Username</label>
                    <Input {...form.register("username")} id="username" />
                  </div>
                  <div>
                    <label htmlFor="email">Email <span className="text-red-600"> * </span>
                    <span className="text-gray-400">user cannot update email, please use current user email to find user to update.</span>
                    </label>
                    <Input {...form.register("email")} id="email" />
                  </div>
                  <div>
                    <label htmlFor="phone_number">Phone Number</label>
                    <Input {...form.register("phone_number")} id="phone_number" />
                  </div>
                  <div>
                    <label htmlFor="first_name">First Name</label>
                    <Input {...form.register("first_name")} id="first_name" />
                  </div>
                  <div>
                    <label htmlFor="last_name">Last Name</label>
                    <Input {...form.register("last_name")} id="last_name" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full mt-4">Update</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminUsers;
