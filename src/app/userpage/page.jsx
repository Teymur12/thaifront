'use client'
import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  UserCheck,
  BarChart3,
  Grid3X3,
  Menu,
  X,
  Home,
  ChevronLeft,
  ChevronRight,
  Gift,
  LogOut,
  History  // ✅ YENİ ICON
} from 'lucide-react';
import Hesabat from '../userpage/hesabat.jsx';
import Cedvel from '../userpage/cedvel.jsx';
import GiftCardManager from './GiftCardManager.jsx';
import WeeklyBlockManager from './WeeklyBlockManager.jsx';
import CompleteAppointment from './completePaymentModal.jsx';
import CustomerHistory from './CustomerHistory.jsx';
import PackageSale from './PackageSale.jsx';  // ✅ YENİ COMPONENT
import Cookies from 'js-cookie';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://thaiback.onrender.com/api';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeItem, setActiveItem] = useState('hesabat');
  const [masseurs, setMasseurs] = useState([]);
  const [loading, setLoading] = useState(false);

  const menuItems = [
    {
      id: 'hesabat',
      label: 'Hesabat',
      icon: BarChart3,
      message: 'Salam! Bu Hesabat bölməsidir.'
    },
    {
      id: 'cedvel',
      label: 'Cədvəl',
      icon: Grid3X3,
      message: 'Salam! Bu Cədvəl bölməsidir.'
    },
    {
      id: 'giftcards',
      label: 'Hədiyyə Kartları',
      icon: Gift,
      message: 'Salam! Bu Hədiyyə Kartları bölməsidir.'
    },
    {
      id: 'blockeddays',
      label: 'İstirahət günləri',
      icon: Users,
      message: 'Salam! Bu İstirahət günləri bölməsidir.'
    },
    {
      id: 'complete',
      label: 'Randevulari tamamla',
      icon: Grid3X3,
      message: 'Salam! Bu odenis qeyd etme bölməsidir.'
    },
    // ✅ YENİ MENU ITEM
    {
      id: 'customer-history',
      label: 'Müştəri Tarixçəsi',
      icon: History,
      message: 'Müştərilərin əvvəlki randevularını görün'
    },
    {
      id: 'package-sale',
      label: 'Paket Satışı',
      icon: Gift,
      message: 'Yeni paket satışı'
    }
  ];

  const getToken = () => {
    return Cookies.get('authToken');
  };

  // Masajistləri çək
  const fetchMasseurs = async () => {
    try {
      setLoading(true);
      const token = getToken();

      if (!token) {
        console.error('Token tapılmadı');
        return;
      }

      const response = await fetch(`${API_BASE}/receptionist/masseurs/${token}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMasseurs(data);
      } else {
        console.error('Masajistləri çəkməkdə xəta');
      }
    } catch (error) {
      console.error('Fetch masseurs error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Component yüklənəndə masajistləri çək
  useEffect(() => {
    fetchMasseurs();
  }, []);

  const handleLogout = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
      }

      document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/userlogin';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleItemClick = (item) => {
    setActiveItem(item.id);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const renderContent = () => {
    if (activeItem === 'hesabat') {
      return <Hesabat />;
    }

    if (activeItem === 'cedvel') {
      return <Cedvel />;
    }

    if (activeItem === 'giftcards') {
      return <GiftCardManager />;
    }

    if (activeItem === 'blockeddays') {
      return <WeeklyBlockManager masseurs={masseurs} loading={loading} />;
    }

    if (activeItem === 'complete') {
      return <CompleteAppointment />;
    }

    // ✅ YENİ - Müştəri Tarixçəsi
    if (activeItem === 'customer-history') {
      return <CustomerHistory />;
    }

    if (activeItem === 'package-sale') {
      return <PackageSale />;
    }

    return (
      <div style={styles.content}>
        <div style={styles.contentHeader}>
          <h1 style={styles.contentTitle}>
            {menuItems.find(item => item.id === activeItem)?.label || 'Ana Səhifə'}
          </h1>
          <p style={styles.contentSubtitle}>
            {activeItem === 'home' ? 'Dashboarda xoş gəlmisiniz' : `${menuItems.find(item => item.id === activeItem)?.label} bölməsindesiniz`}
          </p>
        </div>

        <div style={styles.contentBody}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              {menuItems.find(item => item.id === activeItem)?.label} Məlumatları
            </h3>
            <p style={styles.cardText}>
              Bu bölmədə {menuItems.find(item => item.id === activeItem)?.label.toLowerCase()} ilə bağlı bütün əməliyyatları həyata keçirə bilərsiniz.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.layout}>
      {/* Sol Sidebar */}
      <div style={{
        ...styles.sidebar,
        width: isCollapsed ? '70px' : '280px'
      }}>
        {/* Header */}
        <div style={styles.header}>
          {!isCollapsed && (
            <div style={styles.logo}>
              <Building2 size={28} color="#667eea" />
              <h2 style={styles.logoText}>User Panel</h2>
            </div>
          )}

          <button onClick={toggleSidebar} style={styles.toggleBtn}>
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav style={styles.nav}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeItem === item.id;

            return (
              <div key={item.id} style={styles.menuItemWrapper}>
                <button
                  onClick={() => handleItemClick(item)}
                  style={{
                    ...styles.menuItem,
                    backgroundColor: isActive ? '#667eea' : 'transparent',
                    color: isActive ? 'white' : '#64748b',
                    justifyContent: isCollapsed ? 'center' : 'flex-start'
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#f1f5f9';
                      e.currentTarget.style.color = '#334155';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#64748b';
                    }
                  }}
                  title={isCollapsed ? item.label : ''}
                >
                  <IconComponent size={20} />
                  {!isCollapsed && <span style={styles.menuText}>{item.label}</span>}
                </button>

                {isActive && (
                  <div style={styles.activeIndicator}></div>
                )}
              </div>
            );
          })}

          {/* Çıxış düyməsi */}
          <div style={styles.menuItemWrapper}>
            <button
              onClick={handleLogout}
              style={{
                ...styles.menuItem,
                backgroundColor: 'transparent',
                color: '#dc2626',
                justifyContent: isCollapsed ? 'center' : 'flex-start'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#fee2e2';
                e.currentTarget.style.color = '#b91c1c';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#dc2626';
              }}
              title={isCollapsed ? 'Çıxış' : ''}
            >
              <LogOut size={20} />
              {!isCollapsed && <span style={styles.menuText}>Çıxış</span>}
            </button>
          </div>
        </nav>

        {/* Footer - User Info */}
        {!isCollapsed && (
          <div style={styles.footer}>
            <div style={styles.userInfo}>
              <div style={styles.avatar}>
                <span>R</span>
              </div>
              <div style={styles.userDetails}>
                <p style={styles.userName}>Reception</p>
                <p style={styles.userRole}>Reception</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{
        ...styles.mainContent,
        marginLeft: isCollapsed ? '70px' : '280px'
      }}>
        {renderContent()}
      </div>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },

  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100vh',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    borderRight: '1px solid #e2e8f0',
    boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
    transition: 'width 0.3s ease',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column'
  },

  header: {
    padding: '20px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '80px'
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  logoText: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },

  toggleBtn: {
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer',
    color: '#64748b',
    transition: 'all 0.2s ease'
  },

  nav: {
    flex: 1,
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  menuItemWrapper: {
    position: 'relative',
    margin: '0 12px'
  },

  menuItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    border: 'none',
    borderRadius: '10px',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: '500'
  },

  menuText: {
    fontSize: '14px',
    fontWeight: '500'
  },

  activeIndicator: {
    position: 'absolute',
    right: '-12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '3px',
    height: '20px',
    backgroundColor: '#667eea',
    borderRadius: '2px'
  },

  footer: {
    padding: '20px',
    borderTop: '1px solid #e2e8f0'
  },

  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: '14px'
  },

  userDetails: {
    flex: 1
  },

  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 2px 0'
  },

  userRole: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0
  },

  mainContent: {
    flex: 1,
    transition: 'margin-left 0.3s ease',
    background: '#f8fafc'
  },

  content: {
    padding: '30px',
    maxWidth: '1200px'
  },

  contentHeader: {
    marginBottom: '30px'
  },

  contentTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0'
  },

  contentSubtitle: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0
  },

  contentBody: {
    display: 'grid',
    gap: '24px'
  },

  card: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  },

  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 12px 0'
  },

  cardText: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
    lineHeight: '1.6'
  }
};