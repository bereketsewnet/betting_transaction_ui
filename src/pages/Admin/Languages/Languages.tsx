import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAdminLanguages, useCreateLanguage, useUpdateLanguage, useDeleteLanguage } from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { DataTable, Column } from '@/components/ui/DataTable/DataTable';
import { Modal } from '@/components/ui/Modal/Modal';
import { Input } from '@/components/ui/Input/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Language } from '@/types';
import styles from './Languages.module.css';

const languageSchema = z.object({
  code: z.string().min(2, 'Language code must be at least 2 characters').max(5, 'Language code too long'),
  name: z.string().min(1, 'Language name is required'),
  isActive: z.boolean(),
});

type LanguageFormData = z.infer<typeof languageSchema>;

export const Languages: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data: languagesData, isLoading } = useAdminLanguages();
  const createMutation = useCreateLanguage();
  const updateMutation = useUpdateLanguage();
  const deleteMutation = useDeleteLanguage();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LanguageFormData>({
    resolver: zodResolver(languageSchema),
    defaultValues: {
      isActive: true,
    },
  });

  const handleAdd = () => {
    reset({ code: '', name: '', isActive: true });
    setEditingLanguage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (language: Language) => {
    setEditingLanguage(language);
    setValue('code', language.code);
    setValue('name', language.name);
    setValue('isActive', language.isActive);
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

  const onSubmit = async (data: LanguageFormData) => {
    try {
      if (editingLanguage) {
        await updateMutation.mutateAsync({ id: editingLanguage.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const columns: Column<Language>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (value) => <span>#{value}</span>,
    },
    {
      key: 'code',
      header: 'Code',
      render: (value) => <span className={styles.code}>{value}</span>,
    },
    {
      key: 'name',
      header: 'Name',
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
      key: 'id',
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
            <CardTitle>Languages Management</CardTitle>
            <Button onClick={handleAdd}>
              <Plus size={20} />
              Add Language
            </Button>
          </div>
        </CardHeader>
        <CardContent padding="none">
          {isLoading ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            <DataTable
              data={languagesData?.languages || []}
              columns={columns}
              pagination={{
                currentPage: 1,
                totalPages: 1,
                totalItems: languagesData?.languages?.length || 0,
                pageSize: languagesData?.languages?.length || 0,
                onPageChange: () => {},
              }}
            />
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLanguage ? 'Edit Language' : 'Add Language'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Input
            label="Language Code"
            {...register('code')}
            error={errors.code?.message}
            placeholder="e.g., en, es, de"
            disabled={!!editingLanguage}
          />

          <Input
            label="Language Name"
            {...register('name')}
            error={errors.name?.message}
            placeholder="e.g., English, Spanish"
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
              {editingLanguage ? 'Update' : 'Create'}
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
          <p>Are you sure you want to delete this language?</p>
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

