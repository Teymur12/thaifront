import { useState, useEffect } from 'react';
import { Search, Phone, User, Calendar, DollarSign, TrendingUp, Clock, Award, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Cookies from 'js-cookie';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://thaiback.onrender.com/api';

export default function CustomerHistory() {
  const [searchType, setSearchType] = useState('phone'); // 'phone' or 'name'
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const userName = JSON.parse(localStorage.getItem('userData'))?.name;
  // ✅ YENİ - Pagination üçün state-lər
  const [allCustomers, setAllCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const customersPerPage = 50;

  const getToken = () => {
    return Cookies.get('authToken');
  };

  // ✅ YENİ - Bütün müştəriləri yüklə
  useEffect(() => {
    fetchAllCustomers();
  }, []);

  const fetchAllCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const token = getToken();
      
      if (!token) {
        setError('Token tapılmadı. Yenidən daxil olun.');
        return;
      }

      const response = await fetch(`${API_BASE}/receptionist/customers/${token}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllCustomers(data);
      } else {
        setError('Müştərilər yüklənərkən xəta baş verdi');
      }
    } catch (error) {
      console.error('Fetch customers error:', error);
      setError('Müştərilər yüklənərkən xəta baş verdi');
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Pagination hesablamaları
  const totalPages = Math.ceil(allCustomers.length / customersPerPage);
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = allCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const searchCustomer = async () => {
    if (!searchValue.trim()) {
      setError('Axtarış üçün telefon və ya ad daxil edin');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setCustomerData(null);
      setSearchResults(null);
      
      const token = getToken();
      if (!token) {
        setError('Token tapılmadı. Yenidən daxil olun.');
        return;
      }

      let url;
      if (searchType === 'phone') {
        url = `${API_BASE}/receptionist/customers/phone/${searchValue}/appointments/${token}`;
      } else {
        url = `${API_BASE}/receptionist/customers/name/${searchValue}/appointments/${token}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (searchType === 'name' && data.results) {
          setSearchResults(data);
        } else {
          setCustomerData(data);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Müştəri tapılmadı');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Axtarış zamanı xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const selectCustomer = (result) => {
    setCustomerData(result);
    setSearchResults(null);
    setSelectedCustomer(result.customer);
  };

  // ✅ YENİ - Müştəriyə klik edəndə onun məlumatlarını yüklə
  const viewCustomerDetails = async (customer) => {
    try {
      setLoading(true);
      setError('');
      setCustomerData(null);
      
      const token = getToken();
      if (!token) {
        setError('Token tapılmadı. Yenidən daxil olun.');
        return;
      }

      const response = await fetch(
        `${API_BASE}/receptionist/customers/${customer._id}/appointments/${token}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCustomerData(data);
        setSelectedCustomer(customer);
      } else {
        setError('Müştəri məlumatları yüklənərkən xəta baş verdi');
      }
    } catch (error) {
      console.error('View customer error:', error);
      setError('Müştəri məlumatları yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('az-AZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return `${price.toFixed(2)} AZN`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'scheduled': return '#3b82f6';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Tamamlanıb';
      case 'scheduled': return 'Planlaşdırılıb';
      case 'cancelled': return 'Ləğv edilib';
      default: return status;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Müştəri Tarixçəsi</h1>

        <p style={styles.subtitle}>Müştərinin əvvəlki randevularını və statistikasını görün</p>
      </div>

      {/* Search Section */}
      <div style={styles.searchCard}>
        <div style={styles.searchTypeToggle}>
          <button
            onClick={() => setSearchType('phone')}
            style={{
              ...styles.toggleBtn,
              ...(searchType === 'phone' ? styles.toggleBtnActive : {})
            }}
          >
            <Phone size={18} />
            Telefon
          </button>
          <button
            onClick={() => setSearchType('name')}
            style={{
              ...styles.toggleBtn,
              ...(searchType === 'name' ? styles.toggleBtnActive : {})
            }}
          >
            <User size={18} />
            Ad
          </button>
        </div>

        <div style={styles.searchInputGroup}>
          <input
            type="text"
            placeholder={searchType === 'phone' ? '0507892134' : 'Müştəri adı...'}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchCustomer()}
            style={styles.searchInput}
          />
          <button
            onClick={searchCustomer}
            disabled={loading}
            style={styles.searchBtn}
          >
            <Search size={20} />
            {loading ? 'Axtarılır...' : 'Axtar'}
          </button>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            {error}
          </div>
        )}
      </div>

      {/* Multiple Results (Name Search) */}
      {searchResults && searchResults.results && (
        <div style={styles.resultsGrid}>
          <h3 style={styles.resultsTitle}>
            {searchResults.found} müştəri tapıldı: "{searchResults.searchTerm}"
          </h3>
          {searchResults.results.map((result, index) => (
            <div
              key={index}
              onClick={() => selectCustomer(result)}
              style={styles.resultCard}
            >
              <div style={styles.resultHeader}>
                <h4 style={styles.resultName}>{result.customer.name}</h4>
                <span style={styles.resultPhone}>{result.customer.phone}</span>
              </div>
              <div style={styles.resultStats}>
                <div style={styles.statItem}>
                  <Calendar size={16} />
                  <span>{result.stats.total} randevu</span>
                </div>
                <div style={styles.statItem}>
                  <DollarSign size={16} />
                  <span>{formatPrice(result.stats.totalSpent)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Details */}
      {customerData && (
        <div style={styles.customerSection}>
          {/* Customer Info Card */}
          <div style={styles.customerCard}>
            <div style={styles.customerHeader}>
              <div style={styles.customerAvatar}>
                {customerData.customer.name.charAt(0).toUpperCase()}
              </div>
              <div style={styles.customerInfo}>
                <h2 style={styles.customerName}>{customerData.customer.name}</h2>
                <p style={styles.customerPhone}>
                  <Phone size={16} />
                  {customerData.customer.phone}
                </p>
                {customerData.customer.notes && (
                  <p style={styles.customerNotes}>{customerData.customer.notes}</p>
                )}
              </div>
            </div>

            {/* Statistics Grid */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <Calendar size={24} style={{ color: '#3b82f6' }} />
                <div style={styles.statContent}>
                  <p style={styles.statValue}>{customerData.stats.total}</p>
                  <p style={styles.statLabel}>Toplam Randevu</p>
                </div>
              </div>

              <div style={styles.statCard}>
                <TrendingUp size={24} style={{ color: '#10b981' }} />
                <div style={styles.statContent}>
                  <p style={styles.statValue}>{customerData.stats.completed}</p>
                  <p style={styles.statLabel}>Tamamlanıb</p>
                </div>
              </div>

              <div style={styles.statCard}>
                <DollarSign size={24} style={{ color: '#f59e0b' }} />
                <div style={styles.statContent}>
                  <p style={styles.statValue}>{formatPrice(customerData.stats.totalSpent)}</p>
                  <p style={styles.statLabel}>Toplam Xərclədi</p>
                </div>
              </div>

              <div style={styles.statCard}>
                <Award size={24} style={{ color: '#8b5cf6' }} />
                <div style={styles.statContent}>
                  <p style={styles.statValue}>{formatPrice(customerData.stats.totalTips || 0)}</p>
                  <p style={styles.statLabel}>Toplam Bahşiş</p>
                </div>
              </div>
            </div>

            {/* Favorite Services & Masseurs */}
            {(customerData.stats.favoriteServices?.length > 0 || customerData.stats.favoriteMasseurs?.length > 0) && (
              <div style={styles.favoritesSection}>
                {customerData.stats.favoriteServices?.length > 0 && (
                  <div style={styles.favoriteCard}>
                    <h4 style={styles.favoriteTitle}>🎯 Favori Xidmətlər</h4>
                    <div style={styles.favoriteList}>
                      {customerData.stats.favoriteServices.map((service, index) => (
                        <div key={index} style={styles.favoriteItem}>
                          <span style={styles.favoriteName}>{service.name}</span>
                          <span style={styles.favoriteCount}>{service.count}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {customerData.stats.favoriteMasseurs?.length > 0 && (
                  <div style={styles.favoriteCard}>
                    <h4 style={styles.favoriteTitle}>⭐ Favori Masajistlər</h4>
                    <div style={styles.favoriteList}>
                      {customerData.stats.favoriteMasseurs.map((masseur, index) => (
                        <div key={index} style={styles.favoriteItem}>
                          <span style={styles.favoriteName}>{masseur.name}</span>
                          <span style={styles.favoriteCount}>{masseur.count}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Appointments History */}
          <div style={styles.appointmentsSection}>
            <h3 style={styles.sectionTitle}>
              Randevu Tarixçəsi ({customerData.appointments.length})
            </h3>

            <div style={styles.appointmentsList}>
              {customerData.appointments.map((appointment) => (
                <div key={appointment._id} style={styles.appointmentCard}>
                  <div style={styles.appointmentHeader}>
                    <div style={styles.appointmentDate}>
                      <Clock size={18} />
                      {formatDate(appointment.startTime)}
                    </div>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(appointment.status) + '20',
                        color: getStatusColor(appointment.status)
                      }}
                    >
                      {getStatusText(appointment.status)}
                    </span>
                  </div>

                  <div style={styles.appointmentBody}>
                    <div style={styles.appointmentInfo}>
                      <strong>{appointment.massageType.name}</strong>
                      <span style={styles.appointmentDetail}>
                        Masajist: {appointment.masseur.name}
                      </span>
                      <span style={styles.appointmentDetail}>
                        Filial: {appointment.branch.name}
                      </span>
                    </div>

                    <div style={styles.appointmentPrice}>
                      <div style={styles.priceLabel}>Qiymət</div>
                      <div style={styles.priceValue}>{formatPrice(appointment.price)}</div>
                      {appointment.tips?.amount > 0 && (
                        <div style={styles.tipsValue}>
                          + {formatPrice(appointment.tips.amount)} bahşiş
                        </div>
                      )}
                    </div>
                  </div>

                  {appointment.advancePayment?.amount > 0 && (
                    <div style={styles.advancePayment}>
                      Beh: {formatPrice(appointment.advancePayment.amount)} 
                      ({appointment.advancePayment.paymentMethod})
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !customerData && !searchResults && !error && (
        <>
          {/* Müştərilər siyahısı */}
          <div style={styles.customersListSection}>
            <div style={styles.customersHeader}>
              <h3 style={styles.customersTitle}>
                Bütün Müştərilər ({allCustomers.length})
              </h3>
              
              {/* Pagination Info */}
              <div style={styles.paginationInfo}>
                {indexOfFirstCustomer + 1}-{Math.min(indexOfLastCustomer, allCustomers.length)} / {allCustomers.length}
              </div>
            </div>

            {loadingCustomers ? (
              <div style={styles.loadingState}>
                <div style={styles.spinner}></div>
                <p>Müştərilər yüklənir...</p>
              </div>
            ) : (
              <>
                <div style={styles.customersGrid}>
                  {currentCustomers.map((customer) => (
                    <div
                      key={customer._id}
                      onClick={() => viewCustomerDetails(customer)}
                      style={styles.customerCard}
                    >
                      <div style={styles.customerCardHeader}>
                        <div style={styles.customerCardAvatar}>
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={styles.customerCardInfo}>
                          <h4 style={styles.customerCardName}>{customer.name}</h4>
                          <p style={styles.customerCardPhone}>
                            <Phone size={14} />
                            {customer.phone}
                          </p>
                        </div>
                      </div>
                      {customer.notes && (
                        <p style={styles.customerCardNotes}>{customer.notes}</p>
                      )}
                      <div style={styles.customerCardFooter}>
                        <span style={styles.viewDetailsBtn}>Detalları gör →</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div style={styles.paginationControls}>
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      style={{
                        ...styles.paginationBtn,
                        ...(currentPage === 1 ? styles.paginationBtnDisabled : {})
                      }}
                    >
                      <ChevronLeft size={18} />
                      Əvvəlki
                    </button>

                    <div style={styles.paginationPages}>
                      {/* İlk səhifə */}
                      {currentPage > 3 && (
                        <>
                          <button
                            onClick={() => goToPage(1)}
                            style={styles.pageNumber}
                          >
                            1
                          </button>
                          {currentPage > 4 && <span style={styles.paginationDots}>...</span>}
                        </>
                      )}

                      {/* Cari səhifəyə yaxın səhifələr */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          return page === currentPage || 
                                 page === currentPage - 1 || 
                                 page === currentPage + 1 ||
                                 page === currentPage - 2 ||
                                 page === currentPage + 2;
                        })
                        .map(page => (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            style={{
                              ...styles.pageNumber,
                              ...(page === currentPage ? styles.pageNumberActive : {})
                            }}
                          >
                            {page}
                          </button>
                        ))}

                      {/* Son səhifə */}
                      {currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && <span style={styles.paginationDots}>...</span>}
                          <button
                            onClick={() => goToPage(totalPages)}
                            style={styles.pageNumber}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      style={{
                        ...styles.paginationBtn,
                        ...(currentPage === totalPages ? styles.paginationBtnDisabled : {})
                      }}
                    >
                      Növbəti
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '30px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0
  },
  searchCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  searchTypeToggle: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px'
  },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    background: 'white',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '14px',
    fontWeight: '500'
  },
  toggleBtnActive: {
    borderColor: '#667eea',
    background: '#667eea',
    color: 'white'
  },
  searchInputGroup: {
    display: 'flex',
    gap: '12px'
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  searchBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'background 0.2s'
  },
  errorAlert: {
    marginTop: '16px',
    padding: '12px 16px',
    background: '#fee2e2',
    color: '#dc2626',
    borderRadius: '8px',
    fontSize: '14px'
  },
  resultsGrid: {
    marginBottom: '24px'
  },
  resultsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '16px'
  },
  resultCard: {
    background: 'white',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '12px',
    cursor: 'pointer',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s'
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  resultName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  resultPhone: {
    fontSize: '14px',
    color: '#64748b'
  },
  resultStats: {
    display: 'flex',
    gap: '16px'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: '#64748b'
  },
  customerSection: {
    display: 'grid',
    gap: '24px'
  },
  customerCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  customerHeader: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e2e8f0'
  },
  customerAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '24px',
    fontWeight: '700'
  },
  customerInfo: {
    flex: 1
  },
  customerName: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0'
  },
  customerPhone: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    color: '#64748b',
    margin: '0 0 8px 0'
  },
  customerNotes: {
    fontSize: '14px',
    color: '#64748b',
    fontStyle: 'italic'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '8px'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 4px 0'
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0
  },
  favoritesSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  },
  favoriteCard: {
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '8px'
  },
  favoriteTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '12px'
  },
  favoriteList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  favoriteItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px',
    background: 'white',
    borderRadius: '6px'
  },
  favoriteName: {
    fontSize: '14px',
    color: '#334155'
  },
  favoriteCount: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#667eea',
    padding: '2px 8px',
    background: '#eef2ff',
    borderRadius: '12px'
  },
  appointmentsSection: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '20px'
  },
  appointmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  appointmentCard: {
    padding: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    transition: 'all 0.2s'
  },
  appointmentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  appointmentDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  appointmentBody: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  appointmentInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '14px'
  },
  appointmentDetail: {
    color: '#64748b',
    fontSize: '13px'
  },
  appointmentPrice: {
    textAlign: 'right'
  },
  priceLabel: {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '4px'
  },
  priceValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b'
  },
  tipsValue: {
    fontSize: '12px',
    color: '#10b981',
    marginTop: '4px'
  },
  advancePayment: {
    marginTop: '12px',
    padding: '8px 12px',
    background: '#f0fdf4',
    color: '#166534',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '12px'
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '16px 0 8px 0'
  },
  emptyText: {
    fontSize: '15px',
    color: '#64748b',
    maxWidth: '400px',
    margin: '0 auto'
  },
  // ✅ YENİ - Müştərilər siyahısı üçün style-lar
  customersListSection: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  customersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e2e8f0'
  },
  customersTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500'
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '16px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  customersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  customerCard: {
    padding: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: 'white'
  },
  customerCardHeader: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px'
  },
  customerCardAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '18px',
    fontWeight: '700',
    flexShrink: 0
  },
  customerCardInfo: {
    flex: 1,
    minWidth: 0
  },
  customerCardName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 6px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  customerCardPhone: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },
  customerCardNotes: {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 12px 0',
    fontStyle: 'italic',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  customerCardFooter: {
    paddingTop: '12px',
    borderTop: '1px solid #f1f5f9'
  },
  viewDetailsBtn: {
    fontSize: '13px',
    color: '#667eea',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  paginationControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0'
  },
  paginationBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  paginationBtnDisabled: {
    background: '#e2e8f0',
    color: '#94a3b8',
    cursor: 'not-allowed'
  },
  paginationPages: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center'
  },
  pageNumber: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    background: 'white',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  pageNumberActive: {
    background: '#667eea',
    color: 'white',
    borderColor: '#667eea'
  },
  paginationDots: {
    color: '#94a3b8',
    fontSize: '14px',
    padding: '0 4px'
  }
};