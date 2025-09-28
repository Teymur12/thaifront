'use client'
import { useState } from 'react';
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
  Scissors,
  Gift,
  LogOut
} from 'lucide-react';
import Filiallar from '../home/filials.jsx';
import Masajistler from '../home/Masajistler.jsx';
import Reseptionlar from '../home/Reseptions.jsx';
import Hesabat from '../home/hesabat.jsx';
import Cedvel from '../home/cedvel.jsx';
import MasajNovleri from './massaj.jsx';
import GiftCardsAdmin from './GiftCardsAdmin.jsx';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true); // 🔹 Başlanğıcda bağlı olsun
  const [activeItem, setActiveItem] = useState('');

  const menuItems = [
    {
      id: 'filiallar',
      label: 'Filiallar',
      icon: Building2,
      message: 'Salam! Bu Filiallar bölməsidir.'
    },
    {
      id: 'masajistler',
      label: 'Masajistlər',
      icon: Users,
      message: 'Salam! Bu Masajistlər bölməsidir.'
    },
    {
      id: 'masaj-novleri',
      label: 'Masaj Növləri',
      icon: Scissors,
      message: 'Salam! Bu Masaj Növləri bölməsidir.'
    },
    {
      id: 'receptions',
      label: 'Reseptionlar',
      icon: UserCheck,
      message: 'Salam! Bu Reseptionlar bölməsidir.'
    },
    {
      id: 'gift-cards',
      label: 'Hədiyyə Kartları',
      icon: Gift,
      message: 'Salam! Bu Hədiyyə Kartları bölməsidir.'
    },
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
    }
  ];

  // 🔹 Çıxış funksiyası
  const handleLogout = () => {
    try {
      // LocalStorage-dan userData-nı sil
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userData');
      }
      
      // Cookie-dən authToken-i sil
      // Cookies.remove('authToken'); // Əgər js-cookie istifadə edirsinizsə
      document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Sayta yönləndirmə və ya login səhifəsinə keçid
      window.location.href = '/adminlogin'; // və ya istədiyiniz səhifə
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
  if (activeItem === 'filiallar') {
    return <Filiallar />;
  }

  if (activeItem === 'masajistler') {
    return <Masajistler />;
  }

  if (activeItem === 'masaj-novleri') {
    return <MasajNovleri />;
  }

  if (activeItem === 'receptions') {
    return <Reseptionlar />;
  }

  if (activeItem === 'gift-cards') {
    return <GiftCardsAdmin />;
  }

  if (activeItem === 'hesabat') {
    return <Hesabat />;
  }

  if (activeItem === 'cedvel') {
    return <Cedvel />;
  }
  
    return (
      <div style={styles.content}>
        <div style={styles.contentHeader}>
          <h1 style={styles.contentTitle}>
            Admin Paneli
          </h1>
          <p style={styles.contentSubtitle}>
            Xoş gəlmisiniz! Yan menyudan istədiyiniz bölməni seçin.
          </p>
        </div>
        
        <div style={styles.contentBody}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              Başlanğıc Səhifə
            </h3>
            <p style={styles.cardText}>
              Bu admin panelindəki bütün funksiyalara sol menyudan daxil ola bilərsiniz.
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
              <h2 style={styles.logoText}>Admin Panel</h2>
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
                
                {/* Active indicator */}
                {isActive && (
                  <div style={styles.activeIndicator}></div>
                )}
              </div>
            );
          })}

          {/* 🔹 Çıxış düyməsi */}
          <div style={styles.menuItemWrapper}>
            <button
              onClick={handleLogout}
              style={{
                ...styles.menuItem,
                backgroundColor: 'transparent',
                color: '#dc2626', // Qırmızı rəng
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
                <span>A</span>
              </div>
              <div style={styles.userDetails}>
                <p style={styles.userName}>Admin User</p>
                <p style={styles.userRole}>Administrator</p>
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