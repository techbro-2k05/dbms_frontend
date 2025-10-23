import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
// import AddUserForm from "@/components/dashboard/add-user-form";

export default function AdminUserManagement(){
  // const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["/api/members"],
  });
  const users = Array.isArray(data) ? data : [];
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await apiRequest("PATCH", `/api/employees/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setEditUserId(null);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/employees/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
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
        <Table>
          <TableHeader>
            <TableRow>
              {/* fname: "",
              mname: "",
              lname: "",
              password: "",
              type: "MEMBER",
              phone:"",
              gender: "MALE",//"MALE" or "FEMALE"
              allowedPaidLeaves:0,
              allowedHours: 0,
              worksAt: 0, */}
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location_ID</TableHead>
              <TableHead>Allowed Hourse</TableHead>
              <TableHead>Allowed Paid leaves</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Password</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell>
                  {editUserId === user.id ? (
                    <Input value={editData.name} onChange={e => setEditData({ ...editData, fname: e.target.value })} />
                  ) : (
                    user.fname
                  )}
                </TableCell>
                <TableCell>
                  {editUserId === user.id ? (
                    <Input value={editData.name} onChange={e => setEditData({ ...editData, lname: e.target.value })} />
                  ) : (
                    user.lname
                  )}
                </TableCell>
                {/* <TableCell>{user.username}</TableCell> */}
                <TableCell>
                  {editUserId === user.id ? (
                    <Input value={editData.type} onChange={e => setEditData({ ...editData, type: e.target.value })} />
                  ) : (
                    user.type
                  )}
                </TableCell>
                <TableCell>
                  {editUserId === user.id ? (
                    <Input value={editData.location} onChange={e => setEditData({ ...editData, worksAt: e.target.value })} />
                  ) : (
                    user.worksAt
                  )}
                </TableCell>
                <TableCell>
                  {editUserId === user.id ? (
                    <Input value={editData.role} onChange={e => setEditData({ ...editData, allowedHours: e.target.value })} />
                  ) : (
                    user.allowedHours
                  )}
                </TableCell>
                <TableCell>
                  {editUserId === user.id ? (
                    <Input value={editData.role} onChange={e => setEditData({ ...editData, allowedPaidLeaves: e.target.value })} />
                  ) : (
                    user.allowedPaidLeaves
                  )}
                </TableCell>
                <TableCell>
                  {editUserId === user.id ? (
                    <Input value={editData.role} onChange={e => setEditData({ ...editData, gender: e.target.value })} />
                  ) : (
                    user.gender
                  )}
                </TableCell>
                <TableCell>
                  {editUserId === user.id ? (
                    <Input value={editData.role} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
                  ) : (
                    user.phone
                  )}
                </TableCell>
                <TableCell>
                  {editUserId === user.id ? (
                    <Input value={editData.role} onChange={e => setEditData({ ...editData, password: e.target.value })} />
                  ) : (
                    user.password
                  )}
                </TableCell>
                <TableCell>
                  {editUserId === user.id ? (
                    <Button size="sm" onClick={handleSave}>Save</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>Edit</Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => deleteUserMutation.mutate(user.id)} className="ml-2">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </div>
  );
}
