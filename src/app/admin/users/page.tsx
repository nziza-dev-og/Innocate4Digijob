
"use client"; // Add "use client" for potential client-side filtering/search in future

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Search, Filter, Users as UsersIcon } from "lucide-react"; // Added Filter icon
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth-hook"; // For future use: fetching users from Firestore
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Link from "next/link";

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string; // e.g., "Active", "Pending", "Suspended"
  joinedDate: string; // Firestore timestamp converted to string or Date
  photoURL?: string;
}

// Sample user data - to be replaced with Firebase data
const sampleUsers: AppUser[] = [
  { id: "usr_1", name: "Aline U.", email: "aline.u@example.com", role: "Student", status: "Active", joinedDate: "2023-01-15" },
  { id: "usr_2", name: "K. David", email: "k.david@example.com", role: "Student", status: "Active", joinedDate: "2023-02-20" },
  { id: "usr_3", name: "M. Grace", email: "m.grace@example.com", role: "Teacher", status: "Active", joinedDate: "2022-11-05" },
  { id: "usr_4", name: "Jean Claude T.", email: "jc.tuyizere@example.com", role: "Admin", status: "Active", joinedDate: "2022-10-01" },
  { id: "usr_5", name: "John Doe", email: "john.doe@example.com", role: "Volunteer", status: "Pending", joinedDate: "2024-03-10" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>(sampleUsers); // Initialize with sample, then fetch
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // const [roleFilter, setRoleFilter] = useState(""); // For future filter dropdown

  // TODO: Implement fetching users from Firestore
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
            status: data.status || "Active", // Assuming a status field
            joinedDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "N/A",
            photoURL: data.photoURL,
          };
        });
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        // Handle error (e.g., show toast)
      } finally {
        setIsLoading(false);
      }
    };
    // fetchUsers(); // Uncomment when Firestore structure for users is ready
    setIsLoading(false); // Remove this if fetchUsers is enabled
  }, []);

  const filteredUsers = users.filter(user =>
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase())) // &&
    // (roleFilter ? user.role === roleFilter : true) // Future role filter
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
              <Link href="/register"> {/* Or a dedicated admin "add user" page */}
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
                {/* Placeholder for Filter Dropdown */}
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
                                <AvatarFallback>{user.name.split(" ").map(n=>n[0]).join("").toUpperCase() || user.email[0].toUpperCase()}</AvatarFallback>
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
                            user.role === 'Teacher' && 'bg-blue-500/20 text-blue-700 border-blue-500/30',
                            user.role === 'Student' && 'bg-green-500/20 text-green-700 border-green-500/30',
                          )}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={user.status === 'Active' ? 'outline' : 'destructive'} className={cn(
                            user.status === 'Active' ? 'text-green-600 border-green-600 bg-green-500/10' : 
                            (user.status === 'Pending' ? 'text-yellow-600 border-yellow-600 bg-yellow-500/10' : 'text-red-600 border-red-600 bg-red-500/10')
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
                            <DropdownMenuItem disabled className="text-red-600 hover:!text-red-600 hover:!bg-red-50/50 focus:!text-red-600 focus:!bg-red-50/50">
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
        {/* Add pagination here if needed */}
        {filteredUsers.length > 0 && (
             <CardFooter className="p-4 border-t">
                <p className="text-xs text-muted-foreground">Showing {filteredUsers.length} of {users.length} users.</p>
                {/* Pagination component will go here */}
            </CardFooter>
        )}
      </Card>
    </div>
  );
}

```
  </change>
  <change>
    <file>src/components/layout/admin-header.tsx</file>
    <description>Update AdminHeader to remove page title (handled by page) and link "New Teachers" to users page.</description>
    <content><![CDATA[
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, User, LogOut, Bell, ChevronDown, Users as UsersIcon, Search as SearchIcon } from "lucide-react"; 
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth-hook";
import { Input } from "@/components/ui/input"; // For search bar
// import { useTheme } from "next-themes"; // If theme toggle is implemented

export function AdminHeader() {
  const { user, signOut, loading } = useAuth();
  // const { theme, setTheme } = useTheme(); // For theme toggle

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      
      {/* Search bar - non-functional placeholder */}
      <div className="relative hidden md:block flex-1 max-w-xs">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Search here..." className="pl-9 h-9 rounded-full bg-muted/50 border-transparent focus:bg-background focus:border-primary" disabled />
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-4">
        {/* Language Dropdown - non-functional placeholder */}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 rounded-full text-xs px-3 hidden sm:flex">
                    ENGLISH <ChevronDown className="ml-1 h-3 w-3"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem>English (Selected)</DropdownMenuItem>
                <DropdownMenuItem disabled>Français (Soon)</DropdownMenuItem>
                <DropdownMenuItem disabled>Kinyarwanda (Soon)</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        {/* New Teachers Button */}
        <Button asChild className="h-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs px-4 hidden sm:flex">
            <Link href="/admin/users">
                <UsersIcon className="mr-2 h-4 w-4" /> New Teachers
            </Link>
        </Button>
        
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full text-muted-foreground hover:bg-muted/50">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-destructive-foreground bg-destructive rounded-full transform translate-x-1/2 -translate-y-1/2">
            1 {/* Example notification count */}
          </span>
          <span className="sr-only">Notifications</span>
        </Button>

        {user && !loading && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full p-0"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/40/40`} alt={user.displayName || "User"} data-ai-hint="user avatar"/>
                  <AvatarFallback>{user.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName || user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                   <p className="text-xs leading-none text-muted-foreground capitalize pt-1">
                    Role: {user.role || 'Admin'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                 {/* Link to /dashboard/settings for student, /admin/settings for admin */}
                <Link href={user.role === 'admin' ? "/admin/settings" : "/dashboard/settings"}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive hover:!text-destructive focus:text-destructive focus:bg-destructive/10">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
