# Используем официальное Node.js изображение
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальной код приложения
COPY . .

# Открываем порт приложения
EXPOSE 3002

# Делаем скрипт запуска исполняемым
RUN chmod +x ./docker-entrypoint.sh

# Команда для запуска приложения
CMD ["/app/docker-entrypoint.sh"]