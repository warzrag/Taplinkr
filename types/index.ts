import type {
  User,
  Link,
  Click,
  Subscription,
  Payment,
  Alert,
  Notification,
} from "@prisma/client"; 


// Types de base depuis Prisma
export type { User, Link, Click, Subscription, Payment, Alert, Notification };

// Types étendus pour l'application
export interface LinkWithDetails extends Link {
  _count?: {
    clicksDetails: number;
  };
  user?: {
    name: string | null;
    email: string;
  };
  clicksDetails?: Click[];
}

export interface UserWithDetails extends User {
  _count?: {
    links: number;
    subscriptions: number;
  };
  subscriptions?: Subscription[];
}

// Types pour la customisation des liens
export interface LinkCustomization {
  backgroundColor?: string;
  textColor?: string;
  logoUrl?: string;
  title?: string;
  description?: string;
  theme?: "light" | "dark" | "gradient";
  buttonStyle?: "rounded" | "square" | "pill";
  fonts?: {
    heading?: string;
    body?: string;
  };
}

// Types pour l'analytics
export interface AnalyticsData {
  totalClicks: number;
  uniqueLinks: number;
  topCountries: Array<{
    name: string;
    count: number;
  }>;
  clicksByDay: Array<{
    date: string;
    clicks: number;
  }>;
  clicksByHour: Array<{
    hour: number;
    clicks: number;
  }>;
  deviceStats: Array<{
    device: string;
    count: number;
  }>;
  browserStats: Array<{
    browser: string;
    count: number;
  }>;
  recentClicks: Array<{
    id: string;
    linkTitle: string;
    timestamp: string;
    country?: string;
    device?: string;
  }>;
}

// Types pour les plans
export type PlanType = "FREE" | "PRO" | "ENTERPRISE";

export interface PlanLimits {
  maxLinks: number;
  maxClicks: number;
  customDomains: boolean;
  analytics: boolean;
  customization: boolean;
  api: boolean;
}

export interface PlanInfo {
  name: string;
  price: number;
  priceId: string | null;
  features: string[];
  limits: PlanLimits;
}

// Types pour les limites d'usage
export interface UsageLimits {
  canCreateLink: boolean;
  canReceiveClicks: boolean;
  usage: {
    links: {
      current: number;
      limit: number;
      percentage: number;
    };
    clicks: {
      current: number;
      limit: number;
      percentage: number;
    };
  };
  plan: {
    type: PlanType;
    name: string;
    features: string[];
  };
}

// Types pour les composants
export interface LinkFormData {
  title: string;
  url: string;
  isDirect: boolean;
}

export interface ProtectedLandingPageProps {
  link: {
    id: string;
    title: string | null;
    url: string;
    shortCode: string;
    isDirect?: boolean;
  };
  encodedData: string;
}

export interface CustomLandingPageProps {
  link: LinkWithDetails;
}

// Types pour les erreurs API
export interface ApiError {
  error: string;
  code?: string;
  usage?: UsageLimits["usage"];
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success?: boolean;
}

// Types pour les webhooks Stripe
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

// Types pour les métadonnées
export interface NotificationMetadata {
  linkId?: string;
  alertId?: string;
  action?: string;
  [key: string]: any;
}

// Types pour la session Next-Auth étendue
export interface ExtendedUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }

  interface User {
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
  }
}
