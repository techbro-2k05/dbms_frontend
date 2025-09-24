import AdminUserManagement from "@/components/dashboard/admin-user-management";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function EditUser() {
  const [, navigate] = useLocation();
  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => navigate("/add-user")}>Add New User</Button>
      </div>
      <AdminUserManagement />
    </>
  );
}
