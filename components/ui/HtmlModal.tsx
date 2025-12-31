
import React from 'react';
import Modal from './Modal';

interface HtmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  htmlContent: string;
}

const HtmlModal: React.FC<HtmlModalProps> = ({ isOpen, onClose, title, htmlContent }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div 
        className="prose prose-sm max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </Modal>
  );
};

export default HtmlModal;