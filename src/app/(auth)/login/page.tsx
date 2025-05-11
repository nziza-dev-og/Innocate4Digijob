
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
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Asterisk, Loader2 } from "lucide-react";
import { DecorativeAuthElements } from "@/components/auth/decorative-elements";
import { useAuth } from "@/hooks/use-auth-hook";
import { useState } from "react";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signIn, loading: authLoading, error: authError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);
    const user = await signIn(values.email, values.password);
    setIsSubmitting(false);

    if (user) {
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      // Check if user is admin and redirect accordingly
      // This logic might be better in useAuth or a central place if roles are complex
      // For now, let's assume useAuth handles `isUserAdmin` update and we navigate based on that
      // or simply navigate to dashboard and let ProtectedRoute handle admin access
      router.push("/admin/dashboard"); 
    } else {
      toast({
        title: "Login Failed",
        description: authError?.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="w-full p-4 sm:p-6 bg-primary text-primary-foreground">
        <div className="container mx-auto flex items-center">
          <Asterisk className="h-6 w-6 sm:h-8 sm:w-8 mr-2" />
          <h1 className="text-xl sm:text-2xl font-semibold">Draft design school</h1>
        </div>
      </header>

      <div className="flex-grow flex flex-col md:flex-row">
        <div className="relative flex-1 hidden md:flex items-center justify-center p-4 sm:p-8 bg-background overflow-hidden">
          <DecorativeAuthElements />
        </div>

        <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-center justify-center p-6 sm:p-12 bg-background">
          <div className="w-full max-w-sm space-y-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Sign In</h2>
              <p className="text-muted-foreground text-sm">
                Enter your credentials to access your account.
              </p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} className="bg-input text-foreground placeholder:text-muted-foreground/70 h-12 text-sm px-4" />
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
                      <FormLabel className="text-xs text-muted-foreground">Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="bg-input text-foreground placeholder:text-muted-foreground/70 h-12 text-sm px-4" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-end text-sm">
                  <Link href="/forgot-password" passHref>
                    <Button variant="link" className="px-0 text-muted-foreground hover:text-accent text-xs h-auto py-0">Forgot password?</Button>
                  </Link>
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-base" disabled={isSubmitting || authLoading}>
                  {isSubmitting || authLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                </Button>
              </form>
            </Form>
            
            <Separator className="my-6 bg-border/50" />
            
            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" passHref>
                <Button variant="link" className="font-semibold text-accent hover:underline p-0 h-auto">
                  Sign up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
