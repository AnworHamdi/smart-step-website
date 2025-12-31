import React, { useState, useContext } from 'react';
import { DataContext } from '../../contexts/DataContext';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { User } from '../../types';
import UserFormModal from './UserFormModal';
import ConfirmationModal from '../ui/ConfirmationModal';

const SUPER_ADMIN_EMAIL = 'arbh.ly@gmail.com';

const ManageUsers: React.FC = () => {
  const { users, deleteUser } = useContext(DataContext);
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleEdit = (user: User) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('dashboard.users.title')}</h2>
        <Button onClick={handleAddNew}>{t('dashboard.users.addUser')}</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.users.table.email')}</th>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.users.table.role')}</th>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.users.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length > 0 ? users.map((user) => {
              const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;
              return (
                <tr key={user.id} className="odd:bg-white even:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Badge color={user.role === 'Super admin' ? 'purple' : user.role === 'admin' ? 'blue' : 'gray'}>
                      {user.role === 'Super admin' ? 'Super Admin' : t(user.role === 'admin' ? 'dashboard.users.roleAdmin' : 'dashboard.users.roleEmployee')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 rtl:space-x-reverse">
                    <button onClick={() => handleEdit(user)} className={`text-blue-600 hover:text-blue-900 ${isSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isSuperAdmin}>
                      {t('dashboard.users.edit')}
                    </button>
                    <button onClick={() => handleDelete(user)} className={`text-red-600 hover:text-red-900 ${isSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isSuperAdmin}>
                      {t('dashboard.users.delete')}
                    </button>
                  </td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan={3} className="text-center py-10 text-gray-500">{t('dashboard.users.noUsers')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <UserFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={userToEdit}
        />
      )}

      {userToDelete && (
        <ConfirmationModal
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={confirmDelete}
          title={t('dashboard.confirmDelete.title')}
          message={t('dashboard.confirmDelete.messageUser')}
        />
      )}
    </Card>
  );
};

export default ManageUsers;