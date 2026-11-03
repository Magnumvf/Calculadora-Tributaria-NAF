set -e

echo "Gerando cliente Prisma..."
npx prisma generate

echo "Executando migrações do Prisma..."
npx prisma migrate deploy

echo "Iniciando o servidor Express..."
npm start
