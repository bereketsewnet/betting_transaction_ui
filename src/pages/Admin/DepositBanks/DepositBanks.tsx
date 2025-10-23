import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAdminDepositBanks, useCreateDepositBank, useUpdateDepositBank, useDeleteDepositBank } from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { DataTable, Column } from '@/components/ui/DataTable/DataTable';
import { Modal } from '@/components/ui/Modal/Modal';
import { Input } from '@/components/ui/Input/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { DepositBank } from '@/types';
import styles from './DepositBanks.module.css';

const bankSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  accountName: z.string().min(1, 'Account name is required'),
  notes: z.string().optional(),
  isActive: z.boolean(),
});

type BankFormData = z.infer<typeof bankSchema>;

export const DepositBanks: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<DepositBank | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data: banksData, isLoading } = useAdminDepositBanks();
  const createMutation = useCreateDepositBank();
  const updateMutation = useUpdateDepositBank();
  const deleteMutation = useDeleteDepositBank();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BankFormData>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      isActive: true,
    },
  });

  const handleAdd = () => {
    reset({ bankName: '', accountNumber: '', accountName: '', notes: '', isActive: true });
    setEditingBank(null);
    setIsModalOpen(true);
  };

  const handleEdit = (bank: DepositBank) => {
    setEditingBank(bank);
    setValue('bankName', bank.bankName);
    setValue('accountNumber', bank.accountNumber);
    setValue('accountName', bank.accountName);
    setValue('notes', bank.notes || '');
    setValue('isActive', bank.isActive);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const onSubmit = async (data: BankFormData) => {
    try {
      if (editingBank) {
        await updateMutation.mutateAsync({ id: editingBank.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const columns: Column<DepositBank>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (value) => <span>#{value}</span>,
    },
    {
      key: 'bankName',
      header: 'Bank Name',
    },
    {
      key: 'accountNumber',
      header: 'Account Number',
    },
    {
      key: 'accountName',
      header: 'Account Name',
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value) => (
        <span className={value ? styles.statusActive : styles.statusInactive}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_value, row) => (
        <div className={styles.actions}>
          <Button size="sm" variant="outline" onClick={() => handleEdit(row)}>
            <Edit2 size={16} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDeleteConfirmId(row.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Card>
        <CardHeader>
          <div className={styles.header}>
            <CardTitle>Deposit Banks Management</CardTitle>
            <Button onClick={handleAdd}>
              <Plus size={20} />
              Add Bank
            </Button>
          </div>
        </CardHeader>
        <CardContent padding="none">
          {isLoading ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            <DataTable
              data={banksData?.banks || []}
              columns={columns}
              pagination={{
                currentPage: 1,
                totalPages: 1,
                totalItems: banksData?.banks?.length || 0,
                pageSize: banksData?.banks?.length || 0,
                onPageChange: () => {},
              }}
            />
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBank ? 'Edit Deposit Bank' : 'Add Deposit Bank'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Input
            label="Bank Name"
            {...register('bankName')}
            error={errors.bankName?.message}
          />

          <Input
            label="Account Number"
            {...register('accountNumber')}
            error={errors.accountNumber?.message}
          />

          <Input
            label="Account Name"
            {...register('accountName')}
            error={errors.accountName?.message}
          />

          <Input
            label="Notes (Optional)"
            {...register('notes')}
            error={errors.notes?.message}
          />

          <label className={styles.checkbox}>
            <input type="checkbox" {...register('isActive')} />
            Active
          </label>

          <div className={styles.modalActions}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingBank ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Delete"
      >
        <div className={styles.confirmDelete}>
          <p>Are you sure you want to delete this deposit bank?</p>
          <div className={styles.modalActions}>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

