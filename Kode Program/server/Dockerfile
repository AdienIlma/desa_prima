FROM node:18

# Buat folder kerja di dalam container
WORKDIR /app

# Salin file dependency terlebih dahulu agar cache layer Docker bisa optimal
COPY package*.json ./

# Install dependencies termasuk @prisma/client
RUN npm install

# Salin semua source code (termasuk folder prisma dan index.js)
COPY . .

# Jalankan generate Prisma Client
RUN npx prisma generate

# # Ekspos port backend
EXPOSE 5010

# Jalankan aplikasi
CMD ["node", "index.js"]
