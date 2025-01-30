# Gunakan image node sebagai base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json dan install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy semua file ke dalam container
COPY . .

# Jalankan aplikasi React
EXPOSE 3000
CMD ["npm", "start"]
