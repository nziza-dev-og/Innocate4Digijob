
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth-hook";
import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, UserCircle } from "lucide-react";
// Firebase storage for image uploads is complex. We will use URL input for simplicity now.

const profileSettingsSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters.").max(50, "Display name is too long."),
  photoURL: z.string().url("Please enter a valid image URL (e.g., https://...).").optional().or(z.literal('')),
  // email: z.string().email().optional(), // Email is usually not changed by user directly here
});

type ProfileSettingsFormValues = z.infer<typeof profileSettingsSchema>;

export default function StudentSettingsPage() {
  const { toast } = useToast();
  const { user, updateUserProfile, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null); // Keep for potential future file upload impl
  const [currentPhotoURL, setCurrentPhotoURL] = useState(user?.photoURL || "");


  const form = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      displayName: "",
      photoURL: "",
    },
  });

  // Update form when user data loads or changes
  useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
      });
      setCurrentPhotoURL(user.photoURL || "");
    }
  }, [user, form]);

  // Update preview immediately when URL field changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'photoURL') {
        setCurrentPhotoURL(value.photoURL || "");
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Simulate file upload - kept for reference, but direct URL input is used now
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // This function is currently NOT used because we switched to URL input.
    // If implementing file upload later, this would handle the file selection.
    toast({ title: "File Upload Disabled", description: "Please paste an image URL instead.", variant: "destructive"});
  };

  async function onSubmit(values: ProfileSettingsFormValues) {
    if (!user) {
        toast({ title: "Error", description: "You must be logged in to update your profile.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    
    // Use the photoURL directly from the form input
    const { success, error } = await updateUserProfile(values.displayName, values.photoURL || undefined);
    setIsSubmitting(false);

    if (success) {
      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
    } else {
      toast({ title: "Update Failed", description: error?.message || "Could not update profile.", variant: "destructive" });
    }
  }

  if (authLoading && !user) {
    return <div className="container mx-auto py-8 text-center">Loading settings...</div>;
  }
  if (!user) {
     return <div className="container mx-auto py-8 text-center">Please log in to view settings.</div>;
  }


  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Profile Settings</CardTitle>
          <CardDescription>Manage your account details and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32 ring-4 ring-primary/20 ring-offset-2">
                  <AvatarImage src={currentPhotoURL || undefined} alt={user.displayName || "User"} data-ai-hint="user profile" />
                  <AvatarFallback className="text-4xl">
                    {user.displayName ? user.displayName[0].toUpperCase() : <UserCircle className="h-16 w-16" />}
                  </AvatarFallback>
                </Avatar>
                 {/* Hidden file input for potential future use */}
                 <Input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                />
              </div>
               
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
                    <FormDescription>This name will be displayed publicly.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="photoURL"
                render={({ field }) => (
                    <FormItem className="w-full">
                    <FormLabel>Profile Picture URL</FormLabel>
                    <FormControl><Input placeholder="https://example.com/your-image.png" {...field} /></FormControl>
                    <FormDescription>Enter a direct URL to your profile picture.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
               />
              
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <Input type="email" value={user.email || ""} disabled className="bg-muted/50" />
                <FormDescription>Your email address cannot be changed here.</FormDescription>
              </FormItem>

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting || authLoading}>
                {isSubmitting || authLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
