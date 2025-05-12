
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";

export default function StudentLiveClassPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Video className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold text-primary">Live Classes</CardTitle>
          </div>
          <CardDescription>Join scheduled live sessions and interact with instructors (Feature under development).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center bg-muted/30 p-10 rounded-lg">
            <Video className="h-20 w-20 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Live Class Feature Coming Soon</h3>
            <p className="text-muted-foreground">
              This section will allow you to join real-time online classes and workshops.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
