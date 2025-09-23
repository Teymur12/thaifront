'use client'
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Building2, Users, Clock, CreditCard, Banknote, Smartphone } from 'lucide-react';
import Cookies from 'js-cookie';

export default function GundelikHesabat() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getToken = () => {
    return Cookies.get('authToken');
  };

  const fetchDailyReport = async (date) => {
    setLoading(true);
    setError('');
    
    try {
      const token = getToken();
      const response = await fetch(`https://thaiback.onrender.com/api/admin/reports/daily/${date}/${token}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Hesabat məlumatları alınarkən xəta baş verdi');
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyReport(selectedDate);
  }, [selectedDate]);

  const formatMebleg = (amount) => {
    return `${amount.toFixed(2)} ₼`;
  };

  const formatTarix = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  // Ümumi statistikalar
  const getTotalStats = () => {
    if (!reportData || !reportData.branches) {
      return { totalRevenue: 0, totalExpenses: 0, totalAppointments: 0, netProfit: 0 };
    }

    const branches = Object.values(reportData.branches);
    const totalRevenue = branches.reduce((sum, branch) => sum + branch.revenue.total, 0);
    const totalExpenses = branches.reduce((sum, branch) => sum + branch.expenses.total, 0);
    const totalAppointments = branches.reduce((sum, branch) => sum + branch.appointments, 0);
    const netProfit = totalRevenue - totalExpenses;

    return { totalRevenue, totalExpenses, totalAppointments, netProfit };
  };

  const { totalRevenue, totalExpenses, totalAppointments, netProfit } = getTotalStats();

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return <Banknote size={16} />;
      case 'card':
        return <CreditCard size={16} />;
      case 'terminal':
        return <Smartphone size={16} />;
      default:
        return <DollarSign size={16} />;
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'cash':
        return 'Nağd';
      case 'card':
        return 'Bank Kartı';
      case 'terminal':
        return 'Terminal';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Hesabat yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerIcon}>
            <Calendar size={24} color="#667eea" />
          </div>
          <div>
            <h1 style={styles.headerTitle}>Günlük Hesabat</h1>
            <p style={styles.headerSubtitle}>{formatTarix(selectedDate)}</p>
          </div>
        </div>
        
        <div style={styles.dateSelector}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.dateInput}
          />
        </div>
      </div>

      {error && (
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      {/* Ümumi Statistikalar */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <TrendingUp size={24} color="#10b981" />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Ümumi Gəlir</h3>
            <p style={styles.statValue}>{formatMebleg(totalRevenue)}</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <TrendingDown size={24} color="#ef4444" />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Ümumi Xərc</h3>
            <p style={styles.statValue}>{formatMebleg(totalExpenses)}</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <Users size={24} color="#8b5cf6" />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Görüşlər</h3>
            <p style={styles.statValue}>{totalAppointments}</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <DollarSign size={24} color={netProfit >= 0 ? "#10b981" : "#ef4444"} />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Xalis Gəlir</h3>
            <p style={{
              ...styles.statValue,
              color: netProfit >= 0 ? "#10b981" : "#ef4444"
            }}>
              {formatMebleg(netProfit)}
            </p>
          </div>
        </div>
      </div>

      {/* Filial üzrə Hesabat */}
      {reportData && reportData.branches && Object.keys(reportData.branches).length > 0 ? (
        <div style={styles.branchesContainer}>
          <h2 style={styles.sectionTitle}>Filial üzrə Hesabat</h2>
          
          <div style={styles.branchesGrid}>
            {Object.values(reportData.branches).map((branch, index) => (
              <div key={index} style={styles.branchCard}>
                <div style={styles.branchHeader}>
                  <div style={styles.branchIcon}>
                    <Building2 size={20} color="#667eea" />
                  </div>
                  <h3 style={styles.branchName}>{branch.name}</h3>
                </div>

                {/* Gəlir Məlumatları */}
                <div style={styles.branchSection}>
                  <h4 style={styles.branchSectionTitle}>
                    <TrendingUp size={16} color="#10b981" />
                    Gəlirlər
                  </h4>
                  <div style={styles.revenueGrid}>
                    {branch.revenue.cash > 0 && (
                      <div style={styles.paymentItem}>
                        <div style={styles.paymentIcon}>
                          {getPaymentMethodIcon('cash')}
                        </div>
                        <div>
                          <span style={styles.paymentLabel}>Nağd</span>
                          <span style={styles.paymentAmount}>{formatMebleg(branch.revenue.cash)}</span>
                        </div>
                      </div>
                    )}
                    {branch.revenue.card > 0 && (
                      <div style={styles.paymentItem}>
                        <div style={styles.paymentIcon}>
                          {getPaymentMethodIcon('card')}
                        </div>
                        <div>
                          <span style={styles.paymentLabel}>Bank Kartı</span>
                          <span style={styles.paymentAmount}>{formatMebleg(branch.revenue.card)}</span>
                        </div>
                      </div>
                    )}
                    {branch.revenue.terminal > 0 && (
                      <div style={styles.paymentItem}>
                        <div style={styles.paymentIcon}>
                          {getPaymentMethodIcon('terminal')}
                        </div>
                        <div>
                          <span style={styles.paymentLabel}>Terminal</span>
                          <span style={styles.paymentAmount}>{formatMebleg(branch.revenue.terminal)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={styles.totalRevenue}>
                    <strong>Toplam: {formatMebleg(branch.revenue.total)}</strong>
                  </div>
                </div>

                {/* Xərc Məlumatları */}
                {branch.expenses.total > 0 && (
                  <div style={styles.branchSection}>
                    <h4 style={styles.branchSectionTitle}>
                      <TrendingDown size={16} color="#ef4444" />
                      Xərclər ({formatMebleg(branch.expenses.total)})
                    </h4>
                    <div style={styles.expensesList}>
                      {branch.expenses.items.map((expense, expIndex) => (
                        <div key={expIndex} style={styles.expenseItem}>
                          <span style={styles.expenseDescription}>{expense.description}</span>
                          <div>
                            <span style={styles.expenseCategory}>{expense.category}</span>
                            <span style={styles.expenseAmount}>{formatMebleg(expense.amount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Görüşlər */}
                <div style={styles.branchFooter}>
                  <div style={styles.appointmentsBadge}>
                    <Clock size={14} />
                    <span>{branch.appointments} görüş</span>
                  </div>
                  <div style={styles.netProfitBadge}>
                    Xalis: {formatMebleg(branch.revenue.total - branch.expenses.total)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={styles.emptyState}>
          <Calendar size={48} color="#9ca3af" />
          <h3 style={styles.emptyTitle}>Bu tarix üçün məlumat tapılmadı</h3>
          <p style={styles.emptySubtitle}>Seçdiyiniz tarixdə heç bir əməliyyat aparılmayıb</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    maxWidth: '1400px',
    background: '#f8fafc',
    minHeight: '100vh'
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '16px'
  },

  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  },

  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },

  headerIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    background: '#f0f4ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  headerTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },

  headerSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '4px 0 0 0'
  },

  dateSelector: {
    display: 'flex',
    gap: '12px'
  },

  dateInput: {
    padding: '10px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'white',
    cursor: 'pointer',
    minWidth: '150px'
  },

  errorContainer: {
    background: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px'
  },

  errorText: {
    color: '#dc2626',
    margin: 0,
    fontSize: '14px'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },

  statCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },

  statIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '10px',
    background: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  statContent: {
    flex: 1
  },

  statTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
    margin: '0 0 8px 0'
  },

  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },

  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '20px'
  },

  branchesContainer: {
    marginTop: '30px'
  },

  branchesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px'
  },

  branchCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  },

  branchHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9'
  },

  branchIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: '#f0f4ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  branchName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },

  branchSection: {
    marginBottom: '20px'
  },

  branchSectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '12px'
  },

  revenueGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  paymentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0'
  },

  paymentIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    background: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b'
  },

  paymentLabel: {
    display: 'block',
    fontSize: '14px',
    color: '#64748b',
    marginRight: '12px'
  },

  paymentAmount: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#10b981'
  },

  totalRevenue: {
    marginTop: '12px',
    padding: '12px',
    background: '#f0fdf4',
    borderRadius: '8px',
    color: '#15803d',
    textAlign: 'center'
  },

  expensesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  expenseItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f3f4f6'
  },

  expenseDescription: {
    fontSize: '14px',
    color: '#374151'
  },

  expenseCategory: {
    fontSize: '12px',
    color: '#6b7280',
    marginRight: '8px'
  },

  expenseAmount: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ef4444'
  },

  branchFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9'
  },

  appointmentsBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: '#f3e8ff',
    color: '#7c3aed',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500'
  },

  netProfitBadge: {
    padding: '6px 12px',
    background: '#ecfdf5',
    color: '#059669',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600'
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  },

  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#374151',
    margin: '20px 0 8px 0'
  },

  emptySubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    textAlign: 'center'
  }
};