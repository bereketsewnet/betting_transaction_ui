import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Lock, Power } from 'lucide-react';
import { useAdminUsers, useCreateUser, useUpdateUser, useChangeUserPassword, useToggleUserStatus, useDeleteUser, useRoles, useUserStatistics } from '@/api/hooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { DataTable, Column } from '@/components/ui/DataTable/DataTable';
import { Modal } from '@/components/ui/Modal/Modal';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { User } from '@/types';
import styles from './Users.module.css';

const userSchema = z.object({
  username: z.string().min(1, 'Email is required').email('Must be a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  displayName: z.string().min(1, 'Display name is required'),
  phone: z.string().optional(),
  roleId: z.string().min(1, 'Role is required'),
  isActive: z.boolean(),
});

const passwordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type UserFormData = z.infer<typeof userSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export const Users: React.FC = () => {
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordUserId, setPasswordUserId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const filters = {
    ...(roleFilter && { role: parseInt(roleFilter) }),
    ...(searchTerm && { search: searchTerm }),
  };

  const { data: usersData, isLoading, error: usersError } = useAdminUsers(page, 20, filters);
  const { data: rolesData, error: rolesError } = useRoles();
  const { data: statsData, error: statsError } = useUserStatistics();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const passwordMutation = useChangeUserPassword();
  const toggleStatusMutation = useToggleUserStatus();
  const deleteMutation = useDeleteUser();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      isActive: true,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const handleAdd = () => {
    reset({ username: '', password: '', displayName: '', roleId: '', isActive: true });
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setValue('username', user.username);
    setValue('displayName', user.displayName);
    setValue('phone', user.phone || '');
    setValue('roleId', user.roleId.toString());
    setValue('isActive', user.isActive);
    setIsModalOpen(true);
  };

  const handleChangePassword = (userId: number) => {
    setPasswordUserId(userId);
    resetPassword();
    setIsPasswordModalOpen(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleStatusMutation.mutateAsync(id);
    } catch (error) {
      console.error('Toggle status failed:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      const payload = {
        username: data.username,
        displayName: data.displayName,
        phone: data.phone,
        roleId: parseInt(data.roleId),
        isActive: data.isActive,
        ...((!editingUser && data.password) && { password: data.password }),
      };

      if (editingUser) {
        console.log('Updating user:', editingUser.id, 'with data:', payload);
        await updateMutation.mutateAsync({ id: editingUser.id, data: payload });
      } else {
        if (!data.password) {
          alert('Password is required for new users');
          return;
        }
        await createMutation.mutateAsync({ ...payload, password: data.password });
      }
      setIsModalOpen(false);
      reset();
    } catch (error: any) {
      console.error('Save failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Request data:', {
        username: data.username,
        displayName: data.displayName,
        phone: data.phone,
        roleId: parseInt(data.roleId),
        isActive: data.isActive,
        ...((!editingUser && data.password) && { password: data.password }),
      });
      
      // Show specific error message
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to save user';
      alert(`Save failed: ${errorMessage}`);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!passwordUserId) return;
    try {
      await passwordMutation.mutateAsync({ 
        id: passwordUserId, 
        data: { newPassword: data.newPassword } 
      });
      setIsPasswordModalOpen(false);
      resetPassword();
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Password change failed:', error);
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (value) => <span>#{value}</span>,
    },
    {
      key: 'username',
      header: 'Username',
      render: (value) => <span className={styles.username}>{value}</span>,
    },
    {
      key: 'displayName',
      header: 'Display Name',
    },
    {
      key: 'role',
      header: 'Role',
      render: (_value, row) => (
        <span className={styles.roleBadge}>
          {row.role?.name?.toUpperCase() || 'N/A'}
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
          <Button size="sm" variant="outline" onClick={() => handleEdit(row)} title="Edit">
            <Edit2 size={16} />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleChangePassword(row.id)} title="Change Password">
            <Lock size={16} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggleStatus(row.id)}
            title={row.isActive ? 'Deactivate' : 'Activate'}
          >
            <Power size={16} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDeleteConfirmId(row.id)}
            title="Delete"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  // Show error message if backend endpoints don't exist
  if (usersError || rolesError || statsError) {
    return (
      <div className={styles.container}>
        <Card>
          <CardContent>
            <div className={styles.error}>
              <h3>⚠️ Backend Endpoints Not Available</h3>
              <p>The User Management endpoints are not implemented in your backend yet.</p>
              <p>Please implement these endpoints in your backend:</p>
              <ul>
                <li><code>GET /api/v1/admin/users</code></li>
                <li><code>POST /api/v1/admin/users</code></li>
                <li><code>PUT /api/v1/admin/users/:id</code></li>
                <li><code>DELETE /api/v1/admin/users/:id</code></li>
                <li><code>GET /api/v1/admin/roles</code></li>
                <li><code>GET /api/v1/admin/users/statistics</code></li>
              </ul>
              <p>Check your Postman collection for the correct implementation.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Statistics Cards */}
      {statsData && (
        <div className={styles.statsGrid}>
          <Card>
            <CardContent padding="md">
              <div className={styles.statCard}>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Total Users</span>
                  <span className={styles.statValue}>{statsData.statistics.totalUsers}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent padding="md">
              <div className={styles.statCard}>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Active Users</span>
                  <span className={styles.statValue}>
                    {usersData?.users?.filter(u => u.isActive).length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent padding="md">
              <div className={styles.statCard}>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Inactive Users</span>
                  <span className={styles.statValue}>
                    {usersData?.users?.filter(u => !u.isActive).length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent padding="md">
              <div className={styles.statCard}>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Recent Users</span>
                  <span className={styles.statValue}>
                    {usersData?.users?.filter(u => {
                      const createdDate = new Date(u.createdAt);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return createdDate >= weekAgo;
                    }).length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className={styles.header}>
            <CardTitle>User Management</CardTitle>
            <div className={styles.headerActions}>
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Roles' },
                  ...(rolesData?.roles.map(role => ({
                    value: role.id.toString(),
                    label: role.name.charAt(0).toUpperCase() + role.name.slice(1),
                  })) || [])
                ]}
                className={styles.filterSelect}
              />
              <Button onClick={handleAdd}>
                <Plus size={20} />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent padding="none">
          {isLoading ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            <DataTable
              data={usersData?.users || []}
              columns={columns}
              pagination={{
                currentPage: usersData?.pagination?.page || 1,
                totalPages: usersData?.pagination?.pages || 1,
                onPageChange: setPage,
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Create/Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Input
            label="Email"
            type="email"
            {...register('username')}
            error={errors.username?.message}
            disabled={!!editingUser}
            helperText="This will be used as the login username"
          />

          {!editingUser && (
            <Input
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              helperText="Minimum 8 characters"
            />
          )}

          <Input
            label="Display Name"
            {...register('displayName')}
            error={errors.displayName?.message}
            helperText="Full name to display in the system"
          />

          <Input
            label="Phone (Optional)"
            type="tel"
            {...register('phone')}
            error={errors.phone?.message}
            placeholder="+1234567890"
            helperText="Phone number for contact"
          />

          <Select
            label="Role"
            {...register('roleId')}
            options={rolesData?.roles.map(role => ({
              value: role.id.toString(),
              label: role.name.charAt(0).toUpperCase() + role.name.slice(1),
            })) || []}
            error={errors.roleId?.message}
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
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change User Password"
      >
        <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className={styles.form}>
          <Input
            label="New Password"
            type="password"
            {...registerPassword('newPassword')}
            error={passwordErrors.newPassword?.message}
          />

          <Input
            label="Confirm Password"
            type="password"
            {...registerPassword('confirmPassword')}
            error={passwordErrors.confirmPassword?.message}
          />

          <div className={styles.modalActions}>
            <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={passwordMutation.isPending}>
              Change Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Delete"
      >
        <div className={styles.confirmDelete}>
          <p>Are you sure you want to delete this user? This action cannot be undone.</p>
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

