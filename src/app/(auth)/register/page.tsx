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
import { Asterisk } from "lucide-react";
import { DecorativeAuthElements } from "@/components/auth/decorative-elements";

const registerFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    console.log("Registration submitted", values);
    toast({
      title: "Registration Attempted (Simulated)",
      description: "Registration functionality is not yet implemented.",
    });
    // router.push("/login"); 
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
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-base">
                  Create Account
                </Button>
              </form>
            </Form>
            
            <Separator className="my-6 bg-border/50" />
            
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" passHref>
                <Button variant="link" className="font-semibold text-accent hover:underline p-0 h-auto">
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
