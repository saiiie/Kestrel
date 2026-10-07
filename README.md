# Kestrel

**Cryptocurrency price alerts, delivered to Discord.**

Kestrel is a full-stack cryptocurrency monitoring application that turns custom price conditions into Discord notifications. Users manage alerts, review activity, and configure their notification channel from a single dashboard.

Built with **React, Spring Boot, Express, PostgreSQL, and RabbitMQ**, the project combines an authenticated web application, scheduled market-data polling, and asynchronous notification delivery.

## Preview

### Alert dashboard

Manage price conditions, track active and paused alerts, and review recent activity.

![Alert dashboard with configured rules, status counts, and recent activity](public/assets/preview/dashboard.png)

<details>
<summary>Alert creation and account settings</summary>

### Create an alert

Choose an asset, set a price condition, and control whether the rule is active.

![Create-alert dialog with asset, condition, threshold, and status controls](public/assets/preview/create-alert.png)

### Settings

Manage profile details, account security, and the Discord webhook connection.

![Settings page with profile, security, and Discord integration controls](public/assets/preview/settings.png)

</details>

<details>
<summary>Landing page</summary>

### Introduction

![Kestrel landing page hero section](public/assets/preview/hero-section.png)

### Product features

![Landing page feature overview](public/assets/preview/features.png)

### Getting started

![Landing page walkthrough of how to use Kestrel](public/assets/preview/how-to-use.png)

### Call to action

![Landing page call to action](public/assets/preview/cta.png)

</details>

<details>
<summary>Sign up and log in</summary>

### Sign up

![Kestrel account registration page](public/assets/preview/sign-up.png)

### Log in

![Kestrel login page](public/assets/preview/log-in.png)

</details>

## Features

- **Flexible price alerts.** Trigger an alert when an asset rises above a target, drops below it, or moves more than a chosen dollar amount from its saved baseline.
- **Ten supported assets.** Monitor Bitcoin, Ethereum, Solana, Tether, BNB, XRP, Cardano, Dogecoin, Polkadot, and Chainlink using USD prices from CoinGecko.
- **A dashboard for your rules.** View cached prices alongside thresholds, active and paused rule counts, and recent activity. Create, edit, pause, reactivate, or delete alerts.
- **Discord integration.** Save your channel's webhook in Settings and send a test notification before relying on your alerts.
- **Automatic pausing.** Once RabbitMQ accepts a triggered alert, its rule pauses. Reactivate it when you want to watch that condition again.
- **Personal accounts.** Register, sign in, update your profile, change your password, and delete your account. Rules, history, and settings are scoped to their owner.

### Example workflow

1. Connect your Discord webhook and send a test alert.
2. Create a rule such as **“Notify me when Bitcoin drops below $60,000.”**
3. Kestrel checks prices in the background and queues a notification when a sampled price meets the condition.
4. The notification worker posts to Discord; the dashboard records the trigger and shows the rule as paused.

## How it works

```mermaid
flowchart LR
    UI[React dashboard] --> Gateway[Express API gateway]
    Gateway --> Sentinel[Spring Boot · Sentinel]
    Sentinel <--> DB[(PostgreSQL)]
    CoinGecko[CoinGecko prices] -->|Scheduled polling| Sentinel
    Sentinel -->|Triggered alerts| Queue[RabbitMQ]
    Queue --> Worker[Node.js dispatcher]
    Worker --> Discord[Discord channel]
```

## Highlights

- **Shared market data.** A single polling cycle supplies prices for all users and rules. Dashboard refreshes read the cache without making extra CoinGecko requests.
- **Asynchronous delivery.** RabbitMQ separates rule evaluation from Discord requests. The worker retries temporary failures and rate limits, then preserves exhausted or permanent failures in a separate queue for inspection.
- **Confirmed publication.** Sentinel waits for the broker to confirm receipt before pausing a rule; a publication failure leaves the rule active for a later cycle.
- **Access controls.** JWT authentication, BCrypt password hashing, server-side ownership checks, webhook destination validation, and encrypted webhook storage are implemented in the backend.
