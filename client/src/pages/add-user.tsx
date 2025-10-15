import AddUserForm from "@/components/dashboard/add-user-form";
import Sidebar from "@/components/dashboard/sidebar";
const user = {
      id:"1234",
      fname: "aa",
      mname: "bb",
      lname: "cc",
      type: "ADMIN",
      phone:"",
      gender: "MALE",//"MALE" or "FEMALE"
      allowedPaidLeaves:0,
      allowedHours: 0,
      worksAt: 0,  
      password: "admin123", // hash in production!
};
export default function NewUser() {
  return(
  <div>
  {/* <Sidebar user={user} /> */}
  <AddUserForm />
  </div>);
}
