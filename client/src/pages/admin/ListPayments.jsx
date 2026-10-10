import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';

const ListPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [refundModal, setRefundModal] = useState(null);
  const [refundForm, setRefundForm] = useState({ amount: 0, reason: '' });
  const [stats, setStats] = useState({});
  
  const { getToken } = useAuth();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/payments/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (data.success) {
        setPayments(data.payments);
        setStats(data.stats);
      } else {
        toast.error(data.message || 'Failed to fetch payments');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleConfirmPayment = async (paymentId) => {
    try {
      const token = await getToken();
      const { data } = await axios.put(
        `${backendUrl}/api/payments/${paymentId}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        toast.success('Payment confirmed successfully');
        fetchPayments();
      } else {
        toast.error(data.message || 'Failed to confirm payment');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to confirm payment');
    }
  };

  const handleRefundPayment = async () => {
    if (!refundModal) return;
    
    try {
      const token = await getToken();
      const { data } = await axios.put(
        `${backendUrl}/api/payments/${refundModal._id}/refund`,
        {
          refundAmount: refundForm.amount || refundModal.amount,
          refundReason: refundForm.reason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        toast.success('Refund processed successfully');
        setRefundModal(null);
        setRefundForm({ amount: 0, reason: '' });
        fetchPayments();
      } else {
        toast.error(data.message || 'Failed to process refund');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to process refund');
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return;
    
    try {
      const token = await getToken();
      const { data } = await axios.delete(`${backendUrl}/api/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (data.success) {
        toast.success('Payment deleted successfully');
        fetchPayments();
      } else {
        toast.error(data.message || 'Failed to delete payment');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete payment');
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || badges.pending;
  };

  const getMethodBadge = (method) => {
    const badges = {
      cash: 'bg-green-50 text-green-700',
      card: 'bg-blue-50 text-blue-700',
      bank_transfer: 'bg-indigo-50 text-indigo-700',
      online: 'bg-purple-50 text-purple-700',
    };
    return badges[method] || 'bg-gray-50 text-gray-700';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Payment Management</h1>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="online">Online</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Total Payments</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalPayments || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">LKR {(stats.totalRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Pending Amount</p>
          <p className="text-2xl font-bold text-yellow-600">LKR {(stats.pendingAmount || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-blue-600">{stats.completedCount || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Receipt #</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-mono text-sm text-gray-900">{payment.receiptNumber || 'N/A'}</p>
                      {payment.transactionId && (
                        <p className="text-xs text-gray-500">TX: {payment.transactionId}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{payment.user?.username || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{payment.user?.email || ''}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {payment.currency || 'LKR'} {payment.amount?.toLocaleString()}
                      </p>
                      {payment.refundAmount > 0 && (
                        <p className="text-xs text-red-600">
                          Refunded: {payment.currency || 'LKR'} {payment.refundAmount?.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMethodBadge(payment.method)}`}>
                      {payment.method?.replace('_', ' ')}
                    </span>
                    {payment.cardLast4 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {payment.cardBrand} ****{payment.cardLast4}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(payment.createdAt)}
                    {payment.paidAt && payment.paidAt !== payment.createdAt && (
                      <p className="text-xs text-green-600">Paid: {formatDate(payment.paidAt)}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {payment.status === 'pending' && (
                        <button
                          onClick={() => handleConfirmPayment(payment._id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      {payment.status === 'completed' && (
                        <button
                          onClick={() => {
                            setRefundModal(payment);
                            setRefundForm({ amount: payment.amount, reason: '' });
                          }}
                          className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700 transition-colors"
                        >
                          Refund
                        </button>
                      )}
                      {payment.status !== 'completed' && (
                        <button
                          onClick={() => handleDeletePayment(payment._id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPayments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No payments found matching your criteria
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Process Refund</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                You are about to refund payment for {refundModal.user?.username || 'Unknown'}.
                Original amount: LKR {refundModal.amount?.toLocaleString()}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount (LKR)</label>
                <input
                  type="number"
                  value={refundForm.amount}
                  onChange={(e) => setRefundForm({ ...refundForm, amount: parseFloat(e.target.value) || 0 })}
                  max={refundModal.amount}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Max: LKR {refundModal.amount?.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Refund Reason</label>
                <textarea
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter reason for refund..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setRefundModal(null);
                  setRefundForm({ amount: 0, reason: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRefundPayment}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Process Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPayments;
