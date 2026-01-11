'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Component mount olduqdan sonra client-side kodları işlət
  useEffect(() => {
    setMounted(true);
  }, []);

  // Authentication yoxlama - yalnız client-side
  useEffect(() => {
    if (!mounted) return; // Server-side render zamanı işləməsin
    
    const checkAuth = () => {
      const token = getCookie('authToken');
      if (token) {
        try {
          // Token-i decode et (client-side üçün sadə yoxlama)
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.role === 'admin') {
            router.push('/');
            return;
          }
        } catch (error) {
          console.error('Token decode error:', error);
        }
      }
    };
    checkAuth();
  }, [router, mounted]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const setCookie = (name, value, days = 30) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  const getCookie = (name) => {
    if (typeof document === 'undefined') return null; // Server-side check
    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => c.trim().startsWith(name + '='));
    return cookie ? cookie.split('=')[1] : null;
  };
  
  // localStorage üçün safe funksiya
  const setUserData = (userData) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('userData', JSON.stringify(userData));
      } catch (error) {
        console.error('LocalStorage error:', error);
      }
    }
  };

  const removeUserData = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('userData');
      } catch (error) {
        console.error('LocalStorage error:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://thaiback.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Token-i cookie-yə yaz
        setCookie('authToken', data.token, 30);
        
        // User məlumatlarını localStorage-ə yaz (əlavə məlumat üçün)
        setUserData(data.user);
        
        // Role yoxla və müvafiq səhifəyə yönləndir
        if (data.user.role === 'admin') {
          router.push('/');
        } else {
          setError('Bu hesab admin hesabı deyil!');
          return;
        }
        
      } else {
        setError(data.message || 'Giriş uğursuz oldu');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Server ilə əlaqə qurula bilmədi. Zəhmət olmasa yenidən cəhd edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Cookie-ni sil
    if (typeof document !== 'undefined') {
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
    removeUserData();
    router.push('/');
  };

  // Server-side render zamanı loading göstər
  if (!mounted) {
    return (
      <div style={styles.container}>
        <div style={styles.loginForm}>
          <div style={styles.loading}>Yüklənir...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.loginForm}>
        <h2 style={styles.title}>Admin Girişi</h2>
        <p style={styles.subtitle}>Admin panelə daxil olmaq üçün məlumatları daxil edin</p>
        
        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}
        
        <div>
          <div style={styles.formGroup}>
            <label htmlFor="username" style={styles.label}>İstifadəçi Adı</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={styles.input}
              placeholder="İstifadəçi adınızı daxil edin"
              required
              disabled={loading}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Parol</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="Parolunuzu daxil edin"
              required
              disabled={loading}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <button 
            type="submit" 
            onClick={handleSubmit}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.3)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? 'Giriş edilir...' : 'Admin Kimi Daxil Ol'}
          </button>

          <div style={styles.linkContainer}>
            <button
              onClick={() => router.push('/userlogin')}
              style={styles.linkButton}
              type="button"
            >
              İstifadəçi girişi
            </button>
            <span style={styles.separator}>•</span>
            <button
              onClick={() => router.push('/')}
              style={styles.linkButton}
              type="button"
            >
              Ana səhifə
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  loginForm: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)'
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '10px',
    fontSize: '24px',
    fontWeight: '700'
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '30px',
    fontSize: '14px'
  },
  loading: {
    textAlign: 'center',
    color: '#666',
    fontSize: '16px',
    padding: '20px'
  },
  errorMessage: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #fcc',
    fontSize: '14px',
    textAlign: 'center'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    background: 'white',
    boxSizing: 'border-box'
  },
  submitButton: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '20px'
  },
  linkContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20px',
    gap: '10px'
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'underline'
  },
  separator: {
    color: '#ccc',
    fontSize: '14px'
  }
};