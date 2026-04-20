FROM node:20-alpine

WORKDIR /app

# Copiar package.json e yarn.lock
COPY package.json yarn.lock* ./

# Instalar dependências
RUN npm install --production

# Copiar código fonte
COPY src/ ./src/
COPY server.js .env.example ./

# Expor porta
EXPOSE 3001

# Comando para iniciar
CMD ["npm", "start"]
