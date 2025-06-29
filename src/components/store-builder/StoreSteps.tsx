
export interface StoreStep {
  id: number;
  title: string;
  subtitle: string;
  description: string; // Added missing description property
  icon: string;
}

export const storeSteps: StoreStep[] = [
  {
    id: 0,
    title: "Get Started",
    subtitle: "Welcome to store creation",
    description: "Welcome to store creation",
    icon: "🚀"
  },
  {
    id: 1,
    title: "Store Identity",
    subtitle: "Name and details",
    description: "Name and details",
    icon: "🏪"
  },
  {
    id: 2,
    title: "Store Vision",
    subtitle: "Choose your design",
    description: "Choose your design",
    icon: "🎨"
  },
  {
    id: 3,
    title: "Theme Color",
    subtitle: "Choose your color",
    description: "Choose your color",
    icon: "🎨"
  },
  {
    id: 4,
    title: "Shopify Setup",
    subtitle: "Connect your store",
    description: "Connect your store",
    icon: "🛒"
  },
  {
    id: 5,
    title: "API Config",
    subtitle: "Configure access",
    description: "Configure access",
    icon: "🔑"
  },
  {
    id: 6,
    title: "Activate Trial",
    subtitle: "Start your trial",
    description: "Start your trial",
    icon: "✨"
  },
  {
    id: 7,
    title: "Products",
    subtitle: "Add winning products",
    description: "Add winning products",
    icon: "📦"
  },
  {
    id: 8,
    title: "Launch",
    subtitle: "Launch your store",
    description: "Launch your store",
    icon: "🚀"
  },
  {
    id: 9,
    title: "Your Store is Live",
    subtitle: "Launch complete",
    description: "Launch complete",
    icon: "🎉"
  }
];
