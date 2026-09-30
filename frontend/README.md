# Kestrel frontend

See the repository [README](../README.md) for the complete setup and [deployment guide](../DEPLOYMENT.md) for hosting.

```sh
npm ci
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to http://localhost:5000 during development. The backend, PostgreSQL, RabbitMQ, and dispatcher must also run for the complete app.

For separate production hosting, set `VITE_API_URL` to your HTTPS gateway origin before `npm run build`. Leave it empty when the same web server proxies `/api` (the included Docker Compose setup). Never put secrets in frontend environment variables.

Checks: `npm run lint` and `npm run build`. Build output: `dist`. `npm run preview` is a local static preview, not a production server or a replacement for the backend.
