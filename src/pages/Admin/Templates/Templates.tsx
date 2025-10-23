import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAdminTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { DataTable, Column } from '@/components/ui/DataTable/DataTable';
import { Modal } from '@/components/ui/Modal/Modal';
import { Input } from '@/components/ui/Input/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Template } from '@/types';
import styles from './Templates.module.css';

const templateSchema = z.object({
  languageCode: z.string().min(1, 'Language code is required'),
  keyName: z.string().min(1, 'Key name is required'),
  content: z.string().min(1, 'Content is required'),
});

type TemplateFormData = z.infer<typeof templateSchema>;

export const Templates: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data: templatesData, isLoading } = useAdminTemplates();
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  const deleteMutation = useDeleteTemplate();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
  });

  const handleAdd = () => {
    reset({ languageCode: '', keyName: '', content: '' });
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setValue('languageCode', template.languageCode);
    setValue('keyName', template.keyName);
    setValue('content', template.content);
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

  const onSubmit = async (data: TemplateFormData) => {
    try {
      if (editingTemplate) {
        await updateMutation.mutateAsync({ id: editingTemplate.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const columns: Column<Template>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (value) => <span>#{value}</span>,
    },
    {
      key: 'languageCode',
      header: 'Language',
    },
    {
      key: 'keyName',
      header: 'Key Name',
    },
    {
      key: 'content',
      header: 'Content',
      render: (value) => (
        <span className={styles.content}>
          {String(value).substring(0, 50)}{String(value).length > 50 ? '...' : ''}
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
            <CardTitle>Templates Management</CardTitle>
            <Button onClick={handleAdd}>
              <Plus size={20} />
              Add Template
            </Button>
          </div>
        </CardHeader>
        <CardContent padding="none">
          {isLoading ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            <DataTable
              data={templatesData?.templates || []}
              columns={columns}
              pagination={{
                currentPage: 1,
                totalPages: 1,
                totalItems: templatesData?.templates?.length || 0,
                pageSize: templatesData?.templates?.length || 0,
                onPageChange: () => {},
              }}
            />
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate ? 'Edit Template' : 'Add Template'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Input
            label="Language Code"
            {...register('languageCode')}
            error={errors.languageCode?.message}
            placeholder="e.g., en, es, de"
          />

          <Input
            label="Key Name"
            {...register('keyName')}
            error={errors.keyName?.message}
            placeholder="e.g., welcome_message"
          />

          <div className={styles.textareaWrapper}>
            <label className={styles.label}>Content</label>
            <textarea
              {...register('content')}
              className={styles.textarea}
              rows={6}
              placeholder="Template content..."
            />
            {errors.content && (
              <span className={styles.error}>{errors.content.message}</span>
            )}
          </div>

          <div className={styles.modalActions}>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editingTemplate ? 'Update' : 'Create'}
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
          <p>Are you sure you want to delete this template?</p>
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

