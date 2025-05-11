
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Sample user data
const users = [
  { id: "usr_1", name: "Aline U.", email: "aline.u@example.com", role: "Student Participant", status: "Active", joinedDate: "2023-01-15" },
  { id: "usr_2", name: "K. David", email: "k.david@example.com", role: "Student", status: "Active", joinedDate: "2023-02-20" },
  { id: "usr_3", name: "M. Grace", email: "m.grace@example.com", role: "Teacher", status: "Active", joinedDate: "2022-11-05" },
  { id: "usr_4", name: "Jean Claude Tuyizere", email: "jc.tuyizere@example.com", role: "Admin", status: "Active", joinedDate: "2022-10-01" },
  { id: "usr_5", name: "John Doe", email: "john.doe@example.com", role: "Volunteer", status: "Pending", joinedDate: "2024-03-10" },
];

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle className="text-3xl font-bold text-primary">Manage Users</CardTitle>
                <CardDescription>View, edit, and manage user accounts.</CardDescription>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New User
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search users by name or email..." className="pl-8 w-full" />
                </div>
                {/* Add filter button here if needed */}
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={user.status === 'Active' ? 'outline' : 'destructive'} className={user.status === 'Active' ? 'text-green-600 border-green-600' : 'text-yellow-600 border-yellow-600'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{user.joinedDate}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">User Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 hover:!text-red-600 hover:!bg-red-50">
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        {/* Add pagination here if needed */}
      </Card>
    </div>
  );
}
