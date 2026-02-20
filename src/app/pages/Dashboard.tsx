import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router';

export const Dashboard = () => {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({
    totalLeads: 0,
    myLeads: 0,
    totalUsers: 0,
    recentLeads: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const leads = await api.get('/leads');
        const users = (role === 'admin' || role === 'superadmin') ? await api.get('/users') : [];
        
        setStats({
          totalLeads: leads.length,
          myLeads: leads.filter((l: any) => l.created_by === user.id).length,
          totalUsers: users.length,
          recentLeads: leads.slice(0, 5)
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, role]);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Leads</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{stats.totalLeads}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">My Leads</dt>
                  <dd className="text-3xl font-semibold text-gray-900">{stats.myLeads}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {(role === 'admin' || role === 'superadmin') && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{stats.totalUsers}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Leads</h3>
          <Link to="/leads" className="text-sm text-blue-600 hover:text-blue-500">View all</Link>
        </div>
        <ul className="divide-y divide-gray-200">
          {stats.recentLeads.length === 0 ? (
            <li className="px-4 py-4 sm:px-6 text-gray-500 text-sm">No leads found.</li>
          ) : (
            stats.recentLeads.map((lead) => (
              <li key={lead.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                 <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-blue-600 truncate">
                      {/* Try to find a 'name' or 'title' or 'company' field in data, fallback to ID */}
                      {lead.data?.Name || lead.data?.Company || lead.data?.Title || lead.id}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {lead.status || 'New'}
                      </p>
                    </div>
                 </div>
                 <div className="mt-2 sm:flex sm:justify-between">
                   <div className="sm:flex">
                     <p className="flex items-center text-sm text-gray-500">
                       <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                       {new Date(lead.created_at).toLocaleDateString()}
                     </p>
                   </div>
                 </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};
