# TrailPilot User Manual

TrailPilot is a travel CRM and Hotel OS platform. It has two areas:

- **Agency workspace:** leads, customers, itineraries, bookings, vendors, payments, messaging, reports and team settings.
- **Product Control Panel:** platform owner controls for services, feature access, Premium plans and manual UPI approvals.

## 1. First-time setup

1. Upload the complete project to GitHub and commit to the `main` branch.
2. Connect the GitHub repository to Vercel.
3. Keep the Vercel Root Directory blank when the project files are at the repository root.
4. Add the required Vercel environment variables.
5. Deploy the project.
6. Run the demo seed once against the Neon database if demo data is required:

```text
npm run db:seed
```

The seed creates sample businesses, users, leads, customers, bookings, vendors, an itinerary, payments, feedback and feature flags.

## 2. Login areas

The login page has two buttons.

### Agency Owner

Use this for a travel business owner or team member. The agency workspace contains:

- Dashboard
- Leads
- Customers
- Itineraries
- Bookings
- Vendors
- Analytics
- Agency Settings
- FAQs and AI Help

### Product Control Panel

Use this only for the TrailPilot product company owner. The account must have the `SUPER_ADMIN` role. After login, the separate control-panel password is required.

## 3. Demo accounts

These accounts are created by `npm run db:seed`:

| Area | Email | Password |
|---|---|---|
| Agency Owner | `demo@trailpilot.com` | `Demo@12345` |
| Product Control Panel | `admin@trailpilot.com` | `Admin@12345` |
| Hotel OS demo | `hotelpartner@trailpilot.com` | `Demo@12345` |

The Product Control Panel also requires the Vercel variable `CONTROL_PANEL_PASSWORD`.

## 4. Agency dashboard

The agency dashboard shows:

- New leads and active trips
- Confirmed bookings and collected revenue
- Pending customer and vendor payments
- Recent leads
- Upcoming trips
- Lead-source circular graph
- Pipeline health
- Customer feedback

Use the quick actions to add a lead, create a booking, export leads or export bookings.

## 5. Hotel OS

Hotel OS is the hotel-partner dashboard inside the same application.

Hotel partners see:

- Arrivals today
- Upcoming arrivals
- Guest contact information
- Stay dates
- Assigned hotel details
- Special requests
- Partner checklist

The product owner can lock or unlock Hotel OS from **Product Control Panel → Service access → Hotel OS dashboard**.

## 6. Leads and customers

1. Open **Leads → Add lead**.
2. Enter customer name, phone, destination and travel requirements.
3. Select the lead source, such as WhatsApp, Instagram, referral or website.
4. Assign a team member and add a follow-up date.
5. Move the lead through New, Contacted, Proposal Sent, Negotiating, Won or Lost.
6. Convert a won lead into a customer or booking when ready.

## 7. Itinerary builder

1. Open **Itineraries → New itinerary**.
2. Enter destination, travel dates, number of days, travellers, hotel category and interests.
3. Add day-wise activities, hotel stay, transfers, inclusions and exclusions.
4. Use AI drafting if the Anthropic API key is configured.
5. Review and edit the AI draft before sending it.
6. Choose **Download PDF** or **Print**.
7. Share the PDF through WhatsApp or email.

The agency logo, business name and brand colour from Agency Settings are used in the CRM and itinerary PDF letterhead.

## 8. Company branding

Open **Agency Settings → Agency profile**.

You can update:

- Company name
- Phone and address
- City
- Company logo
- Brand colour
- Google review link

Use an image smaller than 500 KB for the logo. The logo appears in the CRM sidebar/header and on itinerary letterhead.

## 9. WhatsApp and email

Open **Agency Settings → Business integrations**.

Enter:

- WhatsApp Cloud API access token
- WhatsApp phone number ID
- Resend API key
- Sender email

Tokens are encrypted before being stored. Automated messages include **Powered by TrailPilot™**.

WhatsApp automation can send:

- Booking confirmation
- Payment reminder
- Trip follow-up
- Itinerary sharing messages

## 10. AI Assistant and FAQs

Open **FAQs & AI Help** for searchable answers. The **Ask TrailPilot AI** button appears at the bottom-right of the logged-in application.

The assistant can help with:

- Leads
- Bookings
- Itineraries
- WhatsApp
- Reports
- Billing
- Team settings

If `ANTHROPIC_API_KEY` is not configured, the assistant uses the built-in FAQ fallback.

## 11. Manual UPI Premium upgrade

1. The agency owner opens **Upgrade to Premium**.
2. The page shows the company UPI ID or QR code.
3. The owner pays manually.
4. The owner enters the UPI transaction reference or UTR.
5. The owner submits the request.
6. The product owner opens **Product Control Panel**.
7. Check the UPI account and match the transaction reference.
8. Click **Approve Premium**.
9. The agency immediately receives Premium access.

Reject a request if the transaction cannot be verified.

## 12. Product Control Panel

Open **Product Control Panel** after signing in through the Product Control Panel login button.

### Service access

Use the switches to lock or unlock:

- Lead management
- Customer CRM
- Itinerary builder
- Bookings and payments
- Vendor operations
- Analytics
- AI itinerary drafting
- AI help assistant
- WhatsApp automation
- Excel and print exports
- Hotel OS

Use **Unlock every feature** to turn all services on.

### Business subscriptions

Grant or remove Premium access manually for any agency.

### Pending UPI upgrades

Review submitted UPI references and approve or reject them.

## 13. Reports and documents

- Dashboard buttons download lead and booking CSV files.
- CSV files open in Excel or Google Sheets.
- Itinerary, invoice and receipt pages support printing.
- Use the browser print dialog to save a PDF.

## 14. Environment variables

Required:

```text
DATABASE_URL
JWT_SECRET
CRON_SECRET
APP_URL
CONTROL_PANEL_PASSWORD
```

Optional:

```text
ANTHROPIC_API_KEY
ANTHROPIC_MODEL
RESEND_API_KEY
RESEND_FROM_EMAIL
WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID
NEXT_PUBLIC_PREMIUM_UPI_ID
NEXT_PUBLIC_PREMIUM_UPI_QR_URL
NEXT_PUBLIC_PREMIUM_PRICE_INR
```

## 15. Common problems

### Deployment fails with missing module errors

Upload the complete `src` folder and complete `prisma` folder. Do not upload only individual files from inside them.

### Database errors during deployment

Check that `DATABASE_URL` is the Neon PostgreSQL connection string and that all migrations are committed.

### Control Panel says password is not configured

Add `CONTROL_PANEL_PASSWORD` in Vercel and redeploy.

### WhatsApp does not send

Check the Meta access token, phone number ID, approved message templates and Premium plan status.

### AI shows FAQ fallback

Add `ANTHROPIC_API_KEY` to Vercel. The FAQ fallback is expected when no key is configured.

### Logo does not appear

Use an image smaller than 500 KB, save Agency Settings, and refresh the page.

## 16. Security rules

- Never commit `.env` files or API keys to GitHub.
- Store secrets only in Vercel Environment Variables or Agency Settings.
- Use separate passwords for agency owners and the Product Control Panel.
- Verify every UPI payment before approving Premium.
- Use test credentials before opening the product to real customers.
