
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateTestimonial, GenerateTestimonialInput } from "@/ai/flows/generate-testimonial";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  projectDescription: z.string().min(10, "Project description is too short."),
  expectedOutcomes: z.string().min(10, "Expected outcomes are too short."),
  studentName: z.string().min(2, "Student name is too short."),
  role: z.string().min(2, "Role is too short."),
});

export function TestimonialGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTestimonial, setGeneratedTestimonial] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectDescription: "Innovate4DigiJob is a transformative initiative aimed at empowering students with digital skills and fostering innovation.",
      expectedOutcomes: "Increased digital literacy, more student-led startups, and solutions to community problems.",
      studentName: "Aline U.",
      role: "Student Participant",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedTestimonial(null);
    try {
      const result = await generateTestimonial(values as GenerateTestimonialInput);
      setGeneratedTestimonial(result.testimonial);
      toast({
        title: "Testimonial Generated!",
        description: "The AI has crafted a new testimonial.",
      });
    } catch (error) {
      console.error("Failed to generate testimonial:", error);
      toast({
        title: "Error",
        description: "Failed to generate testimonial. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Generate a Testimonial with AI</CardTitle>
        <CardDescription>
          Optionally, provide details below to let our AI craft a compelling testimonial.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="projectDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the Innovate4DigiJob project..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expectedOutcomes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Outcomes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What are the expected outcomes?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="studentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Student, Teacher" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full md:w-auto bg-accent hover:bg-accent/90" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Testimonial
            </Button>
          </form>
        </Form>

        {generatedTestimonial && (
          <div className="mt-8 p-6 border rounded-md bg-secondary">
            <h4 className="text-lg font-semibold text-primary mb-2">AI-Generated Testimonial:</h4>
            <blockquote className="italic text-muted-foreground">
              "{generatedTestimonial}"
            </blockquote>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
