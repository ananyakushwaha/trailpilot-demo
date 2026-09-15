export const PLATFORM_FEATURES = [
  { key: "LEADS", label: "Lead management", description: "Capture, assign and follow up with leads.", premiumOnly: false },
  { key: "CUSTOMERS", label: "Customer CRM", description: "Customer profiles, history and notes.", premiumOnly: false },
  { key: "ITINERARIES", label: "Itinerary builder", description: "Create and share travel itineraries.", premiumOnly: false },
  { key: "BOOKINGS", label: "Bookings and payments", description: "Manage reservations, balances and receipts.", premiumOnly: false },
  { key: "VENDORS", label: "Vendor operations", description: "Manage hotels, drivers and activity partners.", premiumOnly: false },
  { key: "ANALYTICS", label: "Analytics dashboard", description: "Circular graphs, revenue and lead-source reporting.", premiumOnly: true },
  { key: "AI_ITINERARY", label: "AI itinerary drafting", description: "Generate itinerary drafts with AI.", premiumOnly: true },
  { key: "AI_ASSISTANT", label: "AI help assistant", description: "Ask questions about TrailPilot and your workflow.", premiumOnly: false },
  { key: "WHATSAPP", label: "WhatsApp automation", description: "Send automated customer messages through WhatsApp.", premiumOnly: true },
  { key: "EXPORTS", label: "Print and Excel exports", description: "Download operational reports and documents.", premiumOnly: false },
  { key: "HOTEL_OS", label: "Hotel OS dashboard", description: "Hotel arrivals, guest information and partner operations.", premiumOnly: false },
] as const;

export type PlatformFeatureKey = (typeof PLATFORM_FEATURES)[number]["key"];
