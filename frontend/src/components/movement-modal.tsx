import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMovementStore } from '@/stores/movement-store';
import { useProductStore } from '@/stores/product-store';
import type { MovementType } from '@/types';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * @description Componente de Modal para inserção de novas Movimentações de Estoque.
 * Permite ao usuário registrar entradas e saídas, forçando a seleção de um produto
 * previamente carregado no store. Implementa validação nativa client-side rigorosa
 * antes de despachar a transação para o Zustand/Backend.
 *
 * @param {MovementModalProps} props - Controle de abertura e callback de fechamento do modal.
 * @returns {React.ReactElement | null} O componente renderizado ou nulo se fechado.
 */
export function MovementModal({ isOpen, onClose }: MovementModalProps) {
  const { createMovement, isLoading } = useMovementStore();
  const { products, fetchProducts } = useProductStore();

  const [type, setType] = useState<MovementType>('ENTRY');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      /** Carrega o dicionário de produtos sem paginação estrita para viabilizar busca no Select */
      fetchProducts({ limit: 100, page: 1 });
      /** Limpeza forçada do estado transient do React Control */
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setType('ENTRY');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProductId('');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuantity('');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReason('');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(null);
    }
  }, [isOpen, fetchProducts]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!productId) {
      setError('Selecione um produto.');
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setError('A quantidade deve ser maior que zero.');
      return;
    }

    try {
      await createMovement({
        type,
        productId,
        quantity: qty,
        reason: reason || undefined,
      });

      toast.success(
        type === 'ENTRY'
          ? 'Entrada registrada com sucesso!'
          : 'Saída registrada com sucesso!',
      );
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao registrar movimentação';
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            Nova Movimentação
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-foreground hover:bg-background rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
          {error && (
            <div className="bg-status-critical-bg/10 text-status-critical-text px-4 py-3 rounded-lg text-sm border border-status-critical-text/30">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType('ENTRY')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                type === 'ENTRY'
                  ? 'bg-status-ok-bg/10 border-status-ok-text text-status-ok-text'
                  : 'bg-background border-border text-muted hover:border-muted'
              }`}
            >
              <span className="font-semibold">ENTRADA</span>
              <span className="text-xs opacity-80">+ Adicionar estoque</span>
            </button>
            <button
              type="button"
              onClick={() => setType('EXIT')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                type === 'EXIT'
                  ? 'bg-status-critical-bg/10 border-status-critical-text text-status-critical-text'
                  : 'bg-background border-border text-muted hover:border-muted'
              }`}
            >
              <span className="font-semibold">SAÍDA</span>
              <span className="text-xs opacity-80">- Remover estoque</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Produto
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-accent/40 outline-none cursor-pointer"
              required
            >
              <option value="">Selecione um produto...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (SKU: {p.sku})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Quantidade
            </label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ex: 10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Motivo / Observação{' '}
              <span className="text-muted font-normal">(Opcional)</span>
            </label>
            <Input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Compra de fornecedor, Venda..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Registrando...' : 'Confirmar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
