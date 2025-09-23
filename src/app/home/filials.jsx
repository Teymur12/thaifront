'use client'
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';


export default function Filiallar() {
  const [filiallar, setFiliallar] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newFilial, setNewFilial] = useState({
    name: '',
    address: '',
    phone: ''
  });
  const [editFilial, setEditFilial] = useState({
    name: '',
    address: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Token əldə etmə - localStorage və ya token context-dən
  const getToken = () => {
    return Cookies.get('authToken');
  };

  // API endpoints
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://thaiback.onrender.com/api';

  // Filialları yükləmə
  const fetchFiliallar = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/branches/${token}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Filiallar yüklənə bilmədi');
      }

      const data = await response.json();
      setFiliallar(data);
    } catch (error) {
      console.error('Filiallar yükləmə xətası:', error);
      alert('Filiallar yüklənərkən xəta baş verdi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Component yükləndikdə filialları əldə et
  useEffect(() => {
    fetchFiliallar();
  }, []);

  // Form validation
  const validateForm = (filial) => {
    if (!filial.name.trim()) {
      alert('Filial adını daxil edin');
      return false;
    }
    if (!filial.address.trim()) {
      alert('Filial adresini daxil edin');
      return false;
    }
    if (!filial.phone.trim()) {
      alert('Filial telefon nömrəsini daxil edin');
      return false;
    }
    return true;
  };

  // Yeni filial əlavə etmə
  const handleAdd = async () => {
    if (!validateForm(newFilial)) {
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/branches/${token}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newFilial.name.trim(),
          address: newFilial.address.trim(),
          phone: newFilial.phone.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Filial əlavə edilə bilmədi');
      }

      const newFilialData = await response.json();
      setFiliallar([...filiallar, newFilialData]);
      setNewFilial({ name: '', address: '', phone: '' });
      setShowAddForm(false);
      alert('Filial uğurla əlavə edildi!');
    } catch (error) {
      console.error('Filial əlavə etmə xətası:', error);
      alert('Filial əlavə edilərkən xəta baş verdi: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filial silmə
  const handleDelete = async (id) => {
    if (!confirm('Bu filialı silmək istədiyinizdən əminsiniz?')) {
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/branches/${id}/${token}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Filial silinə bilmədi');
      }

      setFiliallar(filiallar.filter(f => f._id !== id));
      alert('Filial uğurla silindi!');
    } catch (error) {
      console.error('Filial silmə xətası:', error);
      alert('Filial silinərkən xəta baş verdi: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filial redaktə etməyə başlama
  const startEdit = (filial) => {
    setEditingId(filial._id);
    setEditFilial({
      name: filial.name || '',
      address: filial.address || '',
      phone: filial.phone || ''
    });
  };

  // Filial redaktə etməni saxlama
  const handleEdit = async (id) => {
    if (!validateForm(editFilial)) {
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/branches/${id}/${token}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editFilial.name.trim(),
          address: editFilial.address.trim(),
          phone: editFilial.phone.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Filial yenilənə bilmədi');
      }

      const updatedFilial = await response.json();
      setFiliallar(filiallar.map(f => 
        f._id === id ? updatedFilial : f
      ));
      setEditingId(null);
      setEditFilial({ name: '', address: '', phone: '' });
      alert('Filial uğurla yeniləndi!');
    } catch (error) {
      console.error('Filial yeniləmə xətası:', error);
      alert('Filial yenilənərkən xəta baş verdi: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Redaktə ləğv etmə
  const cancelEdit = () => {
    setEditingId(null);
    setEditFilial({ name: '', address: '', phone: '' });
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <Loader2 size={32} style={{animation: 'spin 1s linear infinite'}} />
          <p style={styles.loadingText}>Filiallar yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Filiallar</h1>
        <button 
          style={styles.addButton}
          onClick={() => setShowAddForm(true)}
          disabled={submitting}
          onMouseOver={(e) => !submitting && (e.target.style.transform = 'translateY(-2px)')}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <Plus size={20} />
          Filial Əlavə Et
        </button>
      </div>

      {/* Yeni Filial Əlavə Etmə Formu */}
      {showAddForm && (
        <div style={styles.addForm}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Filial Adı:</label>
              <input
                type="text"
                value={newFilial.name}
                onChange={(e) => setNewFilial({ ...newFilial, name: e.target.value })}
                placeholder="Filial adını daxil edin"
                style={styles.input}
                disabled={submitting}
                autoFocus
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Telefon:</label>
              <input
                type="tel"
                value={newFilial.phone}
                onChange={(e) => setNewFilial({ ...newFilial, phone: e.target.value })}
                placeholder="Telefon nömrəsini daxil edin"
                style={styles.input}
                disabled={submitting}
              />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Adres:</label>
            <textarea
              value={newFilial.address}
              onChange={(e) => setNewFilial({ ...newFilial, address: e.target.value })}
              placeholder="Filial adresini daxil edin"
              style={styles.textarea}
              disabled={submitting}
              rows="3"
            />
          </div>
          <div style={styles.formActions}>
            <button 
              style={{
                ...styles.saveButton,
                opacity: submitting ? 0.6 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
              onClick={handleAdd}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 size={16} style={{animation: 'spin 1s linear infinite'}} />
              ) : (
                <Save size={16} />
              )}
              {submitting ? 'Saxlanır...' : 'Saxla'}
            </button>
            <button 
              style={styles.cancelButton}
              onClick={() => {
                setShowAddForm(false);
                setNewFilial({ name: '', address: '', phone: '' });
              }}
              disabled={submitting}
            >
              <X size={16} />
              Ləğv Et
            </button>
          </div>
        </div>
      )}

      {/* Filiallar Cədvəli */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Filial Adı</th>
              <th style={styles.th}>Adres</th>
              <th style={styles.th}>Telefon</th>
              <th style={styles.th}>Yaradılma Tarixi</th>
              <th style={styles.th}>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {filiallar.map((filial, index) => (
              <tr key={filial._id} style={styles.tableRow}>
                <td style={styles.td}>{index + 1}</td>
                <td style={styles.td}>
                  {editingId === filial._id ? (
                    <input
                      type="text"
                      value={editFilial.name}
                      onChange={(e) => setEditFilial({ ...editFilial, name: e.target.value })}
                      style={styles.editInput}
                      disabled={submitting}
                      autoFocus
                    />
                  ) : (
                    filial.name
                  )}
                </td>
                <td style={styles.td}>
                  {editingId === filial._id ? (
                    <textarea
                      value={editFilial.address}
                      onChange={(e) => setEditFilial({ ...editFilial, address: e.target.value })}
                      style={styles.editTextarea}
                      disabled={submitting}
                      rows="2"
                    />
                  ) : (
                    <div style={styles.addressCell}>
                      {filial.address || 'Adres əlavə edilməyib'}
                    </div>
                  )}
                </td>
                <td style={styles.td}>
                  {editingId === filial._id ? (
                    <input
                      type="tel"
                      value={editFilial.phone}
                      onChange={(e) => setEditFilial({ ...editFilial, phone: e.target.value })}
                      style={styles.editInput}
                      disabled={submitting}
                    />
                  ) : (
                    filial.phone || 'Telefon əlavə edilməyib'
                  )}
                </td>
                <td style={styles.td}>
                  {new Date(filial.createdAt || filial.updatedAt).toLocaleDateString('az-AZ')}
                </td>
                <td style={styles.td}>
                  <div style={styles.actions}>
                    {editingId === filial._id ? (
                      <>
                        <button
                          style={{
                            ...styles.saveActionButton,
                            opacity: submitting ? 0.6 : 1,
                            cursor: submitting ? 'not-allowed' : 'pointer'
                          }}
                          onClick={() => handleEdit(filial._id)}
                          title="Saxla"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <Loader2 size={16} style={{animation: 'spin 1s linear infinite'}} />
                          ) : (
                            <Save size={16} />
                          )}
                        </button>
                        <button
                          style={styles.cancelActionButton}
                          onClick={cancelEdit}
                          title="Ləğv Et"
                          disabled={submitting}
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          style={{
                            ...styles.editButton,
                            opacity: submitting ? 0.6 : 1,
                            cursor: submitting ? 'not-allowed' : 'pointer'
                          }}
                          onClick={() => startEdit(filial)}
                          title="Redaktə Et"
                          disabled={submitting}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          style={{
                            ...styles.deleteButton,
                            opacity: submitting ? 0.6 : 1,
                            cursor: submitting ? 'not-allowed' : 'pointer'
                          }}
                          onClick={() => handleDelete(filial._id)}
                          title="Sil"
                          disabled={submitting}
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filiallar.length === 0 && !loading && (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>Hələ ki heç bir filial əlavə edilməyib.</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1400px',
    background: '#f8fafc'
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  
  addForm: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  },

  formRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '16px'
  },
  
  formGroup: {
    flex: 1
  },
  
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box'
  },

  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  
  editInput: {
    width: '100%',
    padding: '8px 12px',
    border: '2px solid #667eea',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },

  editTextarea: {
    width: '100%',
    padding: '8px 12px',
    border: '2px solid #667eea',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  
  formActions: {
    display: 'flex',
    gap: '12px'
  },
  
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  
  tableContainer: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    overflowX: 'auto'
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '800px'
  },
  
  tableHeader: {
    background: '#f8fafc'
  },
  
  th: {
    padding: '16px 20px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    borderBottom: '1px solid #e5e7eb'
  },
  
  tableRow: {
    borderBottom: '1px solid #f3f4f6'
  },
  
  td: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#374151',
    verticalAlign: 'top'
  },

  addressCell: {
    maxWidth: '200px',
    wordWrap: 'break-word',
    whiteSpace: 'normal',
    lineHeight: '1.4'
  },
  
  actions: {
    display: 'flex',
    gap: '8px'
  },
  
  editButton: {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  deleteButton: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  saveActionButton: {
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  cancelActionButton: {
    background: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  
  emptyText: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },

  loadingText: {
    marginTop: '16px',
    fontSize: '16px',
    color: '#6b7280'
  }
};