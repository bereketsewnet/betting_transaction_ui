import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import {
  useAdminBettingSites,
  useCreateBettingSite,
  useUpdateBettingSite,
  useToggleBettingSiteStatus,
  useDeleteBettingSite,
} from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { DataTable } from '@/components/ui/DataTable/DataTable';
import { Modal } from '@/components/ui/Modal/Modal';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import type { BettingSite, CreateBettingSiteRequest, UpdateBettingSiteRequest } from '@/types';
import styles from './BettingSites.module.css';

const bettingSiteSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  website: z.string().url('Must be a valid URL'),
  isActive: z.boolean(),
});

type BettingSiteFormData = z.infer<typeof bettingSiteSchema>;

export const BettingSites: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBettingSite, setEditingBettingSite] = useState<BettingSite | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<BettingSite | null>(null);

  const { data: bettingSitesData, isLoading, error } = useAdminBettingSites();
  
  // Debug logging
  console.log('Betting Sites Data:', bettingSitesData);
  console.log('Loading:', isLoading);
  console.log('Error:', error);
  const createBettingSite = useCreateBettingSite();
  const updateBettingSite = useUpdateBettingSite();
  const toggleStatus = useToggleBettingSiteStatus();
  const deleteBettingSite = useDeleteBettingSite();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BettingSiteFormData>({
    resolver: zodResolver(bettingSiteSchema),
    defaultValues: {
      isActive: true,
    },
  });

  const handleCreate = () => {
    setEditingBettingSite(null);
    reset({ isActive: true });
    setIsModalOpen(true);
  };

  const handleEdit = (bettingSite: BettingSite) => {
    setEditingBettingSite(bettingSite);
    setValue('name', bettingSite.name);
    setValue('description', bettingSite.description);
    setValue('website', bettingSite.website);
    setValue('isActive', bettingSite.isActive);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (bettingSite: BettingSite) => {
    try {
      console.log('Toggling status for betting site:', bettingSite.id, 'Current status:', bettingSite.isActive);
      const result = await toggleStatus.mutateAsync(bettingSite.id);
      console.log('Toggle result:', result);
      
      // The API returns the updated betting site with the new status
      const newStatus = result.bettingSite.isActive;
      toast.success(`Betting site ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      console.error('Toggle status error:', error);
      toast.error(error.response?.data?.message || 'Failed to toggle betting site status');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteBettingSite.mutateAsync(deleteConfirm.id);
      toast.success('Betting site deleted successfully');
      setDeleteConfirm(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete betting site');
    }
  };

  const onSubmit = async (data: BettingSiteFormData) => {
    try {
      if (editingBettingSite) {
        await updateBettingSite.mutateAsync({
          id: editingBettingSite.id,
          data,
        });
        toast.success('Betting site updated successfully');
      } else {
        await createBettingSite.mutateAsync(data);
        toast.success('Betting site created successfully');
      }
      setIsModalOpen(false);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save betting site');
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (value: number) => <span className={styles.id}>#{value}</span>,
    },
    {
      key: 'name',
      header: 'Name',
      render: (value: string, row: BettingSite) => (
        <div className={styles.nameCell}>
          <div className={styles.name}>{value}</div>
          <div className={styles.description}>{row.description}</div>
        </div>
      ),
    },
    {
      key: 'website',
      header: 'Website',
      render: (value: string) => (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.websiteLink}
        >
          <ExternalLink size={14} />
          {value}
        </a>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value: boolean) => (
        <StatusBadge status={value ? 'active' : 'inactive'} />
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value: any, row: BettingSite) => (
        <div className={styles.actions}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(row)}
            disabled={updateBettingSite.isPending}
          >
            <Edit size={16} />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggleStatus(row)}
            disabled={toggleStatus.isPending}
          >
            {row.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
            {row.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setDeleteConfirm(row)}
            disabled={deleteBettingSite.isPending}
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Card>
          <CardContent>
            <div className={styles.loading}>Loading betting sites...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Card>
          <CardContent>
            <div className={styles.loading}>
              Error loading betting sites: {error.message}
              <br />
              <small>Check console for more details</small>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Betting Sites Management</h1>
          <p className={styles.subtitle}>Manage betting platforms and their settings</p>
        </div>
        <Button onClick={handleCreate} disabled={createBettingSite.isPending}>
          <Plus size={16} />
          Add Betting Site
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Betting Sites ({bettingSitesData?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={bettingSitesData?.bettingSites || []}
            columns={columns}
            loading={isLoading}
            emptyMessage="No betting sites found"
          />
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBettingSite ? 'Edit Betting Site' : 'Add New Betting Site'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Input
            label="Name"
            {...register('name')}
            error={errors.name?.message}
            placeholder="e.g., Arada Betting"
            helperText="The name of the betting platform"
            fullWidth
          />

          <Input
            label="Description"
            {...register('description')}
            error={errors.description?.message}
            placeholder="e.g., Arada Betting Platform - Sports betting and casino games"
            helperText="Brief description of the betting platform"
            fullWidth
          />

          <Input
            label="Website URL"
            {...register('website')}
            error={errors.website?.message}
            placeholder="https://arada-betting.com"
            helperText="The official website URL of the betting platform"
            fullWidth
          />

          <div className={styles.checkboxField}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                {...register('isActive')}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Active</span>
            </label>
            <p className={styles.checkboxHelper}>
              Active betting sites will be available for selection in transactions
            </p>
          </div>

          <div className={styles.formActions}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={createBettingSite.isPending || updateBettingSite.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createBettingSite.isPending || updateBettingSite.isPending}
            >
              {editingBettingSite ? 'Update' : 'Create'} Betting Site
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Betting Site"
      >
        <div className={styles.deleteConfirm}>
          <p>Are you sure you want to delete this betting site?</p>
          {deleteConfirm && (
            <div className={styles.deleteInfo}>
              <strong>{deleteConfirm.name}</strong>
              <span>{deleteConfirm.website}</span>
            </div>
          )}
          <p className={styles.deleteWarning}>
            This action cannot be undone. All transactions associated with this betting site will remain in the system.
          </p>
          <div className={styles.formActions}>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={deleteBettingSite.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteBettingSite.isPending}
            >
              Delete Betting Site
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
