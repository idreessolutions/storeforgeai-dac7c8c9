
import React from "react";
import { Store, Sparkles, Palette, Package, FileText, Rocket } from "lucide-react";

export interface Step {
  id: number;
  title: string;
  icon: React.ElementType;
  description: string;
}

export const storeSteps: Step[] = [
  { id: 1, title: "Store Details", icon: Store, description: "Tell us about your business" },
  { id: 2, title: "AI Generation", icon: Sparkles, description: "AI creates your store" },
  { id: 3, title: "Branding", icon: Palette, description: "Customize your brand" },
  { id: 4, title: "Products", icon: Package, description: "Review AI-generated products" },
  { id: 5, title: "Content", icon: FileText, description: "Finalize descriptions" },
  { id: 6, title: "Launch", icon: Rocket, description: "Export to Shopify" }
];
