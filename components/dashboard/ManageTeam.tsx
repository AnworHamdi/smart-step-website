import React, { useState, useContext } from 'react';
import { DataContext } from '../../contexts/DataContext';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { TeamMember } from '../../types';
import TeamMemberFormModal from './TeamMemberFormModal';
import ConfirmationModal from '../ui/ConfirmationModal';

const ManageTeam: React.FC = () => {
  const { teamMembers, deleteTeamMember } = useContext(DataContext);
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  const handleEdit = (member: TeamMember) => {
    setMemberToEdit(member);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setMemberToEdit(null);
    setIsModalOpen(true);
  };

  const handleDelete = (member: TeamMember) => {
    setMemberToDelete(member);
  };

  const confirmDelete = () => {
    if (memberToDelete) {
      deleteTeamMember(memberToDelete.id);
      setMemberToDelete(null);
    }
  };

  return (
    <Card>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('dashboard.team.title')}</h2>
        <Button onClick={handleAddNew}>{t('dashboard.team.addMember')}</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('dashboard.team.table.photo')}</th>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('dashboard.team.table.name')}</th>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('dashboard.team.table.role')}</th>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('dashboard.team.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {teamMembers.length > 0 ? teamMembers.map((member) => (
              <tr key={member.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-black/10">
                <td className="px-6 py-4 whitespace-nowrap">
                  <img className="h-10 w-10 rounded-full object-cover" src={member.imageUrl} alt={t(member.name)} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{t(member.name)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{t(member.role)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 rtl:space-x-reverse">
                  <button onClick={() => handleEdit(member)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">{t('dashboard.team.edit')}</button>
                  <button onClick={() => handleDelete(member)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">{t('dashboard.team.delete')}</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-500 dark:text-gray-400">{t('dashboard.team.noMembers')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <TeamMemberFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          member={memberToEdit}
        />
      )}

      {memberToDelete && (
        <ConfirmationModal
          isOpen={!!memberToDelete}
          onClose={() => setMemberToDelete(null)}
          onConfirm={confirmDelete}
          title={t('dashboard.confirmDelete.title')}
          message={t('dashboard.confirmDelete.messageTeamMember')}
        />
      )}
    </Card>
  );
};

export default ManageTeam;