
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Palette, Bell, Shield, Mail } from "lucide-react";

const generalSettingsSchema = z.object({
  siteName: z.string().min(3, "Site name must be at least 3 characters."),
  siteUrl: z.string().url("Please enter a valid URL."),
  adminEmail: z.string().email("Please enter a valid admin email."),
  maintenanceMode: z.boolean().default(false),
});

const appearanceSettingsSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code."),
  logoUrl: z.string().url("Please enter a valid URL for the logo.").optional().or(z.literal('')),
  faviconUrl: z.string().url("Please enter a valid URL for the favicon.").optional().or(z.literal('')),
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  newUserRegistration: z.boolean().default(true),
  projectSubmissions: z.boolean().default(true),
});


export default function AdminSettingsPage() {
  const { toast } = useToast();

  const generalForm = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteName: "DigiSpark",
      siteUrl: "https://example.com", // Replace with actual site URL
      adminEmail: "admin@example.com",
      maintenanceMode: false,
    },
  });

  const appearanceForm = useForm<z.infer<typeof appearanceSettingsSchema>>({
    resolver: zodResolver(appearanceSettingsSchema),
    defaultValues: {
      primaryColor: "#007BFF", // Default blue from theme
      logoUrl: "",
      faviconUrl: "",
    },
  });
  
  const notificationForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      newUserRegistration: true,
      projectSubmissions: true,
    },
  });


  function onGeneralSubmit(values: z.infer<typeof generalSettingsSchema>) {
    console.log("General settings submitted", values);
    toast({ title: "General Settings Saved", description: "Your changes have been successfully saved." });
  }

  function onAppearanceSubmit(values: z.infer<typeof appearanceSettingsSchema>) {
    console.log("Appearance settings submitted", values);
    toast({ title: "Appearance Settings Saved", description: "Your changes have been successfully saved." });
  }
  
  function onNotificationsSubmit(values: z.infer<typeof notificationSettingsSchema>) {
    console.log("Notification settings submitted", values);
    toast({ title: "Notification Settings Saved", description: "Your changes have been successfully saved." });
  }


  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">System Settings</CardTitle>
          <CardDescription>Configure various aspects of the application.</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-6">
          <TabsTrigger value="general"><Globe className="mr-2 h-4 w-4" />General</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" />Appearance</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />Notifications</TabsTrigger>
          <TabsTrigger value="security" disabled><Shield className="mr-2 h-4 w-4" />Security (Soon)</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic site configuration.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-6">
                  <FormField control={generalForm.control} name="siteName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={generalForm.control} name="siteUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site URL</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={generalForm.control} name="adminEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Administrator Email</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                       <FormDescription>This email is used for administrative notifications.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={generalForm.control} name="maintenanceMode" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Maintenance Mode</FormLabel>
                        <FormDescription>Temporarily disable public access to the site.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  <Button type="submit">Save General Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of your site.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...appearanceForm}>
                <form onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)} className="space-y-6">
                  <FormField control={appearanceForm.control} name="primaryColor" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <FormControl><Input type="color" {...field} className="p-1 h-10 w-16 block" /></FormControl>
                      <FormDescription>Set the main theme color (e.g., #007BFF).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={appearanceForm.control} name="logoUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl><Input placeholder="https://example.com/logo.png" {...field} /></FormControl>
                       <FormDescription>URL for the site logo. Leave blank to use default.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={appearanceForm.control} name="faviconUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Favicon URL</FormLabel>
                      <FormControl><Input placeholder="https://example.com/favicon.ico" {...field} /></FormControl>
                      <FormDescription>URL for the site favicon. Leave blank to use default.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit">Save Appearance Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Manage email notifications sent by the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...notificationForm}>
                        <form onSubmit={notificationForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                            <FormField control={notificationForm.control} name="emailNotifications" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel>Enable Email Notifications</FormLabel>
                                        <FormDescription>Globally enable or disable all email notifications.</FormDescription>
                                    </div>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )} />
                            <FormField control={notificationForm.control} name="newUserRegistration" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel>New User Registration Emails</FormLabel>
                                        <FormDescription>Send welcome emails to new users and notify admins.</FormDescription>
                                    </div>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={!notificationForm.getValues("emailNotifications")} /></FormControl>
                                </FormItem>
                            )} />
                            <FormField control={notificationForm.control} name="projectSubmissions" render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel>Project Submission Notifications</FormLabel>
                                        <FormDescription>Notify relevant parties about new project submissions or status changes.</FormDescription>
                                    </div>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={!notificationForm.getValues("emailNotifications")} /></FormControl>
                                </FormItem>
                            )} />
                            <Button type="submit">Save Notification Settings</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security parameters for your application. (Coming Soon)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Security settings will be available in a future update. This may include options for two-factor authentication, password policies, and API key management.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
