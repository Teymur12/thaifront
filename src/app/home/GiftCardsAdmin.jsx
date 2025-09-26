'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Trash2, BarChart3, Calendar, CreditCard, Users, TrendingUp } from 'lucide-react';
import Cookies from 'js-cookie';


const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  mainContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '32px 16px'
  },
  header: {
    marginBottom: '32px'
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: {
    fontSize: '30px',
    fontWeight: '700',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '16px'
  },
  toggleButton: {
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: 'none',
    cursor: 'pointer'
  },
  toggleButtonActive: {
    backgroundColor: '#2563eb',
    color: 'white'
  },
  toggleButtonInactive: {
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #d1d5db'
  },
  statsSection: {
    marginBottom: '32px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '24px'
  },
  statsTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '16px'
  },
  dateFilters: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px'
  },
  dateGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  dateLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px'
  },
  dateInput: {
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px'
  },
  statCard: {
    background: 'linear-gradient(to right, #dbeafe, #e0e7ff)',
    borderRadius: '8px',
    padding: '16px'
  },
  statCardTitle: {
    fontWeight: '500',
    color: '#111827',
    marginBottom: '8px'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    marginBottom: '8px'
  },
  filtersSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '24px',
    marginBottom: '24px'
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px'
  },
  searchContainer: {
    position: 'relative'
  },
  searchInput: {
    paddingLeft: '40px',
    paddingRight: '16px',
    paddingTop: '8px',
    paddingBottom: '8px',
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af'
  },
  select: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    backgroundColor: 'white'
  },
  clearButton: {
    width: '100%',
    padding: '8px 16px',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px'
  },
  tableSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb'
  },
  tableHeaderCell: {
    padding: '12px 24px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  tableRow: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.2s ease'
  },
  tableCell: {
    padding: '16px 24px'
  },
  cardNumber: {
    fontWeight: '500',
    color: '#111827'
  },
  cardDate: {
    fontSize: '14px',
    color: '#6b7280'
  },
  cardNotes: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '4px'
  },
  massageType: {
    fontWeight: '500',
    color: '#111827'
  },
  massageDuration: {
    fontSize: '14px',
    color: '#6b7280'
  },
  customerName: {
    fontWeight: '500',
    color: '#111827'
  },
  customerPhone: {
    fontSize: '14px',
    color: '#6b7280'
  },
  branchName: {
    fontSize: '14px',
    color: '#111827'
  },
  statusBadge: {
    padding: '4px 8px',
    fontSize: '12px',
    borderRadius: '9999px',
    fontWeight: '500'
  },
  statusBadgeActive: {
    backgroundColor: '#dcfce7',
    color: '#166534'
  },
  statusBadgeUsed: {
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  },
  usedDate: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px'
  },
  price: {
    fontWeight: '500',
    color: '#111827'
  },
  actionButton: {
    padding: '4px',
    color: '#dc2626',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  emptyState: {
    padding: '48px 24px',
    textAlign: 'center',
    color: '#6b7280'
  },
  summarySection: {
    marginTop: '24px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '24px'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  summaryCard: {
    textAlign: 'center',
    padding: '16px',
    borderRadius: '8px'
  },
  summaryCardBlue: {
    backgroundColor: '#dbeafe'
  },
  summaryCardGreen: {
    backgroundColor: '#dcfce7'
  },
  summaryCardRed: {
    backgroundColor: '#fee2e2'
  },
  summaryNumber: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '4px'
  },
  summaryNumberBlue: {
    color: '#2563eb'
  },
  summaryNumberGreen: {
    color: '#16a34a'
  },
  summaryNumberRed: {
    color: '#dc2626'
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#6b7280'
  },
  loading: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingContent: {
    textAlign: 'center'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '2px solid #e5e7eb',
    borderTopColor: '#2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  },
  loadingText: {
    marginTop: '16px',
    color: '#6b7280'
  }
};

const AdminGiftCards = () => {
  const [giftCards, setGiftCards] = useState([]);
  const [branches, setBranches] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: '',
    endDate: ''
  });

     const getToken = () => {
       return Cookies.get('authToken');
     };

  // Fetch all gift cards
  const fetchGiftCards = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const queryParams = new URLSearchParams();
      
      if (selectedBranch) queryParams.append('branch', selectedBranch);
      if (selectedStatus) queryParams.append('status', selectedStatus);
      if (searchQuery) queryParams.append('search', searchQuery);

      const response = await fetch(`http://localhost:5000/api/gift-cards/admin/${token}?${queryParams}`);
      const data = await response.json();
      
      if (response.ok) {
        setGiftCards(data);
      } else {
        console.error('Error:', data.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  // Fetch branches
  const fetchBranches = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/admin/branches/${token}`);
      const data = await response.json();
      
      if (response.ok) {
        setBranches(data);
      }
    } catch (error) {
      console.error('Fetch branches error:', error);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const queryParams = new URLSearchParams();
      
      if (selectedBranch) queryParams.append('branch', selectedBranch);
      if (selectedDateRange.startDate) queryParams.append('startDate', selectedDateRange.startDate);
      if (selectedDateRange.endDate) queryParams.append('endDate', selectedDateRange.endDate);

      const response = await fetch(`/api/gift-cards/stats/${token}?${queryParams}`);
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  // Delete gift card
  const deleteGiftCard = async (cardId) => {
    if (!confirm('Bu hədiyyə kartını silmək istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/gift-cards/${cardId}/${token}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Hədiyyə kartı uğurla silindi');
        fetchGiftCards();
      } else {
        alert(data.message || 'Xəta baş verdi');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Xəta baş verdi');
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLoading(true);
      Promise.all([fetchGiftCards(), fetchBranches()]).finally(() => {
        setLoading(false);
      });
    }
  }, [selectedBranch, selectedStatus, searchQuery]);

  useEffect(() => {
    if (showStats && typeof window !== 'undefined') {
      fetchStats();
    }
  }, [showStats, selectedBranch, selectedDateRange]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('az-AZ');
  };

  const formatPrice = (price) => {
    return `${price} AZN`;
  };

  const getStatusBadge = (isUsed) => {
    return (
      <span style={{
        ...styles.statusBadge,
        ...(isUsed ? styles.statusBadgeUsed : styles.statusBadgeActive)
      }}>
        {isUsed ? 'İstifadə edilib' : 'Aktiv'}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingContent}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .table-row:hover {
          background-color: #f9fafb;
        }
        .action-button:hover {
          background-color: #fef2f2;
        }
        .clear-button:hover {
          background-color: #e5e7eb;
        }
        .toggle-button:hover {
          background-color: #f3f4f6;
        }
      `}</style>
      
      <div style={styles.mainContainer}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <div>
              <h1 style={styles.title}>
                <CreditCard size={32} color="#2563eb" />
                Hədiyyə Kartları İdarəsi
              </h1>
              <p style={styles.subtitle}>Bütün filialların hədiyyə kartlarını idarə edin</p>
            </div>
            <button
              onClick={() => setShowStats(!showStats)}
              style={{
                ...styles.toggleButton,
                ...(showStats ? styles.toggleButtonActive : styles.toggleButtonInactive)
              }}
              className="toggle-button"
            >
              <BarChart3 size={16} />
              Statistikalar
            </button>
          </div>
        </div>

        {/* Statistics Section */}
        {showStats && (
          <div style={styles.statsSection}>
            <h2 style={styles.statsTitle}>Statistikalar</h2>
            
            {/* Date Range Filter */}
            <div style={styles.dateFilters}>
              <div style={styles.dateGroup}>
                <label style={styles.dateLabel}>
                  Başlanğıc tarix
                </label>
                <input
                  type="date"
                  value={selectedDateRange.startDate}
                  onChange={(e) => setSelectedDateRange({
                    ...selectedDateRange,
                    startDate: e.target.value
                  })}
                  style={styles.dateInput}
                />
              </div>
              <div style={styles.dateGroup}>
                <label style={styles.dateLabel}>
                  Bitmə tarixi
                </label>
                <input
                  type="date"
                  value={selectedDateRange.endDate}
                  onChange={(e) => setSelectedDateRange({
                    ...selectedDateRange,
                    endDate: e.target.value
                  })}
                  style={styles.dateInput}
                />
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div style={styles.statsGrid}>
                {stats.map((branchStat, index) => (
                  <div key={index} style={styles.statCard}>
                    <h3 style={styles.statCardTitle}>
                      {branchStat.branchInfo[0]?.name || 'Naməlum filial'}
                    </h3>
                    <div>
                      <div style={styles.statItem}>
                        <CreditCard size={16} color="#2563eb" />
                        <span>Ümumi: {branchStat.totalCards}</span>
                      </div>
                      <div style={styles.statItem}>
                        <Users size={16} color="#16a34a" />
                        <span>Aktiv: {branchStat.activeCards}</span>
                      </div>
                      <div style={styles.statItem}>
                        <Eye size={16} color="#dc2626" />
                        <span>İstifadə edilib: {branchStat.usedCards}</span>
                      </div>
                      <div style={styles.statItem}>
                        <TrendingUp size={16} color="#7c3aed" />
                        <span>Gəlir: {formatPrice(branchStat.totalRevenue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div style={styles.filtersSection}>
          <div style={styles.filtersGrid}>
            {/* Search */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Axtarış
              </label>
              <div style={styles.searchContainer}>
                <Search size={16} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Kart nömrəsi və ya müştəri adı..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
            </div>

            {/* Branch Filter */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Filial
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                style={styles.select}
              >
                <option value="">Bütün filiallar</option>
                {branches.map(branch => (
                  <option key={branch._id} value={branch._id}>{branch.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={styles.select}
              >
                <option value="">Hamısı</option>
                <option value="active">Aktiv</option>
                <option value="used">İstifadə edilib</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div style={styles.formGroup}>
              <label style={styles.label}>&nbsp;</label>
              <button
                onClick={() => {
                  setSelectedBranch('');
                  setSelectedStatus('');
                  setSearchQuery('');
                }}
                style={styles.clearButton}
                className="clear-button"
              >
                <Filter size={16} />
                Filterləri təmizlə
              </button>
            </div>
          </div>
        </div>

        {/* Gift Cards Table */}
        <div style={styles.tableSection}>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.tableHeaderCell}>
                    Kart məlumatları
                  </th>
                  <th style={styles.tableHeaderCell}>
                    Masaj növü
                  </th>
                  <th style={styles.tableHeaderCell}>
                    Alıcı
                  </th>
                  <th style={styles.tableHeaderCell}>
                    Filial
                  </th>
                  <th style={styles.tableHeaderCell}>
                    Status
                  </th>
                  <th style={styles.tableHeaderCell}>
                    Qiymət
                  </th>
                  <th style={styles.tableHeaderCell}>
                    Əməliyyatlar
                  </th>
                </tr>
              </thead>
              <tbody>
                {giftCards.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={styles.emptyState}>
                      Hədiyyə kartı tapılmadı
                    </td>
                  </tr>
                ) : (
                  giftCards.map((card) => (
                    <tr key={card._id} style={styles.tableRow} className="table-row">
                      <td style={styles.tableCell}>
                        <div>
                          <div style={styles.cardNumber}>{card.cardNumber}</div>
                          <div style={styles.cardDate}>
                            {formatDate(card.purchaseDate)}
                          </div>
                          {card.notes && (
                            <div style={styles.cardNotes}>
                              {card.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <div>
                          <div style={styles.massageType}>
                            {card.massageType?.name}
                          </div>
                          <div style={styles.massageDuration}>
                            {card.duration} dəqiqə
                          </div>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <div>
                          <div style={styles.customerName}>
                            {card.purchasedBy?.name}
                          </div>
                          <div style={styles.customerPhone}>
                            {card.purchasedBy?.phone}
                          </div>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.branchName}>
                          {card.branch?.name}
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        {getStatusBadge(card.isUsed)}
                        {card.isUsed && (
                          <div style={styles.usedDate}>
                            {formatDate(card.usedDate)}
                          </div>
                        )}
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.price}>
                          {formatPrice(card.originalPrice)}
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <div>
                          {!card.isUsed && (
                            <button
                              onClick={() => deleteGiftCard(card._id)}
                              style={styles.actionButton}
                              className="action-button"
                              title="Sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div style={styles.summarySection}>
          <div style={styles.summaryGrid}>
            <div style={{...styles.summaryCard, ...styles.summaryCardBlue}}>
              <div style={{...styles.summaryNumber, ...styles.summaryNumberBlue}}>
                {giftCards.length}
              </div>
              <div style={styles.summaryLabel}>Ümumi kart</div>
            </div>
            <div style={{...styles.summaryCard, ...styles.summaryCardGreen}}>
              <div style={{...styles.summaryNumber, ...styles.summaryNumberGreen}}>
                {giftCards.filter(card => !card.isUsed).length}
              </div>
              <div style={styles.summaryLabel}>Aktiv kart</div>
            </div>
            <div style={{...styles.summaryCard, ...styles.summaryCardRed}}>
              <div style={{...styles.summaryNumber, ...styles.summaryNumberRed}}>
                {giftCards.filter(card => card.isUsed).length}
              </div>
              <div style={styles.summaryLabel}>İstifadə edilib</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGiftCards;