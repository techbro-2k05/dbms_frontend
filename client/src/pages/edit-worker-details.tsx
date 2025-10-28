import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EditWorkerDetails() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    location: user?.location || "",
    role: user?.role || "",
  });
  const [editing, setEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => setEditing(true);
  const handleSave = () => {
    // TODO: Add API call to update user details
    setEditing(false);
    window.location.href = "/worker-dashboard";
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Edit My Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Full Name"
          />
          <Input
            name="username"
            value={form.username}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Username"
          />
          <Input
            name="location"
            value={form.location}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Location"
          />
          <Input
            name="role"
            value={form.role}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Role"
          />
          {!editing ? (
            <Button type="button" onClick={handleEdit} className="w-full">Edit</Button>
          ) : (
            <Button type="button" onClick={handleSave} className="w-full">Save</Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
