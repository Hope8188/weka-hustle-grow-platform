import { feature, product, priceItem, featureItem } from "atmn";

// Customer Records Tracking
export const customerRecords = feature({
  id: "customer_records",
  name: "Customer Records",
  type: "continuous_use",
});

// Marketplace Access
export const marketplaceAccess = feature({
  id: "marketplace_access",
  name: "Marketplace Access",
  type: "boolean",
});

// Basic M-Pesa Tracking
export const basicMpesa = feature({
  id: "basic_mpesa",
  name: "Basic M-Pesa Tracking",
  type: "boolean",
});

// SMS Notifications
export const smsNotifications = feature({
  id: "sms_notifications",
  name: "SMS Notifications",
  type: "boolean",
});

// Mobile App Access
export const mobileApp = feature({
  id: "mobile_app",
  name: "Mobile App Access",
  type: "boolean",
});

// Advanced M-Pesa Features
export const advancedMpesa = feature({
  id: "advanced_mpesa",
  name: "Advanced M-Pesa Analytics",
  type: "boolean",
});

// WhatsApp Automation
export const whatsappAutomation = feature({
  id: "whatsapp_automation",
  name: "WhatsApp Business Integration",
  type: "boolean",
});

// Priority Customer Matching
export const priorityMatching = feature({
  id: "priority_matching",
  name: "Priority Customer Matching",
  type: "boolean",
});

// Business Analytics
export const businessAnalytics = feature({
  id: "business_analytics",
  name: "Business Analytics Dashboard",
  type: "boolean",
});

// Priority Support
export const prioritySupport = feature({
  id: "priority_support",
  name: "Priority Support",
  type: "boolean",
});

// Staff/Team Members
export const teamMembers = feature({
  id: "team_members",
  name: "Team Members",
  type: "continuous_use",
});

// Multi-location Management
export const multiLocation = feature({
  id: "multi_location",
  name: "Multi-location Management",
  type: "boolean",
});

// Advanced Reports
export const advancedReports = feature({
  id: "advanced_reports",
  name: "Advanced Reports & Exports",
  type: "boolean",
});

// API Access
export const apiAccess = feature({
  id: "api_access",
  name: "API Access",
  type: "boolean",
});

// Dedicated Account Manager
export const dedicatedManager = feature({
  id: "dedicated_manager",
  name: "Dedicated Account Manager",
  type: "boolean",
});

// FREE STARTER PLAN
export const starter = product({
  id: "starter",
  name: "Starter Plan",
  is_default: true,
  items: [
    featureItem({
      feature_id: customerRecords.id,
      included_usage: 50,
    }),
    featureItem({
      feature_id: marketplaceAccess.id,
    }),
    featureItem({
      feature_id: basicMpesa.id,
    }),
    featureItem({
      feature_id: smsNotifications.id,
    }),
    featureItem({
      feature_id: mobileApp.id,
    }),
  ],
});

// HUSTLER PRO PLAN
export const hustlerPro = product({
  id: "hustler-pro",
  name: "Hustler Pro Plan",
  items: [
    priceItem({
      price: 500,
      interval: "month",
      currency: "KES",
    }),
    featureItem({
      feature_id: customerRecords.id,
      included_usage: -1, // unlimited
    }),
    featureItem({
      feature_id: marketplaceAccess.id,
    }),
    featureItem({
      feature_id: advancedMpesa.id,
    }),
    featureItem({
      feature_id: whatsappAutomation.id,
    }),
    featureItem({
      feature_id: priorityMatching.id,
    }),
    featureItem({
      feature_id: businessAnalytics.id,
    }),
    featureItem({
      feature_id: prioritySupport.id,
    }),
    featureItem({
      feature_id: mobileApp.id,
    }),
  ],
});

// BUSINESS PLAN
export const business = product({
  id: "business",
  name: "Business Plan",
  items: [
    priceItem({
      price: 1500,
      interval: "month",
      currency: "KES",
    }),
    featureItem({
      feature_id: customerRecords.id,
      included_usage: -1, // unlimited
    }),
    featureItem({
      feature_id: marketplaceAccess.id,
    }),
    featureItem({
      feature_id: advancedMpesa.id,
    }),
    featureItem({
      feature_id: whatsappAutomation.id,
    }),
    featureItem({
      feature_id: priorityMatching.id,
    }),
    featureItem({
      feature_id: businessAnalytics.id,
    }),
    featureItem({
      feature_id: teamMembers.id,
      included_usage: 5,
    }),
    featureItem({
      feature_id: multiLocation.id,
    }),
    featureItem({
      feature_id: advancedReports.id,
    }),
    featureItem({
      feature_id: apiAccess.id,
    }),
    featureItem({
      feature_id: dedicatedManager.id,
    }),
    featureItem({
      feature_id: mobileApp.id,
    }),
  ],
});