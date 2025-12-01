# Tahap 1: Build React App
FROM node:18 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Tahap 2: Serve dengan Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Pastikan nginx.conf ada di direktori build context
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
