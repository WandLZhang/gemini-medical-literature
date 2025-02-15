import React, { useState } from 'react';
import { Edit, Plus, X } from 'lucide-react';

const Sidebar = ({ 
  templates, 
  selectedTemplate, 
  setSelectedTemplate, 
  addTemplate, 
  editTemplate,
  expanded = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const handleTemplateChange = (e) => {
    const value = e.target.value;
    const newSelectedTemplate = templates.find(t => t.name === value) || null;
    setSelectedTemplate(newSelectedTemplate);
  };

  const handleSaveTemplate = () => {
    if (editingTemplate.name && editingTemplate.content) {
      if (editingTemplate.id) {
        editTemplate(editingTemplate.id, editingTemplate);
      } else {
        addTemplate(editingTemplate);
      }
      setIsModalOpen(false);
      setEditingTemplate(null);
    }
  };

  const openModal = (template = null) => {
    setEditingTemplate(template || { name: '', content: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingTemplate(null);
    setIsModalOpen(false);
  };

  return (
    <div className="px-2">
          <div className="flex items-center gap-2 mb-2">
            <select 
              className="flex-1 bg-gray-100 rounded p-1 text-xs"
              value={selectedTemplate ? selectedTemplate.name : ""}
              onChange={handleTemplateChange}
            >
              <option value="">Select a template</option>
              {templates.map(temp => (
                <option key={temp.id} value={temp.name}>{temp.name}</option>
              ))}
            </select>
            <button 
              onClick={() => openModal(selectedTemplate)}
              className="text-blue-500 hover:text-blue-600"
            >
              <Edit size={10} />
            </button>
            <button 
              onClick={() => openModal()}
              className="text-green-500 hover:text-green-600"
            >
              <Plus size={10} />
            </button>
          </div>
          <div className="space-y-2">
            <div>
              <label className="flex justify-center text-[10px] font-light text-gray-700 mb-1">Template Content</label>
              <div className={`w-full p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs ${expanded ? 'h-[80px]' : 'h-16'} overflow-y-auto`}>
                {selectedTemplate ? selectedTemplate.content : "Select a template to view its contents"}
              </div>
            </div>
          </div>
      {/* Template Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-3/4 max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingTemplate.id ? 'Edit Template' : 'New Template'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Template Name"
              value={editingTemplate.name}
              onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
              className="w-full p-2 mb-4 border rounded"
            />
            <textarea
              placeholder="Template Content"
              value={editingTemplate.content}
              onChange={(e) => setEditingTemplate({...editingTemplate, content: e.target.value})}
              className="w-full p-2 mb-4 border rounded h-64"
            />
            <div className="flex justify-end">
              <button 
                onClick={handleSaveTemplate}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
