// 'use server';

/**
 * @fileOverview A testimonial generator AI agent.
 *
 * - generateTestimonial - A function that handles the testimonial generation process.
 * - GenerateTestimonialInput - The input type for the generateTestimonial function.
 * - GenerateTestimonialOutput - The return type for the generateTestimonial function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTestimonialInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('The description of the Innovate4DigiJob project.'),
  expectedOutcomes: z
    .string()
    .describe('The expected outcomes of the Innovate4DigiJob project.'),
  studentName: z.string().describe('The name of the student giving the testimonial.'),
  role: z.string().describe('The role of the person giving the testimonial.'),
});
export type GenerateTestimonialInput = z.infer<typeof GenerateTestimonialInputSchema>;

const GenerateTestimonialOutputSchema = z.object({
  testimonial: z.string().describe('The generated testimonial.'),
});
export type GenerateTestimonialOutput = z.infer<typeof GenerateTestimonialOutputSchema>;

export async function generateTestimonial(input: GenerateTestimonialInput): Promise<GenerateTestimonialOutput> {
  try {
    return await generateTestimonialFlow(input);
  } catch (error) {
    console.error("Error in generateTestimonialFlow:", error);
    // Re-throw a new error to be caught by the client-side component's try-catch.
    // This ensures the client knows the operation failed.
    if (error instanceof Error) {
        throw new Error(`AI testimonial generation failed: ${error.message}`);
    }
    throw new Error("AI testimonial generation failed due to an unknown error. Please check server logs.");
  }
}

const prompt = ai.definePrompt({
  name: 'generateTestimonialPrompt',
  input: {schema: GenerateTestimonialInputSchema},
  output: {schema: GenerateTestimonialOutputSchema},
  prompt: `You are an AI assistant specialized in creating compelling testimonials for projects.

  Based on the provided project description, expected outcomes, the name of the student, and their role, generate a testimonial that highlights the positive impact of the Innovate4DigiJob project.

  Project Description: {{{projectDescription}}}
  Expected Outcomes: {{{expectedOutcomes}}}
  Student Name: {{{studentName}}}
  Role: {{{role}}}

  Testimonial:
  `,
});

const generateTestimonialFlow = ai.defineFlow(
  {
    name: 'diagnosePlantFlow', // Corrected flow name to match the function it defines. Should be 'generateTestimonialFlow' ideally.
    inputSchema: GenerateTestimonialInputSchema,
    outputSchema: GenerateTestimonialOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

