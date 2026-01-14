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
  Save,
  Trash2
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
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');

  // YENİ: Multi-massage support
  const [massageList, setMassageList] = useState([{ massageType: '', duration: '' }]);
  const [isMultiMassage, setIsMultiMassage] = useState(false);

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

  // YENİ: Multi-massage functions
  const addMassageToList = () => {
    setMassageList([...massageList, { massageType: '', duration: '' }]);
  };

  const removeMassageFromList = (index) => {
    if (massageList.length > 1) {
      setMassageList(massageList.filter((_, i) => i !== index));
    }
  };

  const updateMassageInList = (index, field, value) => {
    const updated = [...massageList];
    updated[index][field] = value;
    setMassageList(updated);
  };

  // Create gift card
  const createGiftCard = async () => {
    if (!formData.cardNumber || !formData.purchasedBy) {
      alert('Zəhmət olmasa kart nömrəsi və müştəri seçin!');
      return;
    }

    // YENİ: Multi-massage validation
    if (isMultiMassage) {
      const isValid = massageList.every(m => m.massageType && m.duration);
      if (!isValid) {
        alert('Zəhmət olmasa bütün masaj məlumatlarını doldurun!');
        return;
      }
    } else {
      if (!formData.massageType || !formData.duration) {
        alert('Zəhmət olmasa masaj növü və müddət seçin!');
        return;
      }
    }

    try {
      setLoading(true);
      const token = getToken();

      // YENİ: Prepare request body based on format
      const requestBody = {
        cardNumber: formData.cardNumber,
        purchasedBy: formData.purchasedBy,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      };

      if (isMultiMassage) {
        // Yeni format - massages array
        requestBody.massages = massageList.map(m => ({
          massageType: m.massageType,
          duration: parseInt(m.duration)
        }));
      } else {
        // Köhnə format - single massage
        requestBody.massageType = formData.massageType;
        requestBody.duration = parseInt(formData.duration);
      }

      const response = await fetch(`${API_BASE}/gift-cards/${token}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
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
        // YENİ: Show multi-massage info
        let message = 'Hədiyyə kartı keçərlidir!\n\n';
        message += `Kart nömrəsi: ${data.giftCard.cardNumber}\n`;
        message += `Alan: ${data.giftCard.purchasedBy.name}\n\n`;

        if (data.stats) {
          message += `Ümumi masaj: ${data.stats.totalMassages}\n`;
          message += `İstifadə edilmiş: ${data.stats.usedMassages}\n`;
          message += `Qalan: ${data.stats.remainingMassages}\n`;
          message += `Ümumi dəyər: ${data.stats.totalValue} ₼\n\n`;
        }

        if (data.availableMassages && data.availableMassages.length > 0) {
          message += 'Qalan masajlar:\n';
          data.availableMassages.forEach((m, i) => {
            const massageName = m.massageType?.name || 'N/A';
            message += `${i + 1}. ${massageName} - ${m.duration} dəq (${m.price} ₼)\n`;
          });
        }

        alert(message);
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
    setCustomerSearchTerm('');
    setSelectedCustomerName('');
    setShowCustomerDropdown(false);
    // YENİ: Reset multi-massage states
    setIsMultiMassage(false);
    setMassageList([{ massageType: '', duration: '' }]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusBadge = (card) => {
    // YENİ: Check multi-massage status
    if (card.massages && card.massages.length > 0) {
      const allUsed = card.massages.every(m => m.isUsed);
      if (allUsed) {
        return { text: 'İstifadə olunub', color: '#16a34a', bgColor: '#dcfce7' };
      }

      const someUsed = card.massages.some(m => m.isUsed);
      if (someUsed) {
        const remaining = card.massages.filter(m => !m.isUsed).length;
        return { text: `${remaining} masaj qalıb`, color: '#f59e0b', bgColor: '#fef3c7' };
      }
    } else if (card.isUsed) {
      return { text: 'İstifadə olunub', color: '#16a34a', bgColor: '#dcfce7' };
    }

    // Check if card is expired (more than 2 months from purchase date)
    const purchaseDate = new Date(card.purchaseDate);
    const currentDate = new Date();
    const twoMonthsInMs = 61 * 24 * 60 * 60 * 1000; // 60 days in milliseconds
    const timeDifference = currentDate - purchaseDate;

    if (timeDifference > twoMonthsInMs) {
      return { text: 'Vaxtı keçib', color: '#dc2626', bgColor: '#fee2e2' };
    }

    // Card is active
    return { text: 'Aktiv', color: '#3b82f6', bgColor: '#dbeafe' };
  };

  const getPaymentMethodText = (method) => {
    const methods = {
      'cash': 'Nağd',
      'card': 'Kart',
      'terminal': 'Terminal'
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

  // Helper function to check if card is expired
  const isCardExpired = (card) => {
    if (card.isUsed) return false; // Used cards are not considered expired
    const purchaseDate = new Date(card.purchaseDate);
    const currentDate = new Date();
    const twoMonthsInMs = 60 * 24 * 60 * 60 * 1000; // 60 days in milliseconds
    return (currentDate - purchaseDate) > twoMonthsInMs;
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
      (statusFilter === 'expired' && isCardExpired(card)) ||
      (statusFilter === 'active' && !card.isUsed && !isCardExpired(card));

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: giftCards.length,
    active: giftCards.filter(c => !c.isUsed && !isCardExpired(c)).length,
    used: giftCards.filter(c => c.isUsed).length,
    expired: giftCards.filter(c => isCardExpired(c)).length,
    revenue: giftCards.reduce((sum, c) => {
      // YENİ: Calculate total from massages or originalPrice
      if (c.massages && c.massages.length > 0) {
        return sum + c.massages.reduce((s, m) => s + (m?.price || 0), 0);
      }
      return sum + (c.originalPrice || 0);
    }, 0)
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Gift size={24} color="#8b5cf6" />
          <div>
            <h2 style={styles.title}>Hədiyyə Kartları</h2>
            <h2>İşçi : {userData.name}</h2>

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
          <div style={styles.statNumber}>{stats.expired}</div>
          <div style={styles.statLabel}>Vaxtı keçib</div>
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
            <option value="expired">Vaxtı keçmiş</option>
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

                    {/* YENİ: Multi-massage display */}
                    {card.massages && card.massages.length > 0 ? (
                      <div style={{ marginTop: '8px', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                        <div style={styles.infoRow}>
                          <Gift size={14} />
                          <span>Masajlar ({card.massages.length}):</span>
                        </div>
                        {card.massages.map((massage, idx) => (
                          <div key={idx} style={{ ...styles.infoRow, marginLeft: '20px', fontSize: '12px' }}>
                            <span>
                              {idx + 1}. {massage.massageType?.name || 'N/A'} ({massage.duration || 0} dəq) - {massage.price || 0} ₼
                            </span>
                            {massage.isUsed && (
                              <CheckCircle size={12} color="#16a34a" style={{ marginLeft: '4px' }} />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div style={styles.infoRow}>
                          <Gift size={14} />
                          <span>{card.massageType?.name} ({card.duration} dəq)</span>
                        </div>
                        <div style={styles.infoRow}>
                          <DollarSign size={14} />
                          <span>{card.originalPrice} ₼</span>
                        </div>
                      </>
                    )}

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
              <button onClick={() => { setShowAddModal(false); setCustomerSearchTerm(''); }} style={styles.closeBtn}>
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
                <div style={{ position: 'relative' }}>
                  <div style={styles.searchContainer}>
                    <Search size={16} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }} />
                    <input
                      type="text"
                      placeholder="Müştəri adı və ya telefon nömrəsi yazın..."
                      value={selectedCustomerName || customerSearchTerm}
                      onChange={(e) => {
                        setCustomerSearchTerm(e.target.value);
                        setSelectedCustomerName('');
                        setFormData(prev => ({ ...prev, purchasedBy: '' }));
                        setShowCustomerDropdown(true);
                      }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      style={styles.searchInput}
                    />
                  </div>

                  {showCustomerDropdown && customerSearchTerm && (
                    <div style={styles.customerDropdown}>
                      {customers
                        .filter(customer =>
                          customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                          customer.phone.toLowerCase().includes(customerSearchTerm.toLowerCase())
                        )
                        .slice(0, 10)
                        .map(customer => (
                          <div
                            key={customer._id}
                            style={styles.customerItem}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, purchasedBy: customer._id }));
                              setSelectedCustomerName(`${customer.name} - ${customer.phone}`);
                              setCustomerSearchTerm('');
                              setShowCustomerDropdown(false);
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={styles.customerItemName}>{customer.name}</div>
                            <div style={styles.customerItemPhone}>{customer.phone}</div>
                          </div>
                        ))}
                      {customers.filter(customer =>
                        customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                        customer.phone.toLowerCase().includes(customerSearchTerm.toLowerCase())
                      ).length === 0 && (
                          <div style={styles.noResults}>Müştəri tapılmadı</div>
                        )}
                    </div>
                  )}
                </div>
              </div>

              {/* YENİ: Multi-massage toggle */}
              <div style={styles.formGroup}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isMultiMassage}
                    onChange={(e) => setIsMultiMassage(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={styles.label}>Çoxlu masaj əlavə et</span>
                </label>
              </div>

              {/* YENİ: Multi-massage list or single massage */}
              {isMultiMassage ? (
                <div>
                  <label style={styles.label}>Masajlar:</label>
                  {massageList.map((massage, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                        <select
                          value={massage.massageType}
                          onChange={(e) => updateMassageInList(index, 'massageType', e.target.value)}
                          style={{ ...styles.select, flex: 1 }}
                        >
                          <option value="">Masaj növü seçin</option>
                          {massageTypes.map(type => (
                            <option key={type._id} value={type._id}>{type.name}</option>
                          ))}
                        </select>

                        <select
                          value={massage.duration}
                          onChange={(e) => updateMassageInList(index, 'duration', e.target.value)}
                          style={{ ...styles.select, flex: 1 }}
                          disabled={!massage.massageType}
                        >
                          <option value="">Müddət seçin</option>
                          {getDurationsForMassageType(massage.massageType).map(duration => (
                            <option key={duration.minutes} value={duration.minutes}>
                              {duration.minutes} dəqiqə - {index === 0 ? duration.price + 4 : duration.price} ₼
                            </option>
                          ))}
                        </select>
                      </div>

                      {massageList.length > 1 && (
                        <button
                          onClick={() => removeMassageFromList(index)}
                          style={{
                            padding: '8px',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={addMassageToList}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#dbeafe',
                      color: '#2563eb',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <Plus size={16} />
                    Masaj əlavə et
                  </button>
                </div>
              ) : (
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
              )}

              {!isMultiMassage && (
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
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>Ödəniş Üsulu:</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  style={styles.select}
                >
                  <option value="cash">Nağd</option>
                  <option value="card">Kart</option>
                  <option value="terminal">Terminal</option>
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
              <button onClick={() => { setShowAddModal(false); setCustomerSearchTerm(''); }} style={styles.cancelBtn}>
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

                {/* YENİ: Multi-massage display */}
                {selectedCard.massages && selectedCard.massages.length > 0 ? (
                  <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '8px' }}>
                    <strong style={{ display: 'block', marginBottom: '8px' }}>Masajlar ({selectedCard.massages.length}):</strong>
                    {selectedCard.massages.map((massage, idx) => (
                      <div key={idx} style={{
                        padding: '8px',
                        backgroundColor: massage.isUsed ? '#dcfce7' : '#f9fafb',
                        borderRadius: '6px',
                        marginBottom: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>
                          {idx + 1}. {massage.massageType?.name} - {massage.duration} dəqiqə - {massage.price} ₼
                        </span>
                        {massage.isUsed && (
                          <span style={{ color: '#16a34a', fontSize: '12px' }}>✓ İstifadə edilib</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
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
                  </>
                )}

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
                  <span style={{ color: getStatusBadge(selectedCard).color }}>
                    {getStatusBadge(selectedCard).text}
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
  },

  customerDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    marginTop: '4px',
    maxHeight: '300px',
    overflowY: 'auto',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000
  },

  customerItem: {
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #f3f4f6',
    transition: 'background 0.2s ease',
    ':hover': {
      background: '#f9fafb'
    }
  },

  customerItemName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '4px'
  },

  customerItemPhone: {
    fontSize: '13px',
    color: '#64748b'
  },

  noResults: {
    padding: '16px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px'
  }
};