#Usar iagen de Node.js
FROM node:18

#Establecer el directorio de trabajo dentro del contendior
WORKDIR /app

#Copiar package.json y package-lock.json para isntalar dependencias
COPY package*.json ./

#Instalar dependecias
RUN npm install --omit=dev

#Copiar el codigo fuente del contendor
COPY . .

#Exponer el puerto en el que corre el servicio
EXPOSE 3000

#Comando para inciciar el serviico
CMD ["node", "index.js"]