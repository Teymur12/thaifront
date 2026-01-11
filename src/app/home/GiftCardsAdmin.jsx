'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Trash2, BarChart3, Calendar, CreditCard, Users, TrendingUp, Download } from 'lucide-react';
import Cookies from 'js-cookie';
import * as XLSX from 'xlsx';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  mainContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '20px 16px'
  },
  header: {
    marginBottom: '24px'
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    wordBreak: 'break-word'
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '14px'
  },
  toggleButton: {
    padding: '8px 14px',
    borderRadius: '8px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    whiteSpace: 'nowrap'
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
    marginBottom: '24px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '20px'
  },
  statsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '16px'
  },
  dateFilters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  dateGroup: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: '150px'
  },
  dateLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px'
  },
  dateInput: {
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '8px 10px',
    fontSize: '13px',
    width: '100%'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px'
  },
  statCard: {
    background: 'linear-gradient(to right, #dbeafe, #e0e7ff)',
    borderRadius: '8px',
    padding: '14px'
  },
  statCardTitle: {
    fontWeight: '500',
    color: '#111827',
    marginBottom: '10px',
    fontSize: '14px',
    wordBreak: 'break-word'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    marginBottom: '6px'
  },
  filtersSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '20px',
    marginBottom: '20px'
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px'
  },
  searchContainer: {
    position: 'relative'
  },
  searchInput: {
    paddingLeft: '36px',
    paddingRight: '12px',
    paddingTop: '8px',
    paddingBottom: '8px',
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '13px',
    boxSizing: 'border-box'
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af'
  },
  select: {
    width: '100%',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '8px 10px',
    fontSize: '13px',
    backgroundColor: 'white'
  },
  clearButton: {
    width: '100%',
    padding: '8px 14px',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '13px'
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
    borderCollapse: 'collapse',
    minWidth: '900px'
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb'
  },
  tableHeaderCell: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '11px',
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
    padding: '14px 16px',
    fontSize: '13px'
  },
  cardNumber: {
    fontWeight: '500',
    color: '#111827',
    fontSize: '13px'
  },
  cardDate: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px'
  },
  cardNotes: {
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '4px'
  },
  massageType: {
    fontWeight: '500',
    color: '#111827',
    fontSize: '13px'
  },
  massageDuration: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px'
  },
  customerName: {
    fontWeight: '500',
    color: '#111827',
    fontSize: '13px'
  },
  customerPhone: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px'
  },
  branchName: {
    fontSize: '13px',
    color: '#111827'
  },
  statusBadge: {
    padding: '4px 8px',
    fontSize: '11px',
    borderRadius: '9999px',
    fontWeight: '500',
    whiteSpace: 'nowrap'
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
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '4px'
  },
  price: {
    fontWeight: '500',
    color: '#111827',
    fontSize: '13px'
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
    padding: '40px 20px',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '14px'
  },
  summarySection: {
    marginTop: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '20px'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '14px'
  },
  summaryCard: {
    textAlign: 'center',
    padding: '14px',
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
    fontSize: '22px',
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
    fontSize: '13px',
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
    width: '40px',
    height: '40px',
    border: '2px solid #e5e7eb',
    borderTopColor: '#2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  },
  loadingText: {
    marginTop: '12px',
    color: '#6b7280',
    fontSize: '14px'
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

  const fetchGiftCards = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const queryParams = new URLSearchParams();

      if (selectedBranch) queryParams.append('branch', selectedBranch);
      if (selectedStatus) queryParams.append('status', selectedStatus);
      if (searchQuery) queryParams.append('search', searchQuery);

      const response = await fetch(`https://thaiback.onrender.com/api/gift-cards/admin/${token}?${queryParams}`);
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

  const fetchBranches = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`https://thaiback.onrender.com/api/admin/branches/${token}`);
      const data = await response.json();

      if (response.ok) {
        setBranches(data);
      }
    } catch (error) {
      console.error('Fetch branches error:', error);
    }
  };

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

  const deleteGiftCard = async (cardId) => {
    if (!confirm('Bu hədiyyə kartını silmək istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`https://thaiback.onrender.com/api/gift-cards/${cardId}/${token}`, {
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

  const exportToExcel = () => {
    const currentDate = new Date();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(currentDate.getMonth() - 2);

    const excelData = giftCards.map(card => {
      const purchaseDate = new Date(card.purchaseDate);
      let status = '';

      // Check if card is used
      if (card.massages && card.massages.length > 0) {
        const allUsed = card.massages.every(m => m.isUsed);
        if (allUsed) {
          // Find the latest used date
          const usedDates = card.massages
            .filter(m => m.usedDate)
            .map(m => new Date(m.usedDate));
          if (usedDates.length > 0) {
            const latestUsedDate = new Date(Math.max(...usedDates));
            status = formatDate(latestUsedDate);
          } else {
            status = 'İstifadə edilib';
          }
        } else {
          // Check if expired (>2 months and not used)
          if (purchaseDate < twoMonthsAgo) {
            status = 'Vaxtı keçmiş';
          } else {
            status = 'Aktiv';
          }
        }
      } else if (card.isUsed) {
        status = card.usedDate ? formatDate(card.usedDate) : 'İstifadə edilib';
      } else {
        // Check if expired (>2 months and not used)
        if (purchaseDate < twoMonthsAgo) {
          status = 'Vaxtı keçmiş';
        } else {
          status = 'Aktiv';
        }
      }

      // Calculate price
      const price = card.massages && card.massages.length > 0
        ? card.massages.reduce((sum, m) => sum + (m?.price || 0), 0)
        : (card.originalPrice || 0);

      return {
        'Kart Nömrəsi': card.cardNumber,
        'Müştəri Nömrəsi': card.purchasedBy?.phone || '',
        'Filial': card.branch?.name || '',
        'Qiymət (AZN)': price,
        'Status': status,
        'Alınma Tarixi': formatDate(card.purchaseDate)
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hədiyyə Kartları');

    // Auto-size columns
    const maxWidth = excelData.reduce((w, r) => {
      return Object.keys(r).map((k, i) => {
        const val = r[k] ? r[k].toString().length : 10;
        return Math.max(w[i] || 10, val);
      });
    }, []);
    worksheet['!cols'] = maxWidth.map(w => ({ wch: w + 2 }));

    let fileNameBase = 'hediyye_kartlari';
    if (selectedBranch) {
      const branchObj = branches.find(b => b._id === selectedBranch);
      if (branchObj) {
        fileNameBase += `_${branchObj.name.replace(/\s+/g, '_')}`;
      }
    }

    const fileName = `${fileNameBase}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
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

  const getStatusBadge = (card) => {
    // YENİ: Multi-massage support
    if (card.massages && card.massages.length > 0) {
      const allUsed = card.massages.every(m => m.isUsed);
      const someUsed = card.massages.some(m => m.isUsed);

      if (allUsed) {
        return (
          <span style={{
            ...styles.statusBadge,
            ...styles.statusBadgeUsed
          }}>
            İstifadə edilib
          </span>
        );
      } else if (someUsed) {
        const remaining = card.massages.filter(m => !m.isUsed).length;
        return (
          <span style={{
            ...styles.statusBadge,
            backgroundColor: '#fef3c7',
            color: '#92400e'
          }}>
            {remaining} masaj qalıb
          </span>
        );
      }
    } else if (card.isUsed) {
      return (
        <span style={{
          ...styles.statusBadge,
          ...styles.statusBadgeUsed
        }}>
          İstifadə edilib
        </span>
      );
    }

    return (
      <span style={{
        ...styles.statusBadge,
        ...styles.statusBadgeActive
      }}>
        Aktiv
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
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <div>
              <h1 style={styles.title}>
                <CreditCard size={28} color="#2563eb" />
                Hədiyyə Kartları İdarəsi
              </h1>
              <p style={styles.subtitle}>Bütün filialların hədiyyə kartlarını idarə edin</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
              <button
                onClick={exportToExcel}
                style={{
                  ...styles.toggleButton,
                  backgroundColor: '#16a34a',
                  color: 'white'
                }}
                className="toggle-button"
                title="Excel-ə çıxart"
              >
                <Download size={16} />
                Excel-ə çıxart
              </button>
            </div>
          </div>
        </div>

        {showStats && (
          <div style={styles.statsSection}>
            <h2 style={styles.statsTitle}>Statistikalar</h2>

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
                        <span>İstifadə: {branchStat.usedCards}</span>
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

        <div style={styles.filtersSection}>
          <div style={styles.filtersGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Axtarış
              </label>
              <div style={styles.searchContainer}>
                <Search size={16} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Kart nömrəsi və ya müştəri..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
            </div>

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
                Təmizlə
              </button>
            </div>
          </div>
        </div>

        <div style={styles.tableSection}>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.tableHeaderCell}>Kart məlumatları</th>
                  <th style={styles.tableHeaderCell}>Masaj növü</th>
                  <th style={styles.tableHeaderCell}>Alıcı</th>
                  <th style={styles.tableHeaderCell}>Filial</th>
                  <th style={styles.tableHeaderCell}>Status</th>
                  <th style={styles.tableHeaderCell}>Qiymət</th>
                  <th style={styles.tableHeaderCell}>Əməliyyat</th>
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
                          {/* YENİ: Multi-massage support */}
                          {card.massages && card.massages.length > 0 ? (
                            <div>
                              <div style={styles.massageType}>
                                {card.massages.length} masaj
                              </div>
                              {card.massages.map((massage, idx) => (
                                <div key={idx} style={{ ...styles.massageDuration, marginTop: '4px' }}>
                                  {idx + 1}. {massage.massageType?.name} ({massage.duration} dəq)
                                  {massage.isUsed && <span style={{ color: '#16a34a', marginLeft: '4px' }}>✓</span>}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div>
                              <div style={styles.massageType}>
                                {card.massageType?.name}
                              </div>
                              <div style={styles.massageDuration}>
                                {card.duration} dəqiqə
                              </div>
                            </div>
                          )}
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
                        {getStatusBadge(card)}
                        {card.isUsed && (
                          <div style={styles.usedDate}>
                            {formatDate(card.usedDate)}
                          </div>
                        )}
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.price}>
                          {/* YENİ: Calculate total from massages if available */}
                          {card.massages && card.massages.length > 0
                            ? formatPrice(card.massages.reduce((sum, m) => sum + (m?.price || 0), 0))
                            : formatPrice(card.originalPrice || 0)
                          }
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

        <div style={styles.summarySection}>
          <div style={styles.summaryGrid}>
            <div style={{ ...styles.summaryCard, ...styles.summaryCardBlue }}>
              <div style={{ ...styles.summaryNumber, ...styles.summaryNumberBlue }}>
                {giftCards.length}
              </div>
              <div style={styles.summaryLabel}>Ümumi kart</div>
            </div>
            <div style={{ ...styles.summaryCard, ...styles.summaryCardGreen }}>
              <div style={{ ...styles.summaryNumber, ...styles.summaryNumberGreen }}>
                {giftCards.filter(card => !card.isUsed).length}
              </div>
              <div style={styles.summaryLabel}>Aktiv kart</div>
            </div>
            <div style={{ ...styles.summaryCard, ...styles.summaryCardRed }}>
              <div style={{ ...styles.summaryNumber, ...styles.summaryNumberRed }}>
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