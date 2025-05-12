
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function StudentTransactionsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold text-primary">My Transactions</CardTitle>
          </div>
          <CardDescription>View your payment history and manage billing details (Feature under development).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center bg-muted/30 p-10 rounded-lg">
            <CreditCard className="h-20 w-20 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">Transaction History Coming Soon</h3>
            <p className="text-muted-foreground">
              This section will display records of your course payments and other financial activities.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
