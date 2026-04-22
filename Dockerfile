FROM node:20-alpine

WORKDIR /app

# Copiar manifests de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --omit=dev

# Copiar código fonte
COPY src/ ./src/
COPY server.js .env.example ./

# Expor porta
EXPOSE 3001

# Comando para iniciar
CMD ["npm", "start"]
