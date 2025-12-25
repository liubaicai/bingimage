  
FROM node:22-alpine as builder

WORKDIR /app
COPY . /app
RUN npm ci && npm run build

FROM node:22-alpine

RUN apk add --no-cache postgresql-client

WORKDIR /app
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/dist/ /app/dist/
COPY --from=builder /app/public/ /app/public/
COPY --from=builder /app/views/ /app/views/
RUN npm ci --only=production

EXPOSE 3000

CMD ["node", "dist/main.js"]