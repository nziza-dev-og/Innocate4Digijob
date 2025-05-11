
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock } from "lucide-react";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    // Placeholder for actual login logic
    console.log("Login submitted", values);
    toast({
      title: "Login Attempted",
      description: "Login functionality is not yet implemented.",
    });
    // Simulate a successful login for navigation demonstration
    // In a real app, you'd handle auth state here
    // For now, just navigate to admin dashboard as a demo
    // router.push("/admin/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Welcome Back!</CardTitle>
          <CardDescription>Sign in to access your account and continue your journey.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" /> Email
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                     <Lock className="mr-2 h-4 w-4 text-muted-foreground" /> Password
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between text-sm">
                <Link href="/forgot-password" passHref>
                  <Button variant="link" className="px-0 text-muted-foreground hover:text-primary">Forgot password?</Button>
                </Link>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Sign In
              </Button>
            </form>
          </Form>
          <Separator className="my-6" />
          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" passHref>
              <Button variant="link" className="font-semibold text-primary hover:underline p-0 h-auto">
                Sign up
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
