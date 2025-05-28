
import React from "react";
import { Store, Sparkles, Palette, Package, FileText, Rocket, Settings, ExternalLink, MessageCircle, Eye } from "lucide-react";

export interface Step {
  id: number;
  title: string;
  icon: React.ElementType;
  description: string;
}

export const storeSteps: Step[] = [
  { id: 1, title: "Store Details", icon: Store, description: "Tell us about your business" },
  { id: 2, title: "Choose Color", icon: Palette, description: "Select theme colors" },
  { id: 3, title: "Create Store", icon: Sparkles, description: "Setup Shopify store" },
  { id: 4, title: "API Config", icon: Settings, description: "Configure app access" },
  { id: 5, title: "Activate Trial", icon: ExternalLink, description: "Choose your plan" },
  { id: 6, title: "Products", icon: Package, description: "Add winning products" },
  { id: 7, title: "Mentorship", icon: MessageCircle, description: "Get 1-on-1 support" },
  { id: 8, title: "Launch", icon: Eye, description: "View your store" }
];
