'use client'
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Clock, DollarSign } from 'lucide-react';
import Cookies from 'js-cookie';

export default function MasajNovleri() {
  const [masajNovleri, setMasajNovleri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newMasajNovu, setNewMasajNovu] = useState({
    name: '',
    description: '',
    durations: [{ minutes: 30, price: 25 }]
  });
  const [editMasajNovu, setEditMasajNovu] = useState({
    name: '',
    description: '',
    durations: []
  });

  // Token alma funksiyası
  const getToken = () => {
    return Cookies.get('authToken');
  };

  // API Base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://thaiback.onrender.com/api';

  // Masaj növlərini yüklə
  const fetchMassageTypes = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${API_BASE}/admin/massage-types/${token}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMasajNovleri(data);
      } else {
        console.error('Masaj növlərini yükləyərkən xəta:', response.statusText);
      }
    } catch (error) {
      console.error('Masaj növlərini yükləyərkən xəta:', error);
    } finally {
      setLoading(false);
    }
  };

  // Component mount olduqda məlumatları yüklə
  useEffect(() => {
    fetchMassageTypes();
  }, []);

  // Yeni duration əlavə etmə (Add formunda)
  const addNewDuration = () => {
    setNewMasajNovu({
      ...newMasajNovu,
      durations: [...newMasajNovu.durations, { minutes: 30, price: 25 }]
    });
  };

  // Duration silmə (Add formunda)
  const removeNewDuration = (index) => {
    const updatedDurations = newMasajNovu.durations.filter((_, i) => i !== index);
    setNewMasajNovu({
      ...newMasajNovu,
      durations: updatedDurations.length > 0 ? updatedDurations : [{ minutes: 30, price: 25 }]
    });
  };

  // Duration dəyişdirmə (Add formunda)
  const updateNewDuration = (index, field, value) => {
    const updatedDurations = newMasajNovu.durations.map((duration, i) => 
      i === index ? { ...duration, [field]: Number(value) || 0 } : duration
    );
    setNewMasajNovu({
      ...newMasajNovu,
      durations: updatedDurations
    });
  };

  // Edit formunda duration əməliyyatları
  const addEditDuration = () => {
    setEditMasajNovu({
      ...editMasajNovu,
      durations: [...editMasajNovu.durations, { minutes: 30, price: 25 }]
    });
  };

  const removeEditDuration = (index) => {
    const updatedDurations = editMasajNovu.durations.filter((_, i) => i !== index);
    setEditMasajNovu({
      ...editMasajNovu,
      durations: updatedDurations.length > 0 ? updatedDurations : [{ minutes: 30, price: 25 }]
    });
  };

  const updateEditDuration = (index, field, value) => {
    const updatedDurations = editMasajNovu.durations.map((duration, i) => 
      i === index ? { ...duration, [field]: Number(value) || 0 } : duration
    );
    setEditMasajNovu({
      ...editMasajNovu,
      durations: updatedDurations
    });
  };

  // Yeni masaj növü əlavə etmə
  const handleAdd = async () => {
    if (newMasajNovu.name.trim() && newMasajNovu.description.trim() && 
        newMasajNovu.durations.length > 0) {
      try {
        const token = getToken();
        const response = await fetch(`${API_BASE}/admin/massage-types/${token}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: newMasajNovu.name.trim(),
            description: newMasajNovu.description.trim(),
            durations: newMasajNovu.durations
          })
        });

        if (response.ok) {
          const newMassageType = await response.json();
          setMasajNovleri([...masajNovleri, newMassageType]);
          setNewMasajNovu({
            name: '',
            description: '',
            durations: [{ minutes: 30, price: 25 }]
          });
          setShowAddForm(false);
          alert('Masaj növü uğurla əlavə edildi!');
        } else {
          const error = await response.json();
          alert('Xəta: ' + (error.message || 'Masaj növü əlavə edilmədi'));
        }
      } catch (error) {
        console.error('Masaj növü əlavə edərkən xəta:', error);
        alert('Masaj növü əlavə edərkən xəta baş verdi');
      }
    } else {
      alert('Bütün sahələri doldurun və ən azı bir duration əlavə edin!');
    }
  };

  // Masaj növü silmə
  const handleDelete = async (id) => {
    if (confirm('Bu masaj növünü silmək istədiyinizdən əminsiniz?')) {
      try {
        const token = getToken();
        const response = await fetch(`${API_BASE}/admin/massage-types/${id}/${token}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setMasajNovleri(masajNovleri.filter(m => m._id !== id));
          alert('Masaj növü uğurla silindi!');
        } else {
          const error = await response.json();
          alert('Xəta: ' + (error.message || 'Masaj növü silinmədi'));
        }
      } catch (error) {
        console.error('Masaj növü silərkən xəta:', error);
        alert('Masaj növü silərkən xəta baş verdi');
      }
    }
  };

  // Masaj növü redaktə etməyə başlama
  const startEdit = (masajNovu) => {
    setEditingId(masajNovu._id);
    setEditMasajNovu({
      name: masajNovu.name,
      description: masajNovu.description,
      durations: [...masajNovu.durations]
    });
  };

  // Masaj növü redaktə etməni saxlama
  const handleEdit = async (id) => {
    if (editMasajNovu.name.trim() && editMasajNovu.description.trim() && 
        editMasajNovu.durations.length > 0) {
      try {
        const token = getToken();
        const response = await fetch(`${API_BASE}/admin/massage-types/${id}/${token}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: editMasajNovu.name.trim(),
            description: editMasajNovu.description.trim(),
            durations: editMasajNovu.durations
          })
        });

        if (response.ok) {
          const updatedMassageType = await response.json();
          setMasajNovleri(masajNovleri.map(m => 
            m._id === id ? updatedMassageType : m
          ));
          setEditingId(null);
          setEditMasajNovu({ name: '', description: '', durations: [] });
          alert('Masaj növü uğurla yeniləndi!');
        } else {
          const error = await response.json();
          alert('Xəta: ' + (error.message || 'Masaj növü yenilənmədi'));
        }
      } catch (error) {
        console.error('Masaj növü yeniləyərkən xəta:', error);
        alert('Masaj növü yeniləyərkən xəta baş verdi');
      }
    } else {
      alert('Ad, təsvir və ən azı bir duration mütləqdir!');
    }
  };

  // Redaktə ləğv etmə
  const cancelEdit = () => {
    setEditingId(null);
    setEditMasajNovu({ name: '', description: '', durations: [] });
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
        <h1 style={styles.title}>Masaj Növləri</h1>
        <button 
          style={styles.addButton}
          onClick={() => setShowAddForm(true)}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <Plus size={20} />
          Masaj Növü Əlavə Et
        </button>
      </div>

      {/* Yeni Masaj Növü Əlavə Etmə Formu */}
      {showAddForm && (
        <div style={styles.addForm}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Masaj Növünün Adı:</label>
              <input
                type="text"
                value={newMasajNovu.name}
                onChange={(e) => setNewMasajNovu({...newMasajNovu, name: e.target.value})}
                placeholder="Masaj növünün adını daxil edin"
                style={styles.input}
              />
            </div>
          </div>
          
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Təsvir:</label>
              <textarea
                value={newMasajNovu.description}
                onChange={(e) => setNewMasajNovu({...newMasajNovu, description: e.target.value})}
                placeholder="Masaj növünün təsvirini daxil edin"
                style={styles.textarea}
                rows={3}
              />
            </div>
          </div>

          {/* Durations */}
          <div style={styles.durationsSection}>
            <div style={styles.durationsHeader}>
              <label style={styles.label}>Müddət və Qiymətlər:</label>
              <button 
                type="button"
                onClick={addNewDuration}
                style={styles.addDurationButton}
              >
                <Plus size={16} />
                Müddət Əlavə Et
              </button>
            </div>
            
            {newMasajNovu.durations.map((duration, index) => (
              <div key={index} style={styles.durationRow}>
                <div style={styles.durationGroup}>
                  <label style={styles.smallLabel}>Dəqiqə:</label>
                  <input
                    type="number"
                    value={duration.minutes}
                    onChange={(e) => updateNewDuration(index, 'minutes', e.target.value)}
                    style={styles.smallInput}
                    min="1"
                  />
                </div>
                <div style={styles.durationGroup}>
                  <label style={styles.smallLabel}>Qiymət (AZN):</label>
                  <input
                    type="number"
                    value={duration.price}
                    onChange={(e) => updateNewDuration(index, 'price', e.target.value)}
                    style={styles.smallInput}
                    min="0"
                  />
                </div>
                {newMasajNovu.durations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeNewDuration(index)}
                    style={styles.removeDurationButton}
                    title="Bu müddəti sil"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
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
                setNewMasajNovu({
                  name: '',
                  description: '',
                  durations: [{ minutes: 30, price: 25 }]
                });
              }}
            >
              <X size={16} />
              Ləğv Et
            </button>
          </div>
        </div>
      )}

      {/* Masaj Növləri Siyahısı */}
      <div style={styles.massageList}>
        {masajNovleri.map((masajNovu) => (
          <div key={masajNovu._id} style={styles.massageCard}>
            {editingId === masajNovu._id ? (
              // Edit Mode
              <div style={styles.editMode}>
                <div style={styles.editFormRow}>
                  <div style={styles.editFormGroup}>
                    <label style={styles.label}>Ad:</label>
                    <input
                      type="text"
                      value={editMasajNovu.name}
                      onChange={(e) => setEditMasajNovu({...editMasajNovu, name: e.target.value})}
                      style={styles.editInput}
                    />
                  </div>
                </div>
                
                <div style={styles.editFormRow}>
                  <div style={styles.editFormGroup}>
                    <label style={styles.label}>Təsvir:</label>
                    <textarea
                      value={editMasajNovu.description}
                      onChange={(e) => setEditMasajNovu({...editMasajNovu, description: e.target.value})}
                      style={styles.editTextarea}
                      rows={3}
                    />
                  </div>
                </div>

                <div style={styles.editDurationsSection}>
                  <div style={styles.durationsHeader}>
                    <label style={styles.label}>Müddət və Qiymətlər:</label>
                    <button 
                      type="button"
                      onClick={addEditDuration}
                      style={styles.addDurationButton}
                    >
                      <Plus size={16} />
                      Müddət Əlavə Et
                    </button>
                  </div>
                  
                  {editMasajNovu.durations.map((duration, index) => (
                    <div key={index} style={styles.durationRow}>
                      <div style={styles.durationGroup}>
                        <label style={styles.smallLabel}>Dəqiqə:</label>
                        <input
                          type="number"
                          value={duration.minutes}
                          onChange={(e) => updateEditDuration(index, 'minutes', e.target.value)}
                          style={styles.smallInput}
                          min="1"
                        />
                      </div>
                      <div style={styles.durationGroup}>
                        <label style={styles.smallLabel}>Qiymət (AZN):</label>
                        <input
                          type="number"
                          value={duration.price}
                          onChange={(e) => updateEditDuration(index, 'price', e.target.value)}
                          style={styles.smallInput}
                          min="0"
                        />
                      </div>
                      {editMasajNovu.durations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEditDuration(index)}
                          style={styles.removeDurationButton}
                          title="Bu müddəti sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div style={styles.editActions}>
                  <button
                    style={styles.saveActionButton}
                    onClick={() => handleEdit(masajNovu._id)}
                  >
                    <Save size={16} />
                    Saxla
                  </button>
                  <button
                    style={styles.cancelActionButton}
                    onClick={cancelEdit}
                  >
                    <X size={16} />
                    Ləğv Et
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div style={styles.viewMode}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.massageTitle}>{masajNovu.name}</h3>
                  <div style={styles.cardActions}>
                    <button
                      style={styles.editButton}
                      onClick={() => startEdit(masajNovu)}
                      title="Redaktə Et"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      style={styles.deleteButton}
                      onClick={() => handleDelete(masajNovu._id)}
                      title="Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <p style={styles.massageDescription}>{masajNovu.description}</p>
                
                <div style={styles.durationsDisplay}>
                  <h4 style={styles.durationsTitle}>Mövcud Müddətlər:</h4>
                  <div style={styles.durationsList}>
                    {masajNovu.durations.map((duration, index) => (
                      <div key={index} style={styles.durationItem}>
                        <span style={styles.durationTime}>
                          <Clock size={14} />
                          {duration.minutes} dəq
                        </span>
                        <span style={styles.durationPrice}>
                          <DollarSign size={14} />
                          {duration.price} AZN
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {masajNovleri.length === 0 && !loading && (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>Hələ ki heç bir masaj növü əlavə edilməyib.</p>
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
  
  durationsSection: {
    marginBottom: '20px'
  },
  
  durationsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  
  addDurationButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  
  durationRow: {
    display: 'flex',
    alignItems: 'end',
    gap: '12px',
    marginBottom: '12px'
  },
  
  durationGroup: {
    flex: 1
  },
  
  smallLabel: {
    display: 'block',
    marginBottom: '4px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#374151'
  },
  
  smallInput: {
    width: '100%',
    padding: '8px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  
  removeDurationButton: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
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
  
  massageList: {
    display: 'grid',
    gap: '20px'
  },
  
  massageCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  },
  
  viewMode: {
    width: '100%'
  },
  
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },
  
  massageTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  
  cardActions: {
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
  
  massageDescription: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '16px',
    lineHeight: '1.5'
  },
  
  durationsDisplay: {
    marginTop: '16px'
  },
  
  durationsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '12px'
  },
  
  durationsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  
  durationItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#f3f4f6',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '14px'
  },
  
  durationTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#6b7280'
  },
  
  durationPrice: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#059669',
    fontWeight: '500'
  },
  
  // Edit Mode Styles
  editMode: {
    width: '100%'
  },
  
  editFormRow: {
    marginBottom: '16px'
  },
  
  editFormGroup: {
    flex: 1
  },
  
  editInput: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #667eea',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  
  editTextarea: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #667eea',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  
  editDurationsSection: {
    marginBottom: '20px'
  },
  
  editActions: {
    display: 'flex',
    gap: '8px'
  },
  
  saveActionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  
  cancelActionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
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