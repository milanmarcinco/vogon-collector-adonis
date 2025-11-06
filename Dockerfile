FROM node:25-alpine3.22

WORKDIR /app
COPY . .

RUN npm install && \
    npm run build

WORKDIR /app/build
RUN npm ci --omit="dev"

COPY infra/start.sh .
RUN chmod +x start.sh

EXPOSE 3000

ENTRYPOINT [ "./start.sh" ]
