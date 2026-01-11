'use client'
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Camera, User, Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';


export default function Masajistler() {
  const [masajistler, setMasajistler] = useState([]);
  const [filiallar, setFiliallar] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newMasajist, setNewMasajist] = useState({
    name: '',
    phone: '',
    branch: '',
    image: null
  });
  const [editMasajist, setEditMasajist] = useState({
    name: '',
    phone: '',
    branch: '',
    image: null
  });

  // Token əldə etmə
  const getToken = () => {
        return Cookies.get('authToken');
  };

  // API endpoints
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://thaiback.onrender.com/api';

  // Filialları yükləmə
  const fetchFiliallar = async () => {
    try {
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
    }
  };

  // Masajistləri yükləmə
  const fetchMasajistler = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/masseurs/${token}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Masajistlər yüklənə bilmədi');
      }

      const data = await response.json();
      setMasajistler(data);
    } catch (error) {
      console.error('Masajistlər yükləmə xətası:', error);
      alert('Masajistlər yüklənərkən xəta baş verdi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Component yükləndikdə məlumatları əldə et
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchFiliallar(), fetchMasajistler()]);
    };
    loadData();
  }, []);

  // Şəkil yükləmə funksiyası
  const handleImageUpload = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target.result;
        if (isEdit) {
          setEditMasajist({...editMasajist, image: imageData});
        } else {
          setNewMasajist({...newMasajist, image: imageData});
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Zəhmət olmasa şəkil faylı seçin (JPG, PNG, GIF)');
    }
  };

  // Form validation
  const validateForm = (masajist) => {
    if (!masajist.name.trim()) {
      alert('Masajist adını daxil edin');
      return false;
    }
    if (!masajist.phone.trim()) {
      alert('Telefon nömrəsini daxil edin');
      return false;
    }
    if (!masajist.branch) {
      alert('Filial seçin');
      return false;
    }
    return true;
  };

  // Yeni masajist əlavə etmə
  const handleAdd = async () => {
    if (!validateForm(newMasajist)) {
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/masseurs/${token}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newMasajist.name.trim(),
          phone: newMasajist.phone.trim(),
          branch: newMasajist.branch,
          image: newMasajist.image
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Masajist əlavə edilə bilmədi');
      }

      const newMasajistData = await response.json();
      setMasajistler([...masajistler, newMasajistData]);
      setNewMasajist({ name: '', phone: '', branch: '', image: null });
      setShowAddForm(false);
      alert('Masajist uğurla əlavə edildi!');
    } catch (error) {
      console.error('Masajist əlavə etmə xətası:', error);
      alert('Masajist əlavə edilərkən xəta baş verdi: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Masajist silmə
  const handleDelete = async (id) => {
    if (!confirm('Bu masajisti silmək istədiyinizdən əminsiniz?')) {
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/masseurs/${id}/${token}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Masajist silinə bilmədi');
      }

      setMasajistler(masajistler.filter(m => m._id !== id));
      alert('Masajist uğurla silindi!');
    } catch (error) {
      console.error('Masajist silmə xətası:', error);
      alert('Masajist silinərkən xəta baş verdi: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Masajist redaktə etməyə başlama
  const startEdit = (masajist) => {
    setEditingId(masajist._id);
    setEditMasajist({
      name: masajist.name || '',
      phone: masajist.phone || '',
      branch: masajist.branch?._id || masajist.branch || '',
      image: masajist.image || null
    });
  };

  // Masajist redaktə etməni saxlama
  const handleEdit = async (id) => {
    if (!validateForm(editMasajist)) {
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/masseurs/${id}/${token}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editMasajist.name.trim(),
          phone: editMasajist.phone.trim(),
          branch: editMasajist.branch,
          image: editMasajist.image
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Masajist yenilənə bilmədi');
      }

      const updatedMasajist = await response.json();
      setMasajistler(masajistler.map(m => 
        m._id === id ? updatedMasajist : m
      ));
      setEditingId(null);
      setEditMasajist({ name: '', phone: '', branch: '', image: null });
      alert('Masajist uğurla yeniləndi!');
    } catch (error) {
      console.error('Masajist yeniləmə xətası:', error);
      alert('Masajist yenilənərkən xəta baş verdi: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Redaktə ləğv etmə
  const cancelEdit = () => {
    setEditingId(null);
    setEditMasajist({ name: '', phone: '', branch: '', image: null });
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <Loader2 size={32} style={{animation: 'spin 1s linear infinite'}} />
          <p style={styles.loadingText}>Masajistlər yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Masajistlər</h1>
        <button 
          style={styles.addButton}
          onClick={() => setShowAddForm(true)}
          disabled={submitting}
          onMouseOver={(e) => !submitting && (e.target.style.transform = 'translateY(-2px)')}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <Plus size={20} />
          Masajist Əlavə Et
        </button>
      </div>

      {/* Yeni Masajist Əlavə Etmə Formu */}
      {showAddForm && (
        <div style={styles.addForm}>
          {/* Şəkil yükləmə bölməsi */}
          <div style={styles.imageUploadSection}>
            <label style={styles.label}>Profil Şəkli:</label>
            <div style={styles.imageUploadContainer}>
              <div style={styles.imagePreview}>
                {newMasajist.image ? (
                  <img 
                    src={newMasajist.image} 
                    alt="Profil şəkli" 
                    style={styles.previewImage}
                  />
                ) : (
                  <div style={styles.noImage}>
                    <User size={40} color="#9ca3af" />
                    <span style={styles.noImageText}>Şəkil seçin</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, false)}
                style={styles.hiddenFileInput}
                id="imageUpload"
                disabled={submitting}
              />
              <label 
                htmlFor="imageUpload" 
                style={{
                  ...styles.imageUploadButton,
                  opacity: submitting ? 0.6 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                <Camera size={16} />
                Şəkil Yüklə
              </label>
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Ad və Soyad:</label>
              <input
                type="text"
                value={newMasajist.name}
                onChange={(e) => setNewMasajist({...newMasajist, name: e.target.value})}
                placeholder="Ad və soyadı daxil edin"
                style={styles.input}
                disabled={submitting}
                autoFocus
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Telefon:</label>
              <input
                type="tel"
                value={newMasajist.phone}
                onChange={(e) => setNewMasajist({...newMasajist, phone: e.target.value})}
                placeholder="+994501234567"
                style={styles.input}
                disabled={submitting}
              />
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Filial:</label>
            <select
              value={newMasajist.branch}
              onChange={(e) => setNewMasajist({...newMasajist, branch: e.target.value})}
              style={styles.select}
              disabled={submitting}
            >
              <option value="">Filial seçin</option>
              {filiallar.map((filial) => (
                <option key={filial._id} value={filial._id}>
                  {filial.name}
                </option>
              ))}
            </select>
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
                setNewMasajist({ name: '', phone: '', branch: '', image: null });
              }}
              disabled={submitting}
            >
              <X size={16} />
              Ləğv Et
            </button>
          </div>
        </div>
      )}

      {/* Masajistlər Cədvəli */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Şəkil</th>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Ad və Soyad</th>
              <th style={styles.th}>Telefon</th>
              <th style={styles.th}>Filial</th>
              <th style={styles.th}>Yaradılma Tarixi</th>
              <th style={styles.th}>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {masajistler.map((masajist, index) => (
              <tr key={masajist._id} style={styles.tableRow}>
                <td style={styles.td}>
                  {editingId === masajist._id ? (
                    <div style={styles.editImageContainer}>
                      <div style={styles.smallImagePreview}>
                        {editMasajist.image ? (
                          <img 
                            src={editMasajist.image} 
                            alt="Profil" 
                            style={styles.smallPreviewImage}
                          />
                        ) : (
                          <User size={24} color="#9ca3af" />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                        style={styles.hiddenFileInput}
                        id={`editImage-${masajist._id}`}
                        disabled={submitting}
                      />
                      <label 
                        htmlFor={`editImage-${masajist._id}`} 
                        style={{
                          ...styles.smallImageUploadButton,
                          opacity: submitting ? 0.6 : 1,
                          cursor: submitting ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <Camera size={12} />
                      </label>
                    </div>
                  ) : (
                    <div style={styles.profileImageContainer}>
                      {masajist.image ? (
                        <img 
                          src={masajist.image} 
                          alt={masajist.name}
                          style={styles.profileImage} 
                        />
                      ) : (
                        <div style={styles.defaultAvatar}>
                          <User size={24} color="#9ca3af" />
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td style={styles.td}>{index + 1}</td>
                <td style={styles.td}>
                  {editingId === masajist._id ? (
                    <input
                      type="text"
                      value={editMasajist.name}
                      onChange={(e) => setEditMasajist({...editMasajist, name: e.target.value})}
                      style={styles.editInput}
                      disabled={submitting}
                    />
                  ) : (
                    masajist.name
                  )}
                </td>
                <td style={styles.td}>
                  {editingId === masajist._id ? (
                    <input
                      type="tel"
                      value={editMasajist.phone}
                      onChange={(e) => setEditMasajist({...editMasajist, phone: e.target.value})}
                      style={styles.editInput}
                      disabled={submitting}
                    />
                  ) : (
                    masajist.phone
                  )}
                </td>
                <td style={styles.td}>
                  {editingId === masajist._id ? (
                    <select
                      value={editMasajist.branch}
                      onChange={(e) => setEditMasajist({...editMasajist, branch: e.target.value})}
                      style={styles.editSelect}
                      disabled={submitting}
                    >
                      {filiallar.map((filial) => (
                        <option key={filial._id} value={filial._id}>
                          {filial.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    masajist.branch?.name || 'Filial təyin edilməyib'
                  )}
                </td>
                <td style={styles.td}>
                  {new Date(masajist.createdAt || masajist.updatedAt).toLocaleDateString('az-AZ')}
                </td>
                <td style={styles.td}>
                  <div style={styles.actions}>
                    {editingId === masajist._id ? (
                      <>
                        <button
                          style={{
                            ...styles.saveActionButton,
                            opacity: submitting ? 0.6 : 1,
                            cursor: submitting ? 'not-allowed' : 'pointer'
                          }}
                          onClick={() => handleEdit(masajist._id)}
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
                          onClick={() => startEdit(masajist)}
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
                          onClick={() => handleDelete(masajist._id)}
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

      {masajistler.length === 0 && !loading && (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>Hələ ki heç bir masajist əlavə edilməyib.</p>
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

  imageUploadSection: {
    marginBottom: '24px'
  },

  imageUploadContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },

  imagePreview: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    border: '2px solid #e5e7eb',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f9fafb'
  },

  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },

  noImage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },

  noImageText: {
    fontSize: '10px',
    color: '#9ca3af'
  },

  hiddenFileInput: {
    display: 'none'
  },

  imageUploadButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },

  editImageContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  smallImagePreview: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f9fafb'
  },

  smallPreviewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },

  smallImageUploadButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '6px',
    cursor: 'pointer',
    fontSize: '12px'
  },

  profileImageContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  formRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px'
  },
  
  formGroup: {
    flex: 1,
    marginBottom: '16px'
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
    border: '1px solid #e2e8f0',
    overflowX: 'auto'
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '900px'
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
    verticalAlign: 'middle'
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
  
  profileImage: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #e5e7eb'
  },

  defaultAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    border: '2px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f9fafb'
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
}
