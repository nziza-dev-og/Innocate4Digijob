
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "lucide-react"; // Using LineChart for analytics

export default function AdminAnalyticsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <LineChart className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold text-primary">Analytics Dashboard</CardTitle>
          </div>
          <CardDescription>View key metrics and performance indicators (Feature under development).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center bg-muted/30 p-10 rounded-lg">
            <LineChart className="h-20 w-20 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Data Analytics Coming Soon</h3>
            <p className="text-muted-foreground">
              This area will display charts and reports on user engagement, project progress, and other vital statistics.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
