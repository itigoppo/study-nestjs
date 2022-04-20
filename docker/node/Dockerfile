FROM node:17.9.0-alpine
RUN npm i -g @nestjs/cli
WORKDIR /api

EXPOSE 3000

# timezone setting
RUN apk add --update --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
    echo "Asia/Tokyo" > /etc/timezone && \
    apk del tzdata

