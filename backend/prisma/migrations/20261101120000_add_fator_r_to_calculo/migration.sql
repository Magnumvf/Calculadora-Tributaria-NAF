-- Persiste os dados do Fator R e o anexo retornados pelo cálculo da M2.
ALTER TABLE "calculos"
ADD COLUMN "folha" DOUBLE PRECISION,
ADD COLUMN "fatorR" DOUBLE PRECISION,
ADD COLUMN "anexo" TEXT;
