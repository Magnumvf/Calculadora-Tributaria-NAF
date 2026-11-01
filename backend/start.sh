echo "Gerando cliente do Prisma..."
npx prisma generate

echo "Executando migrações do Prisma..."
npx prisma migrate deploy

echo "Iniciando o servidor Express..."
npm start
