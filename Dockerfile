FROM node:24-bookworm

WORKDIR /app

ENV PLAYWRIGHT_BROWSERS_PATH=/usr/local/lib/playwright-browsers

COPY package*.json ./
RUN npm ci --no-audit --no-fund \
	&& npx playwright install-deps \
	&& npx playwright install chromium-headless-shell

COPY src ./src

CMD ["node", "/app/src/index.js"]
