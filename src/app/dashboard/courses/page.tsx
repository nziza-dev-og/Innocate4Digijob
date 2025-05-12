
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function StudentCoursesPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold text-primary">My Courses</CardTitle>
          </div>
          <CardDescription>Browse available courses, enroll, and track your progress (Feature under development).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center bg-muted/30 p-10 rounded-lg">
            <BookOpen className="h-20 w-20 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Course Management Coming Soon</h3>
            <p className="text-muted-foreground">
              Explore courses, manage your enrollments, and access learning materials here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
