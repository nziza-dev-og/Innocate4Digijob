
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
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ArrowLeft } from "lucide-react"; // Changed Asterisk to Sparkles
import { DecorativeAuthElements } from "@/components/auth/decorative-elements";

const forgotPasswordFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    // TODO: Implement actual Firebase password reset logic
    console.log("Forgot password submitted", values);
    toast({
      title: "Password Reset Email Sent (Simulated)",
      description: "If an account exists for this email, you will receive reset instructions.",
    });
    // Example: await sendPasswordResetEmail(auth, values.email);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="w-full p-4 sm:p-6 bg-primary text-primary-foreground">
        <div className="container mx-auto flex items-center">
          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 mr-2" />
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
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Reset Password</h2>
              <p className="text-muted-foreground text-sm">
                Enter your email to receive password reset instructions.
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
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-base">
                  Send Reset Instructions
                </Button>
              </form>
            </Form>
            
            <div className="text-center mt-6">
              <Link href="/login" passHref>
                <Button variant="link" className="text-sm text-muted-foreground hover:text-primary">
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
