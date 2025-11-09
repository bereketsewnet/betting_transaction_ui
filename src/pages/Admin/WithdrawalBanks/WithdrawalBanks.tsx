import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAdminWithdrawalBanks, useCreateWithdrawalBank, useUpdateWithdrawalBank, useDeleteWithdrawalBank } from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { DataTable, Column } from '@/components/ui/DataTable/DataTable';
import { Modal } from '@/components/ui/Modal/Modal';
import { Input } from '@/components/ui/Input/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { WithdrawalBank } from '@/types';
import styles from './WithdrawalBanks.module.css';

const bankSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  notes: z.string().optional(),
  isActive: z.boolean(),
  requiredFields: z.array(z.object({
    name: z.string().min(1, 'Field name is required'),
    label: z.string().min(1, 'Field label is required'),
    type: z.string().min(1, 'Field type is required'),
    required: z.boolean(),
  })).min(1, 'At least one field is required'),
});

type BankFormData = z.infer<typeof bankSchema>;

export const WithdrawalBanks: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<WithdrawalBank | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [fields, setFields] = useState<Array<{ name: string; label: string; type: 'text' | 'number' | 'email'; required: boolean }>>([
    { name: '', label: '', type: 'text', required: true }
  ]);

  const { data: banksData, isLoading } = useAdminWithdrawalBanks();
  const createMutation = useCreateWithdrawalBank();
  const updateMutation = useUpdateWithdrawalBank();
  const deleteMutation = useDeleteWithdrawalBank();

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
      requiredFields: [],
    },
  });

  const handleAdd = () => {
    reset({ bankName: '', notes: '', isActive: true, requiredFields: [] });
    setFields([{ name: '', label: '', type: 'text', required: true }]);
    setEditingBank(null);
    setIsModalOpen(true);
  };

  const handleEdit = (bank: WithdrawalBank) => {
    setEditingBank(bank);
    setValue('bankName', bank.bankName);
    setValue('notes', bank.notes || '');
    setValue('isActive', bank.isActive);
    
    if (bank.requiredFields && Array.isArray(bank.requiredFields)) {
      setFields(bank.requiredFields);
      setValue('requiredFields', bank.requiredFields);
    } else {
      setFields([{ name: '', label: '', type: 'text', required: true }]);
    }
    
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setDeleteError(null); // Clear any previous errors
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteConfirmId(null);
      setDeleteError(null);
    } catch (error: any) {
      console.error('Delete failed:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      // Extract error message from backend response
      // Backend now returns 400 with clear error message
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to delete withdrawal bank';
      
      setDeleteError(errorMessage);
    }
  };

  const addField = () => {
    const newFields: Array<{ name: string; label: string; type: 'text' | 'number' | 'email'; required: boolean }> = [
      ...fields, 
      { name: '', label: '', type: 'text' as const, required: true }
    ];
    setFields(newFields);
    setValue('requiredFields', newFields);
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    setValue('requiredFields', newFields);
  };

  const updateField = (index: number, key: keyof typeof fields[0], value: string | boolean) => {
    const newFields = [...fields];
    if (key === 'type' && typeof value === 'string') {
      // Ensure type is one of the valid values
      if (value === 'text' || value === 'number' || value === 'email') {
        newFields[index][key] = value;
      }
    } else if (key !== 'type') {
      // @ts-expect-error - dynamic key access
      newFields[index][key] = value;
    }
    setFields(newFields);
    setValue('requiredFields', newFields);
  };

  const onSubmit = async (data: BankFormData) => {
    try {
      const submitData = {
        ...data,
        requiredFields: fields,
      };
      
      if (editingBank) {
        await updateMutation.mutateAsync({ id: editingBank.id, data: submitData });
      } else {
        await createMutation.mutateAsync(submitData);
      }
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const columns: Column<WithdrawalBank>[] = [
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
      key: 'requiredFields',
      header: 'Required Fields',
      render: (value) => (
        <span>
          {Array.isArray(value) ? value.map(f => f.label).join(', ') : 'None'}
        </span>
      ),
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
            <CardTitle>Withdrawal Banks Management</CardTitle>
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
            />
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBank ? 'Edit Withdrawal Bank' : 'Add Withdrawal Bank'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Input
            label="Bank Name"
            {...register('bankName')}
            error={errors.bankName?.message}
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

          <div className={styles.fieldsSection}>
            <div className={styles.fieldsSectionHeader}>
              <h4>Required Fields for Withdrawal</h4>
              <Button type="button" size="sm" onClick={addField}>
                <Plus size={16} />
                Add Field
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={index} className={styles.fieldRow}>
                <Input
                  label="Field Name"
                  value={field.name}
                  onChange={(e) => updateField(index, 'name', e.target.value)}
                  placeholder="e.g., account_number"
                />
                <Input
                  label="Field Label"
                  value={field.label}
                  onChange={(e) => updateField(index, 'label', e.target.value)}
                  placeholder="e.g., Account Number"
                />
                <Input
                  label="Field Type"
                  value={field.type}
                  onChange={(e) => updateField(index, 'type', e.target.value)}
                  placeholder="text, number, email"
                />
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(index, 'required', e.target.checked)}
                  />
                  Required
                </label>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => removeField(index)}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {errors.requiredFields && (
            <span className={styles.error}>{errors.requiredFields.message}</span>
          )}

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
        onClose={() => {
          setDeleteConfirmId(null);
          setDeleteError(null);
        }}
        title="Confirm Delete"
      >
        <div className={styles.confirmDelete}>
          <p>Are you sure you want to delete this withdrawal bank?</p>
          
          {deleteConfirmId && (() => {
            const bank = banksData?.banks?.find(b => b.id === deleteConfirmId);
            return bank ? (
              <div style={{ 
                padding: '0.75rem', 
                background: 'var(--color-background-secondary)', 
                borderRadius: '4px',
                marginTop: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{bank.bankName}</p>
                {bank.notes && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    {bank.notes}
                  </p>
                )}
              </div>
            ) : null;
          })()}

          {/* Warning message - always show */}
          <div style={{
            padding: '0.75rem',
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            marginTop: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <p style={{ color: '#856404', margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>
              ⚠️ Warning: This bank account may have transactions associated with it.
            </p>
            <p style={{ 
              color: '#856404', 
              margin: '0.5rem 0 0 0', 
              fontSize: '0.8125rem'
            }}>
              Deletion is not allowed if the bank is used in any transactions. If you want to hide this bank from new transactions, please deactivate it instead by editing and unchecking "Active".
            </p>
          </div>

          {deleteError && (
            <div style={{
              padding: '0.75rem',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
              marginTop: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <p style={{ color: '#c33', margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>
                {deleteError}
              </p>
              <p style={{ 
                color: '#c33', 
                margin: '0.5rem 0 0 0', 
                fontSize: '0.8125rem',
                fontStyle: 'italic'
              }}>
                💡 Suggestion: Instead of deleting, you can deactivate this bank by editing it and unchecking "Active".
              </p>
            </div>
          )}

          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
            Note: This action cannot be undone. If this bank is used in transactions, deletion will fail.
          </p>

          <div className={styles.modalActions}>
            <Button variant="outline" onClick={() => {
              setDeleteConfirmId(null);
              setDeleteError(null);
            }}>
              Cancel
            </Button>
            <Button
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

