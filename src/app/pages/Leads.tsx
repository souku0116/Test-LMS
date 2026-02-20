import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../context/AuthContext';
import { Lead, FieldConfig } from '../../types';
import { Plus, Trash, Edit, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export const Leads = () => {
  const { role, user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leadsData, fieldsData] = await Promise.all([
        api.get('/leads'),
        api.get('/fields')
      ]);
      setLeads(leadsData);
      setFields(fieldsData);
    } catch (e) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      setLeads(leads.filter(l => l.id !== id));
      toast.success('Lead deleted');
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete lead');
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormData(lead.data || {});
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingLead(null);
    setFormData({});
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLead) {
        const updated = await api.put(`/leads/${editingLead.id}`, {
          data: formData,
          status: editingLead.status
        });
        setLeads(leads.map(l => l.id === updated.id ? updated : l));
        toast.success('Lead updated');
      } else {
        const created = await api.post('/leads', {
          data: formData,
          status: 'New'
        });
        setLeads([created, ...leads]);
        toast.success('Lead created');
      }
      setShowModal(false);
    } catch (e: any) {
      toast.error(e.message || 'Operation failed');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const searchString = JSON.stringify(lead.data).toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  if (loading) return <div>Loading leads...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {fields.map((field) => (
                <th key={field.name} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {field.name}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                {fields.map((field) => (
                  <td key={field.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.data?.[field.name]?.toString() || '-'}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                     lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                     lead.status === 'Converted' ? 'bg-green-100 text-green-800' :
                     'bg-gray-100 text-gray-800'
                   }`}>
                     {lead.status}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(lead.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(lead)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Edit size={16} />
                  </button>
                  {(role === 'admin' || role === 'superadmin') && (
                    <button
                      onClick={() => handleDelete(lead.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={fields.length + 3} className="px-6 py-4 text-center text-gray-500">
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{editingLead ? 'Edit Lead' : 'Add New Lead'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.name} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="">Select...</option>
                      {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                      rows={3}
                    />
                  ) : (
                    <input
                      type={field.type}
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  )}
                </div>
              ))}
              
              {editingLead && (
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                   <select
                     value={editingLead.status}
                     onChange={(e) => setEditingLead({ ...editingLead, status: e.target.value as any })}
                     className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                   >
                     <option value="New">New</option>
                     <option value="Contacted">Contacted</option>
                     <option value="Qualified">Qualified</option>
                     <option value="Lost">Lost</option>
                     <option value="Converted">Converted</option>
                   </select>
                 </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingLead ? 'Update Lead' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
