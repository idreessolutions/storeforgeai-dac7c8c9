
export interface StoreStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

export const storeSteps: StoreStep[] = [
  {
    id: 1,
    title: "Create Your Dream Store",
    subtitle: "Name and details",
    description: "Store setup",
    icon: "✨"
  },
  {
    id: 2,
    title: "Store Identity",
    subtitle: "Choose your color",
    description: "Choose your color",
    icon: "🎨"
  },
  {
    id: 3,
    title: "Shopify Setup",
    subtitle: "Connect your store",
    description: "Connect your store",
    icon: "🛒"
  },
  {
    id: 4,
    title: "API Config",
    subtitle: "Configure access",
    description: "Configure access",
    icon: "🔑"
  },
  {
    id: 5,
    title: "Activate Trial",
    subtitle: "Start your trial",
    description: "Start your trial",
    icon: "⚡"
  },
  {
    id: 6,
    title: "Products",
    subtitle: "Add winning products",
    description: "Add winning products",
    icon: "📦"
  },
  {
    id: 7,
    title: "Mentorship",
    subtitle: "1-on-1 guidance",
    description: "Get expert help",
    icon: "👨‍🏫"
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
