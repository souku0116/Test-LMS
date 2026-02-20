import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface FieldConfig {
  name: string;
  type: 'text' | 'number' | 'email' | 'select' | 'date' | 'textarea';
  required: boolean;
  options?: string[]; // For select
}

export const Fields = () => {
  const { role } = useAuth();
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tempFields, setTempFields] = useState<FieldConfig[]>([]);

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const data = await api.get('/fields');
      setFields(Array.isArray(data) ? data : []);
      setTempFields(Array.isArray(data) ? JSON.parse(JSON.stringify(data)) : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = () => {
    setTempFields([...tempFields, { name: '', type: 'text', required: false }]);
  };

  const handleRemoveField = (index: number) => {
    const newFields = [...tempFields];
    newFields.splice(index, 1);
    setTempFields(newFields);
  };

  const handleChange = (index: number, key: keyof FieldConfig, value: any) => {
    const newFields = [...tempFields];
    // @ts-ignore
    newFields[index][key] = value;
    setTempFields(newFields);
  };

  const handleOptionsChange = (index: number, value: string) => {
    const newFields = [...tempFields];
    newFields[index].options = value.split(',').map(s => s.trim());
    setTempFields(newFields);
  };

  const handleSave = async () => {
    try {
      // Validate
      if (tempFields.some(f => !f.name)) {
        toast.error('All fields must have a name');
        return;
      }
      await api.post('/fields', tempFields);
      setFields(tempFields);
      setIsEditing(false);
      toast.success('Fields configuration saved');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleCancel = () => {
    setTempFields(JSON.parse(JSON.stringify(fields)));
    setIsEditing(false);
  };

  if (loading) return <div>Loading...</div>;

  if (role !== 'admin' && role !== 'superadmin') {
    return <div>Access Denied</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Lead Fields Configuration</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Edit size={16} /> Edit Configuration
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              <X size={16} /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Required</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options (for Select)</th>
              {isEditing && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(!isEditing ? fields : tempFields).map((field, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      value={field.name}
                      onChange={(e) => handleChange(index, 'name', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 w-full"
                      placeholder="e.g. Phone Number"
                    />
                  ) : (
                    <span className="text-sm text-gray-900">{field.name}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <select
                      value={field.type}
                      onChange={(e) => handleChange(index, 'type', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 w-full"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="email">Email</option>
                      <option value="date">Date</option>
                      <option value="select">Select (Dropdown)</option>
                      <option value="textarea">Text Area</option>
                    </select>
                  ) : (
                    <span className="text-sm text-gray-500 capitalize">{field.type}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => handleChange(index, 'required', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${field.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {field.required ? 'Required' : 'Optional'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   {field.type === 'select' ? (
                     isEditing ? (
                       <input
                         value={field.options?.join(', ') || ''}
                         onChange={(e) => handleOptionsChange(index, e.target.value)}
                         className="border border-gray-300 rounded px-2 py-1 w-full"
                         placeholder="Option1, Option2, ..."
                       />
                     ) : (
                       <span className="text-sm text-gray-500">{field.options?.join(', ')}</span>
                     )
                   ) : <span className="text-gray-400 text-xs">-</span>}
                </td>
                {isEditing && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRemoveField(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {(!isEditing ? fields : tempFields).length === 0 && (
              <tr>
                <td colSpan={isEditing ? 5 : 4} className="px-6 py-4 text-center text-gray-500">
                  No fields configured yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {isEditing && (
          <div className="px-6 py-4 border-t border-gray-200">
             <button
                onClick={handleAddField}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500"
             >
               <Plus size={16} /> Add Field
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
