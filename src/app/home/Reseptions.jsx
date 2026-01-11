'use client'
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
import Cookies from 'js-cookie';

export default function Reseptionlar() {
  const [reseptionlar, setReseptionlar] = useState([]);
  const [filiallar, setFiliallar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const [newReseption, setNewReseption] = useState({
    name: '',
    username: '',
    password: '',
    branch: ''
  });
  const [editReseption, setEditReseption] = useState({
    name: '',
    username: '',
    password: '',
    branch: ''
  });

  // Token alma funksiyası
  const getToken = () => {
    return Cookies.get('authToken');
  };

  // API Base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://thaiback.onrender.com/api';

  // Reseptionistləri yüklə
  const fetchReceptionists = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/receptionists/${token}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReseptionlar(data);
      } else {
        console.error('Reseptionistləri yükləyərkən xəta:', response.statusText);
      }
    } catch (error) {
      console.error('Reseptionistləri yükləyərkən xəta:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filialları yüklə
  const fetchBranches = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/branches/${token}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFiliallar(data);
      } else {
        console.error('Filialları yükləyərkən xəta:', response.statusText);
      }
    } catch (error) {
      console.error('Filialları yükləyərkən xəta:', error);
    }
  };

  // Component mount olduqda məlumatları yüklə
  useEffect(() => {
    fetchReceptionists();
    fetchBranches();
  }, []);

  // Parol görünürlüyünü dəyişdirmə
  const togglePasswordVisibility = (id) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Yeni reseption əlavə etmə
  const handleAdd = async () => {
    if (newReseption.name.trim() && newReseption.username.trim() && 
        newReseption.password.trim() && newReseption.branch) {
      try {
        const token = getToken();
        const response = await fetch(`${API_BASE}/admin/receptionists/${token}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: newReseption.name.trim(),
            username: newReseption.username.trim(),
            password: newReseption.password.trim(),
            role: 'receptionist',
            branch: newReseption.branch
          })
        });

        if (response.ok) {
          const newReceptionist = await response.json();
          setReseptionlar([...reseptionlar, newReceptionist]);
          setNewReseption({ name: '', username: '', password: '', branch: '' });
          setShowAddForm(false);
          alert('Reseption uğurla əlavə edildi!');
        } else {
          const error = await response.json();
          alert('Xəta: ' + (error.message || 'Reseption əlavə edilmədi'));
        }
      } catch (error) {
        console.error('Reseption əlavə edərkən xəta:', error);
        alert('Reseption əlavə edərkən xəta baş verdi');
      }
    } else {
      alert('Bütün sahələri doldurun!');
    }
  };

  // Reseption silmə
  const handleDelete = async (id) => {
    if (confirm('Bu reseptioni silmək istədiyinizdən əminsiniz?')) {
      try {
        const token = getToken();
        const response = await fetch(`${API_BASE}/admin/receptionists/${id}/${token}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setReseptionlar(reseptionlar.filter(r => r._id !== id));
          alert('Reseption uğurla silindi!');
        } else {
          const error = await response.json();
          alert('Xəta: ' + (error.message || 'Reseption silinmədi'));
        }
      } catch (error) {
        console.error('Reseption silərkən xəta:', error);
        alert('Reseption silərkən xəta baş verdi');
      }
    }
  };

  // Reseption redaktə etməyə başlama
  const startEdit = (reseption) => {
    setEditingId(reseption._id);
    setEditReseption({
      name: reseption.name,
      username: reseption.username,
      password: '', // Parol boş buraxılır, dəyişdirilmək istənməsə
      branch: reseption.branch?._id || reseption.branch
    });
  };

  // Reseption redaktə etməni saxlama
  const handleEdit = async (id) => {
    if (editReseption.name.trim() && editReseption.username.trim() && editReseption.branch) {
      try {
        const token = getToken();
        const updateData = {
          name: editReseption.name.trim(),
          username: editReseption.username.trim(),
          branch: editReseption.branch
        };

        // Yalnız parol daxil edilibsə, onu əlavə et
        if (editReseption.password.trim()) {
          updateData.password = editReseption.password.trim();
        }

        const response = await fetch(`${API_BASE}/admin/receptionists/${id}/${token}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        if (response.ok) {
          const updatedReceptionist = await response.json();
          setReseptionlar(reseptionlar.map(r => 
            r._id === id ? updatedReceptionist : r
          ));
          setEditingId(null);
          setEditReseption({ name: '', username: '', password: '', branch: '' });
          alert('Reseption uğurla yeniləndi!');
        } else {
          const error = await response.json();
          alert('Xəta: ' + (error.message || 'Reseption yenilənmədi'));
        }
      } catch (error) {
        console.error('Reseption yeniləyərkən xəta:', error);
        alert('Reseption yeniləyərkən xəta baş verdi');
      }
    } else {
      alert('Ad, istifadəçi adı və filial sahələri mütləqdir!');
    }
  };

  // Redaktə ləğv etmə
  const cancelEdit = () => {
    setEditingId(null);
    setEditReseption({ name: '', username: '', password: '', branch: '' });
  };

  // Filial adını tap
  const getBranchName = (branchId) => {
    if (typeof branchId === 'object' && branchId?.name) {
      return branchId.name;
    }
    const branch = filiallar.find(f => f._id === branchId);
    return branch ? branch.name : 'Naməlum filial';
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>Yüklənir...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Reseptionlar</h1>
        <button 
          style={styles.addButton}
          onClick={() => setShowAddForm(true)}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <Plus size={20} />
          Reseption Əlavə Et
        </button>
      </div>

      {/* Yeni Reseption Əlavə Etmə Formu */}
      {showAddForm && (
        <div style={styles.addForm}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Ad və Soyad:</label>
              <input
                type="text"
                value={newReseption.name}
                onChange={(e) => setNewReseption({...newReseption, name: e.target.value})}
                placeholder="Ad və soyadı daxil edin"
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>İstifadəçi adı:</label>
              <input
                type="text"
                value={newReseption.username}
                onChange={(e) => setNewReseption({...newReseption, username: e.target.value})}
                placeholder="İstifadəçi adını daxil edin"
                style={styles.input}
              />
            </div>
          </div>
          
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Parol:</label>
              <input
                type="password"
                value={newReseption.password}
                onChange={(e) => setNewReseption({...newReseption, password: e.target.value})}
                placeholder="Parolunu daxil edin"
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Filial:</label>
              <select
                value={newReseption.branch}
                onChange={(e) => setNewReseption({...newReseption, branch: e.target.value})}
                style={styles.select}
              >
                <option value="">Filial seçin</option>
                {filiallar.map((filial) => (
                  <option key={filial._id} value={filial._id}>{filial.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div style={styles.formActions}>
            <button 
              style={styles.saveButton}
              onClick={handleAdd}
            >
              <Save size={16} />
              Saxla
            </button>
            <button 
              style={styles.cancelButton}
              onClick={() => {
                setShowAddForm(false);
                setNewReseption({ name: '', username: '', password: '', branch: '' });
              }}
            >
              <X size={16} />
              Ləğv Et
            </button>
          </div>
        </div>
      )}

      {/* Reseptionlar Cədvəli */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Ad və Soyad</th>
              <th style={styles.th}>İstifadəçi Adı</th>
              <th style={styles.th}>Filial</th>
              <th style={styles.th}>Parol</th>
              <th style={styles.th}>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {reseptionlar.map((reseption, index) => (
              <tr key={reseption._id} style={styles.tableRow}>
                <td style={styles.td}>{index + 1}</td>
                <td style={styles.td}>
                  {editingId === reseption._id ? (
                    <input
                      type="text"
                      value={editReseption.name}
                      onChange={(e) => setEditReseption({...editReseption, name: e.target.value})}
                      style={styles.editInput}
                    />
                  ) : (
                    reseption.name
                  )}
                </td>
                <td style={styles.td}>
                  {editingId === reseption._id ? (
                    <input
                      type="text"
                      value={editReseption.username}
                      onChange={(e) => setEditReseption({...editReseption, username: e.target.value})}
                      style={styles.editInput}
                    />
                  ) : (
                    reseption.username
                  )}
                </td>
                <td style={styles.td}>
                  {editingId === reseption._id ? (
                    <select
                      value={editReseption.branch}
                      onChange={(e) => setEditReseption({...editReseption, branch: e.target.value})}
                      style={styles.editSelect}
                    >
                      <option value="">Filial seçin</option>
                      {filiallar.map((filial) => (
                        <option key={filial._id} value={filial._id}>{filial.name}</option>
                      ))}
                    </select>
                  ) : (
                    getBranchName(reseption.branch)
                  )}
                </td>
                <td style={styles.td}>
                  <div style={styles.passwordCell}>
                    {editingId === reseption._id ? (
                      <input
                        type="password"
                        value={editReseption.password}
                        onChange={(e) => setEditReseption({...editReseption, password: e.target.value})}
                        placeholder="Yeni parol (boş buraxsanız dəyişməz)"
                        style={styles.editInput}
                      />
                    ) : (
                      <>
                        <span style={styles.passwordText}>
                          {showPasswords[reseption._id] ? '••••••••' : '••••••••'}
                        </span>
                        <button
                          style={styles.eyeButton}
                          onClick={() => togglePasswordVisibility(reseption._id)}
                          title={showPasswords[reseption._id] ? 'Parolunu gizlə' : 'Parolunu göstər'}
                        >
                          {showPasswords[reseption._id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </>
                    )}
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={styles.actions}>
                    {editingId === reseption._id ? (
                      <>
                        <button
                          style={styles.saveActionButton}
                          onClick={() => handleEdit(reseption._id)}
                          title="Saxla"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          style={styles.cancelActionButton}
                          onClick={cancelEdit}
                          title="Ləğv Et"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          style={styles.editButton}
                          onClick={() => startEdit(reseption)}
                          title="Redaktə Et"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          style={styles.deleteButton}
                          onClick={() => handleDelete(reseption._id)}
                          title="Sil"
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

      {reseptionlar.length === 0 && !loading && (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>Hələ ki heç bir reseption əlavə edilməyib.</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1200px',
    background: '#f8fafc'
  },
  
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '400px'
  },
  
  loading: {
    fontSize: '18px',
    color: '#6b7280'
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
    gap: '16px',
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
  
  select: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
    background: 'white'
  },
  
  editInput: {
    width: '100%',
    padding: '8px 12px',
    border: '2px solid #667eea',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  
  editSelect: {
    width: '100%',
    padding: '8px 12px',
    border: '2px solid #667eea',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    background: 'white'
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
    border: '1px solid #e2e8f0'
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse'
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
    color: '#374151'
  },
  
  passwordCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  passwordText: {
    fontFamily: 'monospace',
    fontSize: '13px'
  },
  
  eyeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.2s ease'
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
  }
};