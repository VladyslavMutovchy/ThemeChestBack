# Используем официальное Node.js изображение
FROM node:21

# Устанавливаем рабочую директорию
WORKDIR /usr

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальной код приложения
COPY . .

# Открываем порт приложения
EXPOSE 3002

# Команда для запуска приложения
CMD ["npm", "run", "start:dev"]