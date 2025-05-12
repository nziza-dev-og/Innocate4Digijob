
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Asterisk, Loader2, ShieldAlert, Sparkles } from "lucide-react"; // Import Sparkles
import { DecorativeAuthElements } from "@/components/auth/decorative-elements";
import { useAuth } from "@/hooks/use-auth-hook";
import { useState } from "react";

// Get secret code from environment variable
const ADMIN_SECRET_CODE = process.env.NEXT_PUBLIC_ADMIN_SECRET_CODE; 

const registerFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  adminSecretCode: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signUp, loading: authLoading } = useAuth(); 
  const [isSubmitting, setIsSubmitting] = useState(false);

   if (!ADMIN_SECRET_CODE) {
    console.warn("Admin secret code environment variable (NEXT_PUBLIC_ADMIN_SECRET_CODE) is not set.");
   }

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      adminSecretCode: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true);
    let role = "user";
    if (values.adminSecretCode) {
      if (ADMIN_SECRET_CODE && values.adminSecretCode === ADMIN_SECRET_CODE) {
        role = "admin";
      } else {
        toast({
          title: "Invalid Admin Code",
          description: "The admin secret code is incorrect. Proceeding with user registration.",
          variant: "destructive",
        });
        // Current logic: registers as user if code is wrong or env var missing.
      }
    }

    const { user, error } = await signUp(values.email, values.password, values.fullName, role);
    setIsSubmitting(false);

    if (user) {
      toast({
        title: "Registration Successful",
        description: `Your account has been created as a ${role}. Please login.`,
      });
      router.push("/login"); 
    } else {
       toast({
        title: "Registration Failed",
        description: error?.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="w-full p-4 sm:p-6 bg-primary text-primary-foreground">
        <div className="container mx-auto flex items-center">
          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 mr-2" /> {/* Changed Asterisk to Sparkles */}
          <h1 className="text-xl sm:text-2xl font-semibold">DigiSpark</h1>
        </div>
      </header>

      <div className="flex-grow flex flex-col md:flex-row">
        <div className="relative flex-1 hidden md:flex items-center justify-center p-4 sm:p-8 bg-background overflow-hidden">
          <DecorativeAuthElements />
        </div>

        <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-center justify-center p-6 sm:p-12 bg-background">
          <div className="w-full max-w-sm space-y-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Create Account</h2>
              <p className="text-muted-foreground text-sm">
                Join our community by creating a new account.
              </p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} className="bg-input text-foreground placeholder:text-muted-foreground/70 h-12 text-sm px-4" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="bg-input text-foreground placeholder:text-muted-foreground/70 h-12 text-sm px-4" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {ADMIN_SECRET_CODE && ( // Only show field if secret code is set in env
                    <FormField
                    control={form.control}
                    name="adminSecretCode"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-xs text-muted-foreground flex items-center">
                            Admin Secret Code <ShieldAlert className="ml-1 h-3 w-3 text-yellow-500" />
                        </FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="Optional" {...field} className="bg-input text-foreground placeholder:text-muted-foreground/70 h-12 text-sm px-4" />
                        </FormControl>
                        <FormDescription className="text-xs">
                            Enter this code only if you are an administrator.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 )}
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-base" disabled={isSubmitting || authLoading}>
                  {isSubmitting || authLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                </Button>
              </form>
            </Form>
            
            <Separator className="my-6 bg-border/50" />
            
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" passHref>
                <Button variant="link" className="font-semibold text-primary hover:underline p-0 h-auto">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
