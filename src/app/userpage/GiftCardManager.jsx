import { useState, useEffect } from 'react';
import { 
  Gift, 
  Plus, 
  Search, 
  Edit2, 
  Eye, 
  Filter,
  Calendar,
  User,
  Phone,
  DollarSign,
  CheckCircle,
  Clock,
  RefreshCw,
  CreditCard,
  X,
  Save
} from 'lucide-react';

export default function GiftCardManager() {
  const [giftCards, setGiftCards] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [massageTypes, setMassageTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [validateCardNumber, setValidateCardNumber] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    cardNumber: '',
    massageType: '',
    duration: '',
    originalPrice: '',
    purchasedBy: '',
    paymentMethod: 'cash',
    notes: ''
  });

  // Get user data and token
  const getUserData = () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  };

  const getToken = () => {
    // Try to get from cookie first, then localStorage
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='))
      ?.split('=')[1];
    
    return cookieToken || localStorage.getItem('authToken');
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://thaiback.onrender.com/api';
  const userData = getUserData();

  // Fetch data
  useEffect(() => {
    if (userData) {
      fetchAllData();
    }
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchGiftCards(),
        fetchCustomers(),
        fetchMassageTypes()
      ]);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGiftCards = async (status = statusFilter) => {
    try {
      const token = getToken();
      const url = `${API_BASE}/gift-cards/branch/${token}${status !== 'all' ? `?status=${status}` : ''}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setGiftCards(data);
      }
    } catch (error) {
      console.error('Gift cards fetch error:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/receptionist/customers/${token}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Customers fetch error:', error);
    }
  };

  const fetchMassageTypes = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/receptionist/massage-types/${token}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMassageTypes(data);
      }
    } catch (error) {
      console.error('Massage types fetch error:', error);
    }
  };

  // Generate new card number
  const generateCardNumber = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/gift-cards/generate-number/${token}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, cardNumber: data.cardNumber }));
      }
    } catch (error) {
      console.error('Generate card number error:', error);
    }
  };

  // Create gift card
  const createGiftCard = async () => {
    if (!formData.cardNumber || !formData.massageType || !formData.duration || !formData.purchasedBy) {
      alert('Zəhmət olmasa bütün sahələri doldurun!');
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch(`${API_BASE}/gift-cards/${token}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cardNumber: formData.cardNumber,
          massageType: formData.massageType,
          duration: parseInt(formData.duration),
          purchasedBy: formData.purchasedBy,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes
        })
      });

      if (response.ok) {
        await fetchGiftCards();
        resetForm();
        setShowAddModal(false);
        alert('Hədiyyə kartı uğurla yaradıldı!');
      } else {
        const error = await response.json();
        alert('Xəta: ' + (error.message || 'Hədiyyə kartı yaradılmadı'));
      }
    } catch (error) {
      console.error('Create gift card error:', error);
      alert('Hədiyyə kartı yaradılarkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  // Validate gift card
  const validateGiftCard = async () => {
    if (!validateCardNumber.trim()) {
      alert('Kart nömrəsini daxil edin!');
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${API_BASE}/gift-cards/validate/${validateCardNumber}/${token}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        alert('Hədiyyə kartı keçərlidir!\n\n' +
          `Kart nömrəsi: ${data.giftCard.cardNumber}\n` +
          `Masaj növü: ${data.giftCard.massageType.name}\n` +
          `Müddət: ${data.giftCard.duration} dəqiqə\n` +
          `Qiymət: ${data.giftCard.originalPrice} ₼\n` +
          `Alan: ${data.giftCard.purchasedBy.name}`
        );
      } else {
        alert(data.message || 'Hədiyyə kartı yoxlanmadı');
      }
    } catch (error) {
      console.error('Validate gift card error:', error);
      alert('Hədiyyə kartı yoxlanarkən xəta baş verdi');
    } finally {
      setLoading(false);
      setValidateCardNumber('');
      setShowValidateModal(false);
    }
  };

  // Update gift card
  const updateGiftCard = async () => {
    if (!selectedCard) return;

    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(`${API_BASE}/gift-cards/${selectedCard._id}/${token}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: selectedCard.notes
        })
      });

      if (response.ok) {
        await fetchGiftCards();
        setShowDetailModal(false);
        alert('Hədiyyə kartı yeniləndi!');
      } else {
        const error = await response.json();
        alert('Xəta: ' + (error.message || 'Hədiyyə kartı yenilənmədi'));
      }
    } catch (error) {
      console.error('Update gift card error:', error);
      alert('Hədiyyə kartı yeniləyərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      cardNumber: '',
      massageType: '',
      duration: '',
      originalPrice: '',
      purchasedBy: '',
      paymentMethod: 'cash',
      notes: ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusBadge = (card) => {
    if (card.isUsed) {
      return { text: 'İstifadə olunub', color: '#16a34a', bgColor: '#dcfce7' };
    } else {
      return { text: 'Aktiv', color: '#3b82f6', bgColor: '#dbeafe' };
    }
  };

  const getPaymentMethodText = (method) => {
    const methods = {
      'cash': 'Nağd',
      'card': 'Kart',
      'online': 'Online'
    };
    return methods[method] || method;
  };

  const getDurationsForMassageType = (massageTypeId) => {
    const type = massageTypes.find(mt => mt._id === massageTypeId);
    return type ? type.durations : [];
  };

  const updatePrice = (massageTypeId, duration) => {
    const type = massageTypes.find(mt => mt._id === massageTypeId);
    if (type && duration) {
      const durationObj = type.durations.find(d => d.minutes === parseInt(duration));
      if (durationObj) {
        const giftCardPrice = durationObj.price + 4;
        setFormData(prev => ({ ...prev, originalPrice: giftCardPrice.toString() }));
      }
    }
  };

  // Filter gift cards
  const filteredCards = giftCards.filter(card => {
    const matchesSearch = 
      card.cardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.purchasedBy?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.usedBy && card.usedBy.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'used' && card.isUsed) ||
      (statusFilter === 'active' && !card.isUsed);

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: giftCards.length,
    active: giftCards.filter(c => !c.isUsed).length,
    used: giftCards.filter(c => c.isUsed).length,
    revenue: giftCards.reduce((sum, c) => sum + c.originalPrice, 0)
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Gift size={24} color="#8b5cf6" />
          <div>
            <h2 style={styles.title}>Hədiyyə Kartları</h2>
            <p style={styles.subtitle}>Hədiyyə kartlarını idarə edin</p>
          </div>
        </div>

        <div style={styles.headerActions}>
          <button onClick={() => setShowValidateModal(true)} style={styles.validateBtn}>
            <Search size={16} />
            Yoxla
          </button>
          <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>
            <Plus size={16} />
            Yeni Kart
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.total}</div>
          <div style={styles.statLabel}>Ümumi Kart</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.active}</div>
          <div style={styles.statLabel}>Aktiv</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.used}</div>
          <div style={styles.statLabel}>İstifadə olunub</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.revenue} ₼</div>
          <div style={styles.statLabel}>Toplam Gəlir</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filtersContainer}>
        <div style={styles.searchContainer}>
          <Search size={16} color="#6b7280" />
          <input
            type="text"
            placeholder="Kart nömrəsi və ya müştəri adı ilə axtarın..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterContainer}>
          <Filter size={16} color="#6b7280" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              fetchGiftCards(e.target.value);
            }}
            style={styles.filterSelect}
          >
            <option value="all">Bütün kartlar</option>
            <option value="active">Aktiv kartlar</option>
            <option value="used">İstifadə olunmuş</option>
          </select>
        </div>

        <button onClick={() => fetchGiftCards()} style={styles.refreshBtn}>
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Gift Cards List */}
      <div style={styles.cardsContainer}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <RefreshCw size={24} className="animate-spin" />
            <span>Yüklənir...</span>
          </div>
        ) : filteredCards.length === 0 ? (
          <div style={styles.emptyState}>
            <Gift size={48} color="#9ca3af" />
            <h3>Hədiyyə kartı tapılmadı</h3>
            <p>Filtrlə uyğun gələn hədiyyə kartı yoxdur</p>
          </div>
        ) : (
          <div style={styles.cardsGrid}>
            {filteredCards.map(card => {
              const status = getStatusBadge(card);
              return (
                <div key={card._id} style={styles.cardItem}>
                  <div style={styles.cardHeader}>
                    <div style={styles.cardNumber}>{card.cardNumber}</div>
                    <div 
                      style={{
                        ...styles.statusBadge,
                        color: status.color,
                        backgroundColor: status.bgColor
                      }}
                    >
                      {status.text}
                    </div>
                  </div>

                  <div style={styles.cardInfo}>
                    <div style={styles.infoRow}>
                      <User size={14} />
                      <span>Alan: {card.purchasedBy?.name}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <Phone size={14} />
                      <span>{card.purchasedBy?.phone}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <Gift size={14} />
                      <span>{card.massageType?.name} ({card.duration} dəq)</span>
                    </div>
                    <div style={styles.infoRow}>
                      <DollarSign size={14} />
                      <span>{card.originalPrice} ₼</span>
                    </div>
                    <div style={styles.infoRow}>
                      <CreditCard size={14} />
                      <span>{getPaymentMethodText(card.paymentMethod)}</span>
                    </div>
                  </div>

                  <div style={styles.cardFooter}>
                    <div style={styles.dateInfo}>
                      <Calendar size={12} />
                      <span>Alınma: {formatDate(card.purchaseDate)}</span>
                    </div>
                    {card.isUsed && (
                      <div style={styles.dateInfo}>
                        <CheckCircle size={12} />
                        <span>İstifadə: {formatDate(card.usedDate)}</span>
                      </div>
                    )}
                  </div>

                  <div style={styles.cardActions}>
                    <button
                      onClick={() => {
                        setSelectedCard(card);
                        setShowDetailModal(true);
                      }}
                      style={styles.detailBtn}
                    >
                      <Eye size={14} />
                      Detallar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Yeni Hədiyyə Kartı</h3>
              <button onClick={() => setShowAddModal(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Kart Nömrəsi:</label>
                <div style={styles.cardNumberRow}>
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                    style={styles.input}
                    placeholder="Kart nömrəsi"
                  />
                  <button onClick={generateCardNumber} style={styles.generateBtn}>
                    Yarat
                  </button>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Müştəri:</label>
                <select
                  value={formData.purchasedBy}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchasedBy: e.target.value }))}
                  style={styles.select}
                >
                  <option value="">Müştəri seçin</option>
                  {customers.map(customer => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Masaj Növü:</label>
                  <select
                    value={formData.massageType}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, massageType: e.target.value, duration: '', originalPrice: '' }));
                    }}
                    style={styles.select}
                  >
                    <option value="">Masaj növü seçin</option>
                    {massageTypes.map(type => (
                      <option key={type._id} value={type._id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Müddət:</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, duration: e.target.value }));
                      updatePrice(formData.massageType, e.target.value);
                    }}
                    style={styles.select}
                    disabled={!formData.massageType}
                  >
                    <option value="">Müddət seçin</option>
                    {getDurationsForMassageType(formData.massageType).map(duration => (
                      <option key={duration.minutes} value={duration.minutes}>
                        {duration.minutes} dəqiqə - {duration.price} ₼
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Qiymət (₼):</label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                  style={styles.input}
                  placeholder="Qiymət"
                  readOnly
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Ödəniş Üsulu:</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  style={styles.select}
                >
                  <option value="cash">Nağd</option>
                  <option value="card">Kart</option>
                  <option value="online">Online</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Qeydlər:</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  style={styles.textarea}
                  rows={3}
                  placeholder="Əlavə qeydlər (istəyə bağlı)"
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setShowAddModal(false)} style={styles.cancelBtn}>
                Ləğv Et
              </button>
              <button onClick={createGiftCard} style={styles.saveBtn} disabled={loading}>
                <Save size={16} />
                {loading ? 'Saxlanır...' : 'Saxla'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedCard && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Hədiyyə Kartı Detalları</h3>
              <button onClick={() => setShowDetailModal(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.detailGrid}>
                <div style={styles.detailItem}>
                  <strong>Kart Nömrəsi:</strong>
                  <span>{selectedCard.cardNumber}</span>
                </div>
                <div style={styles.detailItem}>
                  <strong>Masaj Növü:</strong>
                  <span>{selectedCard.massageType?.name}</span>
                </div>
                <div style={styles.detailItem}>
                  <strong>Müddət:</strong>
                  <span>{selectedCard.duration} dəqiqə</span>
                </div>
                <div style={styles.detailItem}>
                  <strong>Qiymət:</strong>
                  <span>{selectedCard.originalPrice} ₼</span>
                </div>
                <div style={styles.detailItem}>
                  <strong>Ödəniş Üsulu:</strong>
                  <span>{getPaymentMethodText(selectedCard.paymentMethod)}</span>
                </div>
                <div style={styles.detailItem}>
                  <strong>Alan:</strong>
                  <span>{selectedCard.purchasedBy?.name}</span>
                </div>
                <div style={styles.detailItem}>
                  <strong>Telefon:</strong>
                  <span>{selectedCard.purchasedBy?.phone}</span>
                </div>
                <div style={styles.detailItem}>
                  <strong>Alınma Tarixi:</strong>
                  <span>{formatDate(selectedCard.purchaseDate)}</span>
                </div>
                <div style={styles.detailItem}>
                  <strong>Status:</strong>
                  <span style={{ color: selectedCard.isUsed ? '#16a34a' : '#3b82f6' }}>
                    {selectedCard.isUsed ? 'İstifadə olunub' : 'Aktiv'}
                  </span>
                </div>
                {selectedCard.isUsed && (
                  <>
                    <div style={styles.detailItem}>
                      <strong>İstifadə Edən:</strong>
                      <span>{selectedCard.usedBy?.name}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <strong>İstifadə Tarixi:</strong>
                      <span>{formatDate(selectedCard.usedDate)}</span>
                    </div>
                  </>
                )}
              </div>

              {!selectedCard.isUsed && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Qeydlər:</label>
                  <textarea
                    value={selectedCard.notes || ''}
                    onChange={(e) => setSelectedCard(prev => ({ ...prev, notes: e.target.value }))}
                    style={styles.textarea}
                    rows={3}
                    placeholder="Qeydlər əlavə edin"
                  />
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setShowDetailModal(false)} style={styles.cancelBtn}>
                Bağla
              </button>
              {!selectedCard.isUsed && (
                <button onClick={updateGiftCard} style={styles.saveBtn} disabled={loading}>
                  <Save size={16} />
                  {loading ? 'Saxlanır...' : 'Yenilə'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Validate Modal */}
      {showValidateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.smallModal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Hədiyyə Kartı Yoxla</h3>
              <button onClick={() => setShowValidateModal(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Kart Nömrəsi:</label>
                <input
                  type="text"
                  value={validateCardNumber}
                  onChange={(e) => setValidateCardNumber(e.target.value)}
                  style={styles.input}
                  placeholder="GC123456789"
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setShowValidateModal(false)} style={styles.cancelBtn}>
                Ləğv Et
              </button>
              <button onClick={validateGiftCard} style={styles.validateBtnModal} disabled={loading}>
                <Search size={16} />
                {loading ? 'Yoxlanır...' : 'Yoxla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    background: '#f8fafc',
    minHeight: '100vh'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },

  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 4px 0'
  },

  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },

  headerActions: {
    display: 'flex',
    gap: '12px'
  },

  validateBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    cursor: 'pointer'
  },

  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#8b5cf6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    cursor: 'pointer'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },

  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    textAlign: 'center'
  },

  statNumber: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '4px'
  },

  statLabel: {
    fontSize: '14px',
    color: '#64748b'
  },

  filtersContainer: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
    alignItems: 'center'
  },

  searchContainer: {
    position: 'relative',
    flex: 1,
    maxWidth: '400px'
  },

  searchInput: {
    width: '100%',
    padding: '10px 12px 10px 40px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },

  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  filterSelect: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'white'
  },

  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    background: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer'
  },

  cardsContainer: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '20px'
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    gap: '12px'
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    color: '#9ca3af',
    textAlign: 'center'
  },

  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },

  cardItem: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px',
    background: '#fafafa',
    transition: 'all 0.2s ease'
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },

  cardNumber: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    fontFamily: 'monospace'
  },

  statusBadge: {
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600'
  },

  cardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '12px'
  },

  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#374151'
  },

  cardFooter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '12px'
  },

  dateInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#6b7280'
  },

  cardActions: {
    display: 'flex',
    justifyContent: 'flex-end'
  },

  detailBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '12px',
    cursor: 'pointer'
  },

  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  },

  modal: {
    background: 'white',
    borderRadius: '12px',
    width: '600px',
    maxHeight: '80vh',
    overflow: 'auto'
  },

  smallModal: {
    background: 'white',
    borderRadius: '12px',
    width: '400px',
    maxHeight: '80vh',
    overflow: 'auto'
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e5e7eb'
  },

  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },

  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280'
  },

  modalBody: {
    padding: '20px'
  },

  formGroup: {
    marginBottom: '16px'
  },

  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px'
  },

  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },

  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },

  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    background: 'white'
  },

  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit'
  },

  cardNumberRow: {
    display: 'flex',
    gap: '8px'
  },

  generateBtn: {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },

  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '20px'
  },

  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '20px',
    borderTop: '1px solid #e5e7eb'
  },

  cancelBtn: {
    background: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    cursor: 'pointer'
  },

  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    cursor: 'pointer'
  },

  validateBtnModal: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    cursor: 'pointer'
  }
};