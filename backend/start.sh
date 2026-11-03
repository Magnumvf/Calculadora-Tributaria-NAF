#!/bin/sh
set -e

echo "Instalando dependências do backend..."
npm ci --no-audit --no-fund

echo "Gerando cliente Prisma..."
npx prisma generate

echo "Executando migrações do Prisma..."
npx prisma migrate deploy

echo "Iniciando o servidor Express..."
npm start
