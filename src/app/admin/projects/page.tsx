
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export default function AdminProjectsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold text-primary">Project Management</CardTitle>
          </div>
          <CardDescription>Manage ongoing and completed projects (Feature under development).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center bg-muted/30 p-10 rounded-lg">
            <Briefcase className="h-20 w-20 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Project Tracking Coming Soon</h3>
            <p className="text-muted-foreground">
              This section will allow for detailed project oversight, task assignments, and progress monitoring.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
