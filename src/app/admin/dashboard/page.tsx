
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Settings, BarChart3 } from "lucide-react";
import Link from "next/link";

const quickStats = [
  { title: "Total Users", value: "1,234", icon: Users, color: "text-blue-500", href: "/admin/users" },
  { title: "Active Projects", value: "56", icon: Activity, color: "text-green-500", href: "#" },
  { title: "Pending Approvals", value: "12", icon: Settings, color: "text-yellow-500", href: "#" },
  { title: "Site Visits (Last 7 Days)", value: "10,789", icon: BarChart3, color: "text-purple-500", href: "#" },
];

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Admin Dashboard</CardTitle>
          <CardDescription>Overview of your application&apos;s status and activities.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Link href={stat.href} key={stat.title} passHref>
            <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">View Details</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>A log of recent important events.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for recent activity feed */}
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>User 'john.doe@example.com' logged in.</li>
              <li>New project 'Community App' submitted for review.</li>
              <li>Settings updated by admin.</li>
              <li>User 'jane.smith@example.com' registered.</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Navigate to common admin tasks.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link href="/admin/users" passHref><Card className="p-4 text-center hover:bg-accent/10 transition-colors"><Users className="mx-auto mb-2 h-8 w-8 text-primary" />Manage Users</Card></Link>
            <Link href="#" passHref><Card className="p-4 text-center hover:bg-accent/10 transition-colors"><Activity className="mx-auto mb-2 h-8 w-8 text-primary" />View Projects</Card></Link>
            <Link href="/admin/settings" passHref><Card className="p-4 text-center hover:bg-accent/10 transition-colors"><Settings className="mx-auto mb-2 h-8 w-8 text-primary" />System Settings</Card></Link>
            <Link href="#" passHref><Card className="p-4 text-center hover:bg-accent/10 transition-colors"><BarChart3 className="mx-auto mb-2 h-8 w-8 text-primary" />Analytics</Card></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
