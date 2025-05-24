
import React from "react";
import { Store, Sparkles, Palette, Package, FileText, Rocket, Settings, ExternalLink } from "lucide-react";

export interface Step {
  id: number;
  title: string;
  icon: React.ElementType;
  description: string;
}

export const storeSteps: Step[] = [
  { id: 1, title: "Store Details", icon: Store, description: "Tell us about your business" },
  { id: 2, title: "Create Store", icon: Sparkles, description: "Setup Shopify store" },
  { id: 3, title: "API Config", icon: Settings, description: "Configure app access" },
  { id: 4, title: "Choose Color", icon: Palette, description: "Select theme colors" },
  { id: 5, title: "Products", icon: Package, description: "Add your products" },
  { id: 6, title: "Content", icon: FileText, description: "Customize content" },
  { id: 7, title: "Launch", icon: Rocket, description: "Go live with your store" }
];
