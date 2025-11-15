"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MessageSquare, ShieldCheck, Zap, BrainCircuit, Users, ChevronRight, Menu, X } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <header className="px-4 lg:px-6 h-14 flex items-center sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Image src="/media/logo.jpg" alt="Logo" width={40} height={40} className="rounded-full" />
          <span className="sr-only">Neutral Chat</span>
        </Link>
        <nav className="ml-auto hidden gap-4 sm:gap-6 lg:flex">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            How It Works
          </Link>
          <Link href="#testimonials" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Testimonials
          </Link>
          <Link href="#faq" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            FAQ
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
             <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </div>
        <div className="ml-4 hidden lg:flex items-center gap-2">
           <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b shadow-lg lg:hidden">
            <nav className="flex flex-col p-4">
              <Link 
                href="#features" 
                className="px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md" 
                prefetch={false}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="#how-it-works" 
                className="px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md" 
                prefetch={false}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link 
                href="#testimonials" 
                className="px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md" 
                prefetch={false}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Testimonials
              </Link>
              <Link 
                href="#faq" 
                className="px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md" 
                prefetch={false}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <div className="flex flex-col gap-2 mt-4 border-t pt-4">
                <Button asChild variant="outline">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="absolute top-0 left-0 -z-10 h-full w-full bg-background">
            <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(100,100,200,0.1),rgba(255,255,255,0))]"></div>
            <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(100,200,100,0.1),rgba(255,255,255,0))]"></div>
          </div>
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Discover Clarity with Neutral AI
                  </h1>
                  <p className="text-lg text-muted-foreground md:text-xl max-w-[600px] mx-auto lg:mx-0">
                    Our platform offers a space for calm, intelligent dialogue, free from emotional bias, helping you find neutral solutions with a thoughtful philosophy.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/signup">Get Started For Free <ChevronRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                    <Link href="/login">Explore as Guest</Link>
                  </Button>
                </div>
              </div>
              <Image
                src="/media/home_page_hero.svg"
                width={600}
                height={400}
                alt="Hero"
                priority
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover w-full max-w-[400px] lg:max-w-none lg:order-last shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Why Choose Neutral Chat?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover the powerful features that make our platform the ideal choice for balanced and insightful conversations.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4 text-center bg-card/50 p-6 rounded-lg backdrop-blur-sm">
                <div className="flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                        <MessageSquare className="h-7 w-7" />
                    </div>
                </div>
                <h3 className="text-xl font-bold">Unbiased Conversations</h3>
                <p className="text-muted-foreground">
                  Our AI facilitates discussions with a neutral tone, focusing on facts and logic over emotion.
                </p>
              </div>
               <div className="flex flex-col justify-center space-y-4 text-center bg-card/50 p-6 rounded-lg backdrop-blur-sm">
                <div className="flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                        <BrainCircuit className="h-7 w-7" />
                    </div>
                </div>
                <h3 className="text-xl font-bold">Intelligent Assistance</h3>
                <p className="text-muted-foreground">
                  Leverage advanced AI to explore topics, get summaries, and find information quickly and efficiently.
                </p>
              </div>
               <div className="flex flex-col justify-center space-y-4 text-center bg-card/50 p-6 rounded-lg backdrop-blur-sm">
                <div className="flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                        <ShieldCheck className="h-7 w-7" />
                    </div>
                </div>
                <h3 className="text-xl font-bold">Secure & Private</h3>
                <p className="text-muted-foreground">
                  Your conversations are yours alone. We prioritize your privacy with robust security measures.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
             <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">A Simple Path to Clarity</h2>
                <p className="text-lg max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Getting started with Neutral Chat is easy. Follow these simple steps to begin your journey towards more balanced conversations.
                </p>
              </div>
            </div>
            <div className="mx-auto grid gap-8 sm:gap-12 md:grid-cols-3 pt-12">
                <div className="flex flex-col items-center text-center bg-card/50 p-6 rounded-lg backdrop-blur-sm">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold shadow-lg">1</div>
                    <h3 className="mb-3 text-xl font-bold">Sign Up</h3>
                    <p className="text-muted-foreground">Create your free account in just a few seconds to get started.</p>
                </div>
                 <div className="flex flex-col items-center text-center bg-card/50 p-6 rounded-lg backdrop-blur-sm">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold shadow-lg">2</div>
                    <h3 className="mb-3 text-xl font-bold">Start Chatting</h3>
                    <p className="text-muted-foreground">Ask questions, explore ideas, or discuss topics with our neutral AI assistant.</p>
                </div>
                 <div className="flex flex-col items-center text-center bg-card/50 p-6 rounded-lg backdrop-blur-sm">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold shadow-lg">3</div>
                    <h3 className="mb-3 text-xl font-bold">Find Balance</h3>
                    <p className="text-muted-foreground">Gain new perspectives and find balanced insights on any subject.</p>
                </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">What Our Users Say</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Hear from people who have transformed their discussions and found clarity with Neutral Chat.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 pt-8 px-4 sm:px-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                <div className="rounded-xl border bg-card p-6 text-left shadow-lg hover:shadow-xl transition-shadow">
                    <p className="text-muted-foreground text-base sm:text-lg">"Neutral Chat has completely changed how I approach complex topics. The AI's unbiased stance helps me see all sides of an issue."</p>
                    <div className="mt-4 font-semibold">Alex J.</div>
                    <div className="text-sm text-muted-foreground">Researcher</div>
                </div>
                 <div className="rounded-xl border bg-card p-6 text-left shadow-lg hover:shadow-xl transition-shadow">
                    <p className="text-muted-foreground text-base sm:text-lg">"A fantastic tool for brainstorming and getting a logical, fact-based perspective without any emotional noise. Highly recommended!"</p>
                    <div className="mt-4 font-semibold">Maria S.</div>
                    <div className="text-sm text-muted-foreground">Product Manager</div>
                </div>
                 <div className="rounded-xl border bg-card p-6 text-left shadow-lg hover:shadow-xl transition-shadow">
                    <p className="text-muted-foreground text-base sm:text-lg">"I use it daily to get quick, unbiased summaries of news and events. It's an indispensable part of my workflow now."</p>
                    <div className="mt-4 font-semibold">David L.</div>
                    <div className="text-sm text-muted-foreground">Journalist</div>
                </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section id="faq" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container max-w-4xl px-4 md:px-6">
             <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">Frequently Asked Questions</h2>
                <p className="text-lg max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Have questions? We've got answers.
                </p>
              </div>
            </div>
            <Accordion type="single" collapsible className="w-full mt-8">
              <AccordionItem value="item-1">
                <AccordionTrigger>Is Neutral Chat free to use?</AccordionTrigger>
                <AccordionContent>
                  Yes, Neutral Chat offers a generous free plan that allows you to experience the core features of our platform. We also have premium plans for users who need more advanced capabilities.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How does the AI remain neutral?</AccordionTrigger>
                <AccordionContent>
                  Our AI is built on a foundation of large language models that have been specifically trained and fine-tuned to avoid expressing personal opinions or biases. It focuses on presenting information from multiple viewpoints and sticking to factual data.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is my data secure?</AccordionTrigger>
                <AccordionContent>
                  Absolutely. We take data privacy and security very seriously. All conversations are encrypted, and we have strict policies in place to ensure your information is never shared or used improperly.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container grid items-center justify-center gap-6 px-4 text-center md:px-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">Ready to Find Your Calm?</h2>
              <p className="mx-auto max-w-[600px] text-lg text-muted-foreground md:text-xl">
                Join thousands of users who are transforming their approach to problem-solving and discussion.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-3">
               <Button asChild size="lg" className="w-full">
                <Link href="/signup">Sign Up Now</Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Start your journey towards clearer thinking.
                <Link href="#" className="underline underline-offset-2 ml-1 hover:text-primary" prefetch={false}>
                  Terms of Service
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Neutral Chat. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy Policy
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Contact Us
          </Link>
        </nav>
      </footer>
    </div>
  );
}
