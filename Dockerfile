FROM node:14-alpine3.13

RUN apk add --no-cache alpine-sdk python2

WORKDIR /app


COPY . /app
RUN apk add --no-cache alpine-sdk python2 && \
    npm ci && npm run build && \
    apk del alpine-sdk python2

EXPOSE 3000

CMD ["node", "dist/main.js"]
