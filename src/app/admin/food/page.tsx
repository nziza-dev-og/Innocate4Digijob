
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat } from "lucide-react"; // Lucide's ChefHat for food/kitchen

export default function AdminFoodPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold text-primary">Food & Menu Management</CardTitle>
          </div>
          <CardDescription>Manage school canteen menus, orders, and inventory (Feature under development).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center bg-muted/30 p-10 rounded-lg">
            <ChefHat className="h-20 w-20 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Food Management System Coming Soon</h3>
            <p className="text-muted-foreground">
              This module will help in planning menus, managing canteen supplies, and possibly handling meal orders.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
