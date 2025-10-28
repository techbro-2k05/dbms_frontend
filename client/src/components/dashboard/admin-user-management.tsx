import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { queryClient } from "@/lib/queryClient";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUserManagement() {
  const { toast } = useToast();
  
  // Fetch all members from backend
  const { data: members, isLoading } = useQuery({
    queryKey: ["/members"],
    queryFn: async () => {
      const response = await api.get('/members');
      return response.data;
    },
  });
  
  const users = Array.isArray(members) ? members : [];
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});

  // Update user mutation - PUT /members/{id}
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await api.put(`/members/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/members"] });
      setEditUserId(null);
      toast({
        title: "Success",
        description: "User updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to update user",
      });
    },
  });

  // Delete user mutation - DELETE /members/{id}
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/members/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/members"] });
      toast({
        title: "Success",
        description: "User deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete user",
      });
    },
  });

  const handleEdit = (user: any) => {
    setEditUserId(user.id);
    setEditData(user);
  };

  const handleSave = () => {
    updateUserMutation.mutate(editData);
  };

  return (
    <div>
    <div className="absolute top-14 right-14 z-10">
          <Button asChild variant="outline" className="text-sm">
          <a href="/admin-dashboard">
                            &larr; Back
                        </a>
                    </Button>
        </div>
    <Card>
      <CardHeader>
        <CardTitle>User Directory</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No users found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Middle Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location ID</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
              </TableHeader>
            <TableBody>
              {users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    {editUserId === user.id ? (
                      <Input 
                        value={editData.fname} 
                        onChange={e => setEditData({ ...editData, fname: e.target.value })} 
                      />
                    ) : (
                      user.fname
                    )}
                  </TableCell>
                  <TableCell>
                    {editUserId === user.id ? (
                      <Input 
                        value={editData.mname} 
                        onChange={e => setEditData({ ...editData, mname: e.target.value })} 
                      />
                    ) : (
                      user.mname
                    )}
                  </TableCell>
                  <TableCell>
                    {editUserId === user.id ? (
                      <Input 
                        value={editData.lname} 
                        onChange={e => setEditData({ ...editData, lname: e.target.value })} 
                      />
                    ) : (
                      user.lname
                    )}
                  </TableCell>
                  <TableCell>
                    {editUserId === user.id ? (
                      <Input 
                        value={editData.type} 
                        onChange={e => setEditData({ ...editData, type: e.target.value })} 
                      />
                    ) : (
                      user.type
                    )}
                  </TableCell>
                  <TableCell>
                    {editUserId === user.id ? (
                      <Input 
                        type="number"
                        value={editData.worksAt} 
                        onChange={e => setEditData({ ...editData, worksAt: parseInt(e.target.value) })} 
                      />
                    ) : (
                      user.worksAt
                    )}
                  </TableCell>
                  <TableCell>
                    {editUserId === user.id ? (
                      <Input 
                        type="number"
                        value={editData.allowedHours} 
                        onChange={e => setEditData({ ...editData, allowedHours: parseInt(e.target.value) })} 
                      />
                    ) : (
                      user.allowedHours
                    )}
                  </TableCell>
                  <TableCell>
                    {editUserId === user.id ? (
                      <Input 
                        type="number"
                        value={editData.allowedPaidLeaves} 
                        onChange={e => setEditData({ ...editData, allowedPaidLeaves: parseInt(e.target.value) })} 
                      />
                    ) : (
                      user.allowedPaidLeaves
                    )}
                  </TableCell>
                  <TableCell>
                    {editUserId === user.id ? (
                      <Input 
                        value={editData.gender} 
                        onChange={e => setEditData({ ...editData, gender: e.target.value })} 
                      />
                    ) : (
                      user.gender
                    )}
                  </TableCell>
                  <TableCell>
                    {editUserId === user.id ? (
                      <Input 
                        value={editData.phone} 
                        onChange={e => setEditData({ ...editData, phone: e.target.value })} 
                      />
                    ) : (
                      user.phone
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {editUserId === user.id ? (
                        <>
                          <Button 
                            size="sm" 
                            onClick={handleSave}
                            disabled={updateUserMutation.isPending}
                          >
                            {updateUserMutation.isPending ? "Saving..." : "Save"}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditUserId(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEdit(user)}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${user.fname} ${user.lname}?`)) {
                                deleteUserMutation.mutate(user.id);
                              }
                            }}
                            disabled={deleteUserMutation.isPending}
                          >
                            {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
