"use client"; 

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Search, Filter, Users as UsersIcon } from "lucide-react"; 
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth-hook"; 
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Added import
import { cn } from "@/lib/utils"; // Added import

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string; 
  joinedDate: string; 
  photoURL?: string;
}

const sampleUsers: AppUser[] = [
  { id: "usr_1", name: "Aline U.", email: "aline.u@example.com", role: "Student", status: "Active", joinedDate: "2023-01-15" },
  { id: "usr_2", name: "K. David", email: "k.david@example.com", role: "Student", status: "Active", joinedDate: "2023-02-20" },
  { id: "usr_3", name: "M. Grace", email: "m.grace@example.com", role: "Teacher", status: "Active", joinedDate: "2022-11-05" },
  { id: "usr_4", name: "Jean Claude T.", email: "jc.tuyizere@example.com", role: "Admin", status: "Active", joinedDate: "2022-10-01" },
  { id: "usr_5", name: "John Doe", email: "john.doe@example.com", role: "Volunteer", status: "Pending", joinedDate: "2024-03-10" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>(sampleUsers); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const usersCollectionRef = collection(db, "users");
        const querySnapshot = await getDocs(usersCollectionRef);
        const fetchedUsers: AppUser[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.displayName || "N/A",
            email: data.email || "N/A",
            role: data.role || "User",
            status: data.status || "Active", 
            joinedDate: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : "N/A", // Assuming createdAt is a Firestore Timestamp
            photoURL: data.photoURL,
          };
        });
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers(); // Enable fetching users
  }, []);

  const filteredUsers = users.filter(user =>
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase())) 
    // (roleFilter ? user.role === roleFilter : true) 
  );


  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Card className="mb-8 shadow-lg border-none">
        <CardHeader className="bg-card p-6 rounded-t-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <UsersIcon className="h-7 w-7 text-primary" />
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">User Management</CardTitle>
                </div>
                <CardDescription className="text-sm sm:text-base">View, edit, and manage all user accounts including students and teachers.</CardDescription>
            </div>
            <Button asChild className="bg-accent hover:bg-accent/80 text-accent-foreground rounded-full text-sm px-5 py-2.5">
              <Link href="/register"> 
                <PlusCircle className="mr-2 h-4 w-4" /> Add New User
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-md border-none">
        <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        type="search" 
                        placeholder="Search by name or email..." 
                        className="pl-10 w-full h-10 rounded-full bg-input border-border focus:border-primary" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="h-10 rounded-full" disabled> 
                    <Filter className="mr-2 h-4 w-4" /> Filter by Role (Soon)
                </Button>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
             <div className="p-6 text-center text-muted-foreground">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
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
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.id}/40/40`} alt={user.name} data-ai-hint="user avatar small" />
                                <AvatarFallback>{user.name?.split(" ").map(n=>n[0]).join("").toUpperCase() || user.email?.[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            {user.name}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.role === 'Admin' ? 'default' : (user.role === 'Teacher' ? 'secondary' : 'outline')}
                          className={cn(
                            user.role === 'Admin' && 'bg-primary text-primary-foreground',
                            user.role === 'Teacher' && 'bg-blue-500/20 text-blue-700 border-blue-500/30 dark:bg-blue-500/30 dark:text-blue-300 dark:border-blue-500/40',
                            user.role === 'Student' && 'bg-green-500/20 text-green-700 border-green-500/30 dark:bg-green-500/30 dark:text-green-300 dark:border-green-500/40',
                            !['Admin', 'Teacher', 'Student'].includes(user.role) && 'bg-gray-500/20 text-gray-700 border-gray-500/30 dark:bg-gray-500/30 dark:text-gray-300 dark:border-gray-500/40'
                          )}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={user.status === 'Active' ? 'outline' : 'destructive'} className={cn(
                            user.status === 'Active' ? 'text-green-600 border-green-500/80 bg-green-500/10 dark:text-green-400 dark:border-green-500/70 dark:bg-green-500/20' : 
                            (user.status === 'Pending' ? 'text-yellow-600 border-yellow-500/80 bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/70 dark:bg-yellow-500/20' : 'text-red-600 border-red-500/80 bg-red-500/10 dark:text-red-400 dark:border-red-500/70 dark:bg-red-500/20')
                        )}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">{user.joinedDate}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">User Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled>View Details</DropdownMenuItem>
                            <DropdownMenuItem disabled>Edit User</DropdownMenuItem>
                            <DropdownMenuItem disabled className="text-destructive focus:text-destructive focus:bg-destructive/10">
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {filteredUsers.length > 0 && (
             <CardFooter className="p-4 border-t">
                <p className="text-xs text-muted-foreground">Showing {filteredUsers.length} of {users.length} users.</p>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}

