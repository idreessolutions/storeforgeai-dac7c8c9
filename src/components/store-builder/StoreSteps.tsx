
import { 
  Store, 
  Palette, 
  ShoppingBag, 
  Settings, 
  Zap, 
  Package, 
  Users, 
  Rocket 
} from "lucide-react";

export const storeSteps = [
  {
    title: "Store Details",
    description: "Tell us about your business",
    icon: Store
  },
  {
    title: "Choose Color", 
    description: "Select theme colors",
    icon: Palette
  },
  {
    title: "Create Store",
    description: "Setup Shopify store", 
    icon: ShoppingBag
  },
  {
    title: "API Config",
    description: "Configure app access",
    icon: Settings
  },
  {
    title: "Activate Trial",
    description: "Choose your plan",
    icon: Zap
  },
  {
    title: "Products",
    description: "Add winning products",
    icon: Package
  },
  {
    title: "Mentorship",
    description: "Get 1-on-1 support", 
    icon: Users
  },
  {
    title: "Launch",
    description: "View your store",
    icon: Rocket
  }
];
