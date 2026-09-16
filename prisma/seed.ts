import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { PLATFORM_FEATURES } from "../src/lib/platform-features";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required to seed the demo database");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
const daysFromNow = (days: number) => { const date = new Date(); date.setDate(date.getDate() + days); return date; };

async function main() {
  const demoEmails = ["demo@trailpilot.com", "hotel@trailpilot.com", "admin@trailpilot.com"];
  await prisma.agency.deleteMany({ where: { email: { in: demoEmails } } });

  await Promise.all(PLATFORM_FEATURES.map((feature) => prisma.featureFlag.upsert({ where: { key: feature.key }, update: { label: feature.label, description: feature.description, premiumOnly: feature.premiumOnly, enabled: true }, create: feature })));

  const travelAgency = await prisma.agency.create({ data: { name: "Himalayan Heights Travels", email: "demo@trailpilot.com", phone: "+91 98765 43210", address: "Mall Road", city: "Manali", plan: "PREMIUM", brandColor: "#2563eb" } });
  const hotelAgency = await prisma.agency.create({ data: { name: "Himalayan Heights Hotel", email: "hotel@trailpilot.com", phone: "+91 98765 43211", address: "The Mall", city: "Manali", plan: "PREMIUM", brandColor: "#059669" } });
  const controlAgency = await prisma.agency.create({ data: { name: "TrailPilot Product Company", email: "admin@trailpilot.com", plan: "PREMIUM", brandColor: "#4f46e5" } });

  const ownerPassword = await bcrypt.hash("Demo@12345", 10);
  const adminPassword = await bcrypt.hash("Admin@12345", 10);
  await prisma.user.createMany({ data: [
    { agencyId: travelAgency.id, name: "Ananya Kushwaha", email: "demo@trailpilot.com", passwordHash: ownerPassword, role: "AGENCY_OWNER" },
    { agencyId: travelAgency.id, name: "Neha Sharma", email: "sales@trailpilot.com", passwordHash: ownerPassword, role: "SALES_EXECUTIVE" },
    { agencyId: hotelAgency.id, name: "Hotel Partner", email: "hotelpartner@trailpilot.com", passwordHash: ownerPassword, role: "HOTEL_PARTNER" },
    { agencyId: controlAgency.id, name: "TrailPilot Admin", email: "admin@trailpilot.com", passwordHash: adminPassword, role: "SUPER_ADMIN" },
  ] });

  const [riya, aakash, neha] = await Promise.all([
    prisma.customer.create({ data: { agencyId: travelAgency.id, fullName: "Riya Sharma", phone: "+91 90000 10001", email: "riya@example.com", hotelPreference: "Deluxe room" } }),
    prisma.customer.create({ data: { agencyId: travelAgency.id, fullName: "Aakash Verma", phone: "+91 90000 10002", email: "aakash@example.com", hotelPreference: "Premium room" } }),
    prisma.customer.create({ data: { agencyId: travelAgency.id, fullName: "Neha and Family", phone: "+91 90000 10003", email: "neha@example.com", hotelPreference: "Family room" } }),
  ]);
  await prisma.lead.createMany({ data: [
    { agencyId: travelAgency.id, customerName: riya.fullName, phone: riya.phone, email: riya.email, destination: "Manali", source: "WHATSAPP", status: "WON" },
    { agencyId: travelAgency.id, customerName: aakash.fullName, phone: aakash.phone, email: aakash.email, destination: "Goa", source: "INSTAGRAM", status: "PROPOSAL_SENT" },
    { agencyId: travelAgency.id, customerName: neha.fullName, phone: neha.phone, email: neha.email, destination: "Kerala", source: "REFERRAL", status: "CONTACTED" },
  ] });
  const hotel = await prisma.vendor.create({ data: { agencyId: travelAgency.id, name: "Himalayan Heights Hotel", category: "HOTEL", contactPerson: "Front Desk", phone: "+91 98765 43211", email: "stay@himalayanheights.example", location: "Manali" } });
  const driver = await prisma.vendor.create({ data: { agencyId: travelAgency.id, name: "Mountain Drive Co.", category: "DRIVER", contactPerson: "Raj", phone: "+91 98765 43212", location: "Manali" } });
  const itinerary = await prisma.itinerary.create({ data: { agencyId: travelAgency.id, customerId: riya.id, title: "Manali Adventure Trip", destination: "Manali", numDays: 4, numNights: 3, travellerCount: 2, hotelCategory: "Deluxe", tripType: "Adventure", interests: "Mountains, cafes and local culture", status: "FINAL", days: { create: [
    { dayNumber: 1, title: "Arrival in Manali", activities: "Airport pickup, hotel check-in and Mall Road walk.", hotelStay: "Himalayan Heights Hotel", inclusions: "Breakfast and private transfer." },
    { dayNumber: 2, title: "Solang Valley", activities: "Full-day Solang Valley excursion and scenic viewpoints.", hotelStay: "Himalayan Heights Hotel", inclusions: "Breakfast and transport." },
    { dayNumber: 3, title: "Local culture", activities: "Visit Hadimba Temple, Old Manali and local cafes.", hotelStay: "Himalayan Heights Hotel", inclusions: "Breakfast and guide." },
    { dayNumber: 4, title: "Departure", activities: "Breakfast, check-out and transfer to departure point.", inclusions: "Breakfast and transfer." },
  ] } } });
  const booking = await prisma.booking.create({ data: { agencyId: travelAgency.id, customerId: riya.id, itineraryId: itinerary.id, destination: "Manali", startDate: daysFromNow(5), endDate: daysFromNow(8), packageAmount: 48000, status: "CONFIRMED", vendors: { create: [{ vendorId: hotel.id, agreedCost: 18000, notes: "Deluxe room with valley view" }, { vendorId: driver.id, agreedCost: 9000, notes: "Airport pickup and local sightseeing" }] } }, include: { vendors: true } });
  await prisma.payment.create({ data: { agencyId: travelAgency.id, bookingId: booking.id, direction: "CUSTOMER_IN", amount: 20000, method: "UPI", reference: "DEMO-UPI-001", note: "Advance received" } });
  await prisma.feedback.create({ data: { agencyId: travelAgency.id, bookingId: booking.id, customerId: riya.id, overallRating: 5, hotelRating: 5, driverRating: 4, whatWentWell: "Beautiful stay and helpful team.", wouldRecommend: true } });
  await prisma.messageTemplate.createMany({ data: [
    { agencyId: travelAgency.id, key: "BOOKING_CONFIRMED", channel: "WHATSAPP", body: "Hi {{customer_name}}, your {{trip_destination}} booking is confirmed." },
    { agencyId: travelAgency.id, key: "PAYMENT_REMINDER", channel: "EMAIL", subject: "Payment reminder for your trip", body: "Hi {{customer_name}}, this is a reminder about your pending trip payment." },
  ] });

  const hotelCustomer = await prisma.customer.create({ data: { agencyId: hotelAgency.id, fullName: "Demo Guest", phone: "+91 90000 10004", email: "guest@example.com" } });
  const hotelVendor = await prisma.vendor.create({ data: { agencyId: hotelAgency.id, name: "Himalayan Heights Hotel", category: "HOTEL", phone: "+91 98765 43211" } });
  await prisma.booking.create({ data: { agencyId: hotelAgency.id, customerId: hotelCustomer.id, destination: "Manali", startDate: daysFromNow(2), endDate: daysFromNow(5), packageAmount: 18000, status: "CONFIRMED", vendors: { create: [{ vendorId: hotelVendor.id, notes: "Family room, early check-in requested" }] } } });

  console.log("Demo database ready.");
  console.log("Agency login: demo@trailpilot.com / Demo@12345");
  console.log("Control login: admin@trailpilot.com / Admin@12345");
  console.log("Hotel login: hotelpartner@trailpilot.com / Demo@12345");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
