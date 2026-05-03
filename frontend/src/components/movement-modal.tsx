import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMovementStore } from '@/stores/movement-store';
import { useProductStore } from '@/stores/product-store';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const movementSchema = z.object({
  type: z.enum(['ENTRY', 'EXIT']),
  productId: z.string().min(1, 'Selecione um produto.'),
  quantity: z.number().min(1, 'A quantidade deve ser maior que zero.'),
  reason: z.string().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

/**
 * @description Componente de Modal para inserção de novas Movimentações de Estoque.
 * Utiliza validação client-side via react-hook-form + zod antes de despachar
 * a transação para o Zustand/Backend.
 *
 * @param {MovementModalProps} props - Controle de abertura e callback de fechamento do modal.
 * @returns {React.ReactElement | null} O componente renderizado ou nulo se fechado.
 */
export function MovementModal({ isOpen, onClose }: MovementModalProps) {
  const { createMovement, isLoading } = useMovementStore();
  const { products, fetchProducts } = useProductStore();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      type: 'ENTRY',
      productId: '',
      quantity: 1,
      reason: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      /** Carrega o dicionário de produtos sem paginação estrita para viabilizar busca no Select */
      fetchProducts({ limit: 100, page: 1 });
      reset({
        type: 'ENTRY',
        productId: '',
        quantity: 1,
        reason: '',
      });
    }
  }, [isOpen, fetchProducts, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: MovementFormData) => {
    try {
      await createMovement({
        type: data.type,
        productId: data.productId,
        quantity: data.quantity,
        reason: data.reason || undefined,
      });

      toast.success(
        data.type === 'ENTRY'
          ? 'Entrada registrada com sucesso!'
          : 'Saída registrada com sucesso!',
      );
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao registrar movimentação';
      setError('root', { message: msg });
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="p-6 space-y-5"
        >
          {errors.root && (
            <div className="bg-status-critical-bg/10 text-status-critical-text px-4 py-3 rounded-lg text-sm border border-status-critical-text/30">
              {errors.root.message}
            </div>
          )}

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => field.onChange('ENTRY')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    field.value === 'ENTRY'
                      ? 'bg-status-ok-bg/10 border-status-ok-text text-status-ok-text'
                      : 'bg-background border-border text-muted hover:border-muted'
                  }`}
                >
                  <span className="font-semibold">ENTRADA</span>
                  <span className="text-xs opacity-80">
                    + Adicionar estoque
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange('EXIT')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    field.value === 'EXIT'
                      ? 'bg-status-critical-bg/10 border-status-critical-text text-status-critical-text'
                      : 'bg-background border-border text-muted hover:border-muted'
                  }`}
                >
                  <span className="font-semibold">SAÍDA</span>
                  <span className="text-xs opacity-80">- Remover estoque</span>
                </button>
              </div>
            )}
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Produto
            </label>
            <select
              {...register('productId')}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-accent/40 outline-none cursor-pointer"
            >
              <option value="">Selecione um produto...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (SKU: {p.sku})
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="text-destructive text-xs mt-1">
                {errors.productId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Quantidade
            </label>
            <Input
              type="number"
              min="1"
              {...register('quantity', { valueAsNumber: true })}
              placeholder="Ex: 10"
            />
            {errors.quantity && (
              <p className="text-destructive text-xs mt-1">
                {errors.quantity.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Motivo / Observação{' '}
              <span className="text-muted font-normal">(Opcional)</span>
            </label>
            <Input
              type="text"
              {...register('reason')}
              placeholder="Ex: Compra de fornecedor, Venda..."
            />
            {errors.reason && (
              <p className="text-destructive text-xs mt-1">
                {errors.reason.message}
              </p>
            )}
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
