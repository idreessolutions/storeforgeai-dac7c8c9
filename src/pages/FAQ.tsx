import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, ChevronDown, ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Do I need Shopify for this to work?",
      answer: "Yes. StoreForge AI connects directly to your Shopify store so we can upload products instantly."
    },
    {
      question: "Is StoreForge AI beginner friendly?",
      answer: "100%. You don't need any experience — just choose a niche and click start."
    },
    {
      question: "What niches can I build stores for?",
      answer: "10 niches including Pets, Beauty, Home, Kitchen, Kids, Fashion, Tech, Fitness, Gadgets, and Seasonal products."
    },
    {
      question: "How long does it take to generate a store?",
      answer: "Most users launch in under 10 minutes."
    },
    {
      question: "Will StoreForge AI pick real winning products?",
      answer: "Yes. We analyze trending products on TikTok, Amazon, AliExpress, viral stores, and social data."
    },
    {
      question: "Do you write the product descriptions?",
      answer: "Yes — SEO titles, benefits, bullet points, emotional storytelling, pricing, and upsells."
    },
    {
      question: "Can I edit the products after import?",
      answer: "Of course. Everything is fully customizable in Shopify."
    },
    {
      question: "Is there a refund policy?",
      answer: "Starter plan is free. Pro plan will offer a guarantee when released."
    },
    {
      question: "What languages does this work in?",
      answer: "English for now — more languages coming soon."
    },
    {
      question: "Can I request a new niche?",
      answer: "Yes — send us a request through support."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-4 py-3 lg:px-6 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <Store className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            StoreForge AI
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
          <Link to="/about" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">About</Link>
          <Link to="/pricing" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Pricing</Link>
          <Link to="/faq" className="text-sm font-medium text-blue-600">FAQ</Link>
          <Link to="/contact" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Contact</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12 lg:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          <p className="text-xl text-gray-700">
            Everything you need to know about StoreForge AI
          </p>
        </div>

        {/* FAQ Accordion */}
        <Card className="mb-8 border-2 border-purple-100 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left hover:text-purple-600 transition-colors">
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Still Have Questions Card */}
        <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Still have questions?</h2>
            <p className="text-gray-700 mb-6">
              Our support team is here to help you get started.
            </p>
            <Link to="/contact">
              <Button 
                variant="outline"
                className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                Contact Support
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to="/">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg px-8 py-6 shadow-xl transform hover:scale-105 transition-all"
            >
              Start Your Free Store Build
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
