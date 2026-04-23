# Kestrel 🦅

> An event-driven, polyglot microservices architecture for real-time cryptocurrency monitoring and automated Discord alerting.

Kestrel is an automated market sentinel that polls live crypto prices and dispatches instant, rule-based Discord alerts via RabbitMQ. By decoupling the heavy data-ingestion engine from the notification dispatcher, Kestrel ensures reliable, fault-tolerant monitoring without dropping alerts during high market volatility.

---

## 📁 Project Structure

Kestrel uses a monorepo approach to manage its microservices. Each directory operates independently but works together to form the complete architecture.

* **/frontend** - The user interface (React + Vite + Tailwind CSS). Where users log in and configure their market alert rules.
* **/api-gateway** - The central entry point (Node.js + Express). Routes UI requests to the appropriate backend services.
* **/sentinel** - The core background engine (Spring Boot + Java). Polls the CoinGecko API, evaluates live prices against user rules, and drops events into the message broker. Talks to PostgreSQL (NeonDB).
* **/alert-dispatcher** - The worker service (Node.js). Continuously listens to the RabbitMQ queue and pushes formatted alerts to Discord Webhooks.

---

## 🚀 Setup Guide for Collaborators

To run this polyglot architecture locally, follow these steps.

### Prerequisites
Before you begin, ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (LTS version)
* [Java Development Kit (JDK)](https://adoptium.net/) (Version 17 or 21)
* [Git](https://git-scm.com/)
* [Docker Desktop](https://www.docker.com/products/docker-desktop) (For running the message broker locally)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/kestrel.git
cd kestrel
```

### 2. Set Up Infrastructure (RabbitMQ)
Make sure Docker Desktop is open and running in the background. Then, spin up the RabbitMQ broker:
```bash
docker run -d --hostname my-rabbit --name kestrel-rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```
*Note: You can view the RabbitMQ dashboard by navigating to `http://localhost:15672` (Username: `guest` | Password: `guest`).*

### 3. Environment Variables & Secrets
Because sensitive credentials are in the `.gitignore`, you must create local configuration files. Ask the repository admin for the testing credentials, or set up your own NeonDB and Discord Webhooks.

* **Sentinel (Java):** Create `sentinel/src/main/resources/application.properties` and add the NeonDB connection string and RabbitMQ config.
* **API Gateway & Dispatcher (Node):** Create a `.env` file in both the `/api-gateway` and `/alert-dispatcher` folders containing your port configs and Discord Webhook test URLs.

### 4. Install & Run Node.js Services
Open three separate terminal windows to run the JavaScript-based services.

**Terminal 1 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

**Terminal 2 (API Gateway):**
```bash
cd api-gateway
npm install
node server.js
```

**Terminal 3 (Alert Dispatcher):**
```bash
cd alert-dispatcher
npm install
node dispatcher.js
```

### 5. Run the Spring Boot Sentinel
Open a fourth terminal to start the Java data-ingestion engine.

```bash
cd sentinel
./mvnw spring-boot:run
```
*(On Windows, use `mvnw.cmd spring-boot:run`)*

---

## 📝 Commit Message Guide

To keep the repository history clean and readable, we follow the **Conventional Commits** standard. Please format all pull requests and commits using the following prefixes:

* **`feat:`** - A new feature (e.g., `feat: add toggle status to active rules table`)
* **`fix:`** - A bug fix (e.g., `fix: resolve CORS error on api gateway`)
* **`docs:`** - Documentation only changes (e.g., `docs: update setup guide in README`)
* **`style:`** - Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
* **`refactor:`** - A code change that neither fixes a bug nor adds a feature (e.g., `refactor: clean up Spring Boot folder structure`)
* **`chore:`** - Changes to the build process or auxiliary tools and libraries (e.g., `chore: update dependency versions in package.json`)

**Example of a good commit message:**
> `feat: integrate CoinGecko API polling in Sentinel module`