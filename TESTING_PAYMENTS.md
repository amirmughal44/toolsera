# Toolora Stripe PCI-Compliant Payment System: Testing Guide

This document provides step-by-step instructions for testing the Toolora payment checkout system in both Sandbox Simulator Mode and Live/Test Stripe Mode.

---

## Architecture Overview

1. **PCI-DSS SAQ A Compliance**: All cardholder data is entered into Stripe-hosted Elements iframes. Zero raw card numbers, CVVs, or expiration dates ever pass through or reside on the Toolora application servers.
2. **Customer Tokenization**: Cards are tokenized into Stripe PaymentMethod IDs (`pm_...`) and linked to Stripe Customer records (`cus_...`) for future 1-click purchases.
3. **Risk-Based Dynamic 3D Secure**:
   - **Low-Risk / Frictionless**: Transactions judged low-risk by Stripe Radar and card issuers authenticate automatically in the background without prompting for OTP.
   - **High-Risk / SCA Enforced**: If required by PSD2 regulations, local bank mandates, or suspicious risk indicators, Stripe Elements automatically renders the bank's official modal challenge and resumes seamlessly once authenticated.
4. **Server-Side Fulfillment**: The order confirmation page (`/checkout/confirmation`) queries `/api/orders/[id]` which validates the payment intent status directly against Stripe API and the cryptographically verified webhook before granting All-Access entitlement.

---

## 1. Quick Testing (Sandbox Simulator Mode)

If you have not added your Stripe API keys yet:
1. Visit: `http://localhost:3000/checkout`
2. Select the **$100 All-Access Plan** (One-Time or Annual).
3. Click **"Continue to Customer Info"**, enter your details, and click **"Proceed to Payment ($100)"**.
4. The system will detect that Stripe keys are not yet configured in `.env.local` and load the **Sandbox Simulator**.
5. Click **"Pay $100 & Activate All-Access"**.
6. You will be redirected to `/checkout/confirmation?order_id=...` where the server verifies the order, triggers celebratory confetti, and prints the official payment receipt.

---

## 2. Testing with Real Stripe Test Keys (`sk_test_...` / `pk_test_...`)

### Step A: Configure API Keys
1. Get your test keys from [Stripe API Keys Dashboard](https://dashboard.stripe.com/apikeys).
2. Add them to `.env.local`:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
   *(Or click "Connect Stripe API Key" at the top of the `/checkout` page to paste them directly in the browser).*

### Step B: Test Frictionless Low-Risk Card (Zero OTP Challenge)
- **Card Number**: `4242 4242 4242 4242`
- **Expiration**: Any future date (e.g. `12/28`)
- **CVC**: Any 3 digits (e.g. `894`)
- **Result**: Immediate frictionless authorization in 1 click. Zero OTP modal is shown. Payment intent completes with `status: succeeded`.

### Step C: Test 3D Secure Mandatory Authentication Card (OTP Modal Challenge)
- **Card Number**: `4000 0000 0000 3063`
- **Expiration**: Any future date (e.g. `12/28`)
- **CVC**: Any 3 digits (e.g. `894`)
- **Result**: Stripe Elements automatically renders the 3D Secure modal challenge ("Complete Authentication"). Click "Complete Authentication" -> payment is approved and redirected to verified confirmation.

### Step D: Test Card Decline / Insufficient Funds
- **Card Number**: `4000 0000 0000 0115` (Fails with `card_declined`)
- **Result**: Displays clear, user-friendly card decline error message right on the form without crashing or reloading.

---

## 3. Testing Webhook Signature Verification Locally

To test local webhook event verification:
1. Download the [Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Login to your Stripe account:
   ```bash
   stripe login
   ```
3. Forward webhook events to your local dev server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret outputted by the CLI (starts with `whsec_...`) and add to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
5. Trigger a test payment in checkout or via the CLI:
   ```bash
   stripe trigger payment_intent.succeeded
   ```
6. Check your terminal: `/api/webhooks/stripe` will verify the signature, mark the order as `PAID`, and fulfill the All-Access entitlement.
