-- CreateIndex
CREATE INDEX "movements_product_id_created_at_idx" ON "movements"("product_id", "created_at");

-- CreateIndex
CREATE INDEX "movements_user_id_idx" ON "movements"("user_id");

-- CreateIndex
CREATE INDEX "movements_created_at_idx" ON "movements"("created_at");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- AddCheckConstraint
-- Invariante de domínio: o saldo de estoque nunca pode ser negativo. A regra
-- existe na camada de aplicação (MovementsService), mas o banco é a última
-- linha de defesa contra condições de corrida e escritas fora do fluxo transacional.
ALTER TABLE "products" ADD CONSTRAINT "products_quantity_non_negative"
  CHECK ("quantity" >= 0) NOT VALID;
ALTER TABLE "products" ADD CONSTRAINT "products_min_quantity_non_negative"
  CHECK ("min_quantity" >= 0) NOT VALID;
ALTER TABLE "products" ADD CONSTRAINT "products_prices_non_negative"
  CHECK ("costPrice" >= 0 AND "sellPrice" >= 0) NOT VALID;
ALTER TABLE "products" VALIDATE CONSTRAINT "products_quantity_non_negative";
ALTER TABLE "products" VALIDATE CONSTRAINT "products_min_quantity_non_negative";
ALTER TABLE "products" VALIDATE CONSTRAINT "products_prices_non_negative";

-- AddCheckConstraint
-- Quantidade movimentada é sempre estritamente positiva; o sinal conceitual
-- (entrada/saída) é dado pela coluna "type".
ALTER TABLE "movements" ADD CONSTRAINT "movements_quantity_positive"
  CHECK ("quantity" > 0) NOT VALID;
ALTER TABLE "movements" VALIDATE CONSTRAINT "movements_quantity_positive";
