// src/components/StudentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { complaintsAPI } from '../services/api';

interface ComplaintItem {
  _id: string;
  itemName: string;
  category: string;
  location: string;
  dateFound: string;
  status: string;
  photo?: string | null;  
}


interface SummaryData {
  lost: number;
  matched: number;
  resolved: number;
}

interface AddComplaintFormProps {
  onClose: () => void;
  onSubmit: () => void;
}

const AddComplaintForm: React.FC<AddComplaintFormProps> = ({ onClose, onSubmit }) => {
  const [category, setCategory] = useState<string>("");
  const [itemName, setItemName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [dateFound, setDateFound] = useState<string>("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async () => {
    if (!category || !itemName || !location || !dateFound) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('itemName', itemName);
      formData.append('location', location);
      formData.append('dateFound', dateFound);
      if (photo) {
        formData.append('photo', photo);
      }

      await complaintsAPI.create(formData);

      setCategory("");
      setItemName("");
      setLocation("");
      setDateFound("");
      setPhoto(null);

      onSubmit();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCategory("");
    setItemName("");
    setLocation("");
    setDateFound("");
    setPhoto(null);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Add Lost Item</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block mb-2 font-semibold">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select category</option>
              <option value="Electronics">Electronics</option>
              <option value="Books">Books</option>
              <option value="Clothing">Clothing</option>
              <option value="Accessories">Accessories</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Item Name *</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="e.g., Black Wallet"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Location Found *</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="e.g., Library 2nd Floor"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Date Found *</label>
            <input
              type="date"
              value={dateFound}
              onChange={(e) => setDateFound(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Upload Photo (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface StudentDashboardProps {
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'complaints' | 'matched' | 'resolved'>('complaints');
  const [showAddComplaint, setShowAddComplaint] = useState<boolean>(false);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData>({ lost: 0, matched: 0, resolved: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  const { user } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [complaintsData, statsData] = await Promise.all([
        complaintsAPI.getAll(),
        complaintsAPI.getStats(),
      ]);
      setComplaints(complaintsData);
      setSummaryData(statsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteComplaint = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        await complaintsAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete complaint:', error);
        alert('Failed to delete complaint');
      }
    }
  };

  const matchedItems = complaints.filter(item => item.status === 'matched');
  const resolvedItems = complaints.filter(item => item.status === 'resolved');
  const pendingItems = complaints.filter(item => item.status === 'pending');

  const AddComplaintButton = () => (
    <button
      onClick={() => setShowAddComplaint(true)}
      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded shadow font-semibold transition-colors"
    >
      + Add Complaint
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Lost & Found</h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search complaints..."
            className="border rounded px-2 py-1"
          />
          <div className="relative">
            <button className="relative">
              🔔
              {matchedItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {matchedItems.length}
                </span>
              )}
            </button>
          </div>
          <span className="text-sm">{user?.name} ({user?.email})</span>
          <button
            onClick={onLogout}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 p-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-gray-500">My Lost Items</h2>
          <p className="text-2xl font-bold">{summaryData.lost}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-gray-500">Matched Items</h2>
          <p className="text-2xl font-bold">{summaryData.matched}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-gray-500">Resolved Cases</h2>
          <p className="text-2xl font-bold">{summaryData.resolved}</p>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="p-4">
        <div className="mb-4">
          <AddComplaintButton />
        </div>

        <div className="flex space-x-4 border-b items-center">
          <button
            className={`px-4 py-2 ${activeTab === 'complaints' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
            onClick={() => setActiveTab('complaints')}
          >
            My Complaints ({pendingItems.length})
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'matched' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
            onClick={() => setActiveTab('matched')}
          >
            Matched Items ({matchedItems.length})
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'resolved' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
            onClick={() => setActiveTab('resolved')}
          >
            Resolved Cases ({resolvedItems.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'complaints' && (
            <div className="space-y-2">
              {pendingItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending complaints</p>
              ) : (
                pendingItems.map(item => (
                  <div key={item._id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                    <div>
                      <span className="font-semibold">{item.itemName}</span>
                      <span className="text-gray-500"> - {item.category}</span>
                      <p className="text-sm text-gray-600">{item.location} • {new Date(item.dateFound).toLocaleDateString()}</p>
                    </div>
                    <div className="space-x-2">
                      <button className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600" onClick={() => handleDeleteComplaint(item._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'matched' && (
            <div className="space-y-2">
              {matchedItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No matched items yet</p>
              ) : (
                matchedItems.map(item => (
                  <div key={item._id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                    <div>
                      <span className="font-semibold">{item.itemName}</span>
                      <span className="text-green-600"> - Matched!</span>
                      <p className="text-sm text-gray-600">Please collect from lost & found office</p>
                    </div>
                    <button className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                      Mark as Collected
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'resolved' && (
            <div className="space-y-2">
              {resolvedItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No resolved cases</p>
              ) : (
                resolvedItems.map(item => (
                  <div key={item._id} className="bg-white p-4 rounded shadow">
                    <span className="font-semibold">{item.itemName}</span>
                    <span className="text-gray-500"> - Resolved ✓</span>
                    <p className="text-sm text-gray-600">{item.location} • {new Date(item.dateFound).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

            {/* Add Complaint Form Modal */}
      {showAddComplaint && (
        <AddComplaintForm
          onClose={() => setShowAddComplaint(false)}
          onSubmit={() => {
            setShowAddComplaint(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
