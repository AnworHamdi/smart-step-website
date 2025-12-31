
import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { useTranslation } from '../../hooks/useTranslation';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <Button variant="secondary" onClick={onClose}>
            {t('dashboard.confirmDelete.cancel')}
          </Button>
          <button
            onClick={onConfirm}
            className="px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-opacity-50 bg-red-600 text-white shadow-lg hover:shadow-xl focus:ring-red-300 hover:-translate-y-0.5"
          >
            {t('dashboard.confirmDelete.confirm')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;