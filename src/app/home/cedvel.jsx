import { useState, useEffect } from 'react';
import { 
  Building2, 
  ChevronLeft,
  ChevronRight,
  Trash2,
  Calendar,
  Users,
  User
} from 'lucide-react';
import Cookies from 'js-cookie';


// Token alıcı funksiya (Cookies-dən)
 const getToken = () => {
          return Cookies.get('authToken');
    
  };

// API base URL
const API_BASE = 'https://thaiback.onrender.com/api';

// Cədvəl Komponenti (Yalnız Admin Görüntüləmə)
export default function AdminCedvel() {
  // State-lər
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [masseurs, setMasseurs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Saatları generasiya et (10:30 - 21:00)
  const generateTimeSlots = () => {
    const slots = [];
    let hour = 10;
    let minute = 30;

    while (hour < 21 || (hour === 21 && minute === 0)) {
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      minute += 15;
      if (minute >= 60) {
        minute = minute % 60;
        hour += 1;
      }
    }
    return slots;
  };

  const hours = generateTimeSlots();

  // API funksiyaları
  const fetchBranches = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/branches/${getToken()}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBranches(data);
      }
    } catch (error) {
      console.error('Filiallar yüklənə bilmədi:', error);
    }
  };

  const fetchMasseurs = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/masseurs/${getToken()}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMasseurs(data);
      }
    } catch (error) {
      console.error('Masajistlər yüklənə bilmədi:', error);
    }
  };

  const fetchAppointments = async () => {
    if (!selectedBranch) return;
    
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(
        `${API_BASE}/appointments/daily/${selectedBranch}/${dateStr}/${getToken()}`,
        {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Randevular yüklənə bilmədi:', error);
    }
    setLoading(false);
  };

  // Component mount olduqda data yüklə
  useEffect(() => {
    fetchBranches();
    fetchMasseurs();
  }, []);

  // Filial və ya tarix dəyişdikdə randevuları yüklə
  useEffect(() => {
    if (selectedBranch) {
      fetchAppointments();
    }
  }, [selectedBranch, selectedDate]);

  // Filialda olan masajistləri filter et
  const getBranchMasseurs = () => {
    return masseurs.filter(masseur => 
      masseur.branch && masseur.branch._id === selectedBranch
    );
  };

  // Masajist üçün randevuları al
  const getMasseurAppointments = (masseurId) => {
    return appointments.filter(appointment => 
      appointment.masseur && appointment.masseur._id === masseurId
    );
  };

  // Vaxt slotunun məşğul olub-olmadığını yoxla
  const isTimeSlotOccupied = (masseurId, time) => {
    const masseurAppointments = getMasseurAppointments(masseurId);
    return masseurAppointments.find(appointment => {
      const appointmentStart = new Date(appointment.startTime);
      const appointmentEnd = new Date(appointment.endTime);
      const slotTime = new Date(selectedDate);
      const [hours, minutes] = time.split(':').map(Number);
      slotTime.setHours(hours, minutes, 0, 0);
      
      return slotTime >= appointmentStart && slotTime < appointmentEnd;
    });
  };

  // Randevunun başlanğıc slotu olub-olmadığını yoxla
  const isAppointmentStart = (masseurId, time) => {
    const masseurAppointments = getMasseurAppointments(masseurId);
    const foundAppointment = masseurAppointments.find(appointment => {
      const appointmentStart = new Date(appointment.startTime);
      const slotTime = new Date(selectedDate);
      const [hours, minutes] = time.split(':').map(Number);
      slotTime.setHours(hours, minutes, 0, 0);
      
      return appointmentStart.getTime() === slotTime.getTime();
    });
    
    return !!foundAppointment;
  };

  // Randevu sil
  const deleteAppointment = async (appointmentId) => {
    if (!confirm('Bu randevunu silmək istədiyinizdən əminsiniz?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/appointments/${appointmentId}/${getToken()}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });

      if (response.ok) {
        await fetchAppointments(); // Cədvəli yenilə
        alert('Randevu uğurla silindi!');
      } else {
        throw new Error('Randevu silinə bilmədi');
      }
    } catch (error) {
      console.error('Randevu silinə bilmədi:', error);
      alert('Randevu silinərkən xəta baş verdi!');
    }
    setLoading(false);
  };

  // Tarixi dəyiş
  const changeDate = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  // Əgər filial seçilməmişsə, filial seçim ekranını göstər
  if (!selectedBranch) {
    return (
      <div style={styles.branchSelectionContainer}>
        <div style={styles.branchSelectionCard}>
          <div style={styles.branchSelectionHeader}>
            <Building2 size={40} color="#667eea" />
            <h2 style={styles.branchSelectionTitle}>Filial Seçin</h2>
            <p style={styles.branchSelectionSubtitle}>Randevu cədvəlini görüntüləmək üçün filialı seçin</p>
          </div>
          
          <div style={styles.branchList}>
            {branches.map(branch => (
              <button
                key={branch._id}
                onClick={() => setSelectedBranch(branch._id)}
                style={styles.branchButton}
              >
                <Building2 size={24} />
                <span>{branch.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selectedBranchData = branches.find(b => b._id === selectedBranch);
  const branchMasseurs = getBranchMasseurs();

  return (
    <div style={styles.container}>
      {loading && <div style={styles.loadingOverlay}>Yüklənir...</div>}
      
      {/* Header */}
      <div style={styles.header}>
        {/* Filial başlığı */}
        <div style={styles.branchHeader}>
          <div style={styles.branchInfo}>
            <Building2 size={24} color="#667eea" />
            <h1 style={styles.branchName}>
              {selectedBranchData?.name}
            </h1>
          </div>
          <button
            onClick={() => setSelectedBranch('')}
            style={styles.changeBranchBtn}
          >
            Filial Dəyiş
          </button>
        </div>

        {/* Tarix navigasiyası */}
        <div style={styles.dateNavigation}>
          <button onClick={() => changeDate(-1)} style={styles.dateBtn}>
            <ChevronLeft size={20} />
            Əvvəlki Gün
          </button>
          
          <div style={styles.dateTitle}>
            <Calendar size={24} />
            <h2 style={styles.dateText}>
              {selectedDate.toLocaleDateString('az-AZ', { 
                year: 'numeric',
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </h2>
          </div>
          
          <button onClick={() => changeDate(1)} style={styles.dateBtn}>
            Növbəti Gün
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Masajist sayı məlumatı */}
      <div style={styles.masseursInfo}>
        <Users size={20} />
        <span>Aktiv Masajistlər: {branchMasseurs.length} nəfər</span>
      </div>

      {/* Cədvəl */}
      <div style={styles.scheduleContainer}>
        <div 
          style={{
            ...styles.scheduleGrid,
            gridTemplateColumns: `120px repeat(${branchMasseurs.length}, 1fr)`
          }}
        >
          {/* Header - saatlar */}
          <div style={styles.timeColumn}>Saat</div>
          
          {/* Header - masajistlər */}
          {branchMasseurs.map((masseur) => (
            <div key={masseur._id} style={styles.masseurHeader}>
              <div style={styles.masseurInfo}>
                <User size={18} />
                <div>
                  <div style={styles.masseurName}>{masseur.name}</div>
                  <div style={styles.masseurRole}>Masajist</div>
                </div>
              </div>
            </div>
          ))}

          {/* Saat sətirləri */}
          {hours.map((timeSlot) => (
            <div key={timeSlot} style={styles.scheduleRow}>
              {/* Saat göstəricisi */}
              <div style={styles.timeCell}>
                <span style={styles.timeLabel}>{timeSlot}</span>
              </div>

              {/* Hər masajist üçün slot */}
              {branchMasseurs.map((masseur) => {
                const appointment = isTimeSlotOccupied(masseur._id, timeSlot);
                const isStartSlot = isAppointmentStart(masseur._id, timeSlot);
                
                return (
                  <div 
                    key={`${masseur._id}-${timeSlot}`}
                    style={{
                      ...styles.timeSlot,
                      backgroundColor: appointment ? '#e0f2fe' : '#ffffff',
                      borderColor: appointment ? '#0284c7' : '#e5e7eb'
                    }}
                  >
                    {appointment ? (
                      // Yalnız başlanğıc slotda tam məlumat göstər
                      isStartSlot ? (
                        <div style={styles.appointmentCard}>
                          <div style={styles.appointmentHeader}>
                            <span style={styles.appointmentTime}>
                              {new Date(appointment.startTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })} - 
                              {new Date(appointment.endTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div style={styles.appointmentActions}>
                              <button 
                                style={styles.deleteBtn} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteAppointment(appointment._id);
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                          <div style={styles.appointmentInfo}>
                            <span style={styles.customerName}>
                              {appointment.customer?.name}
                            </span>
                            <span style={styles.massageType}>
                              {appointment.massageType?.name}
                            </span>
                            <span style={styles.appointmentPrice}>
                              {appointment.price} ₼
                            </span>
                          </div>
                        </div>
                      ) : (
                        // Davam edən slotlarda yalnız göstərici
                        <div style={styles.continueSlot}>
                          <div style={styles.continueIndicator}></div>
                        </div>
                      )
                    ) : (
                      // Boş slot
                      <div style={styles.emptySlot}>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>Boş</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3000,
    color: 'white',
    fontSize: '18px',
    fontWeight: '600'
  },

  // Filial seçimi stilləri
  branchSelectionContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },

  branchSelectionCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%'
  },

  branchSelectionHeader: {
    marginBottom: '30px'
  },

  branchSelectionTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '16px 0 8px 0'
  },

  branchSelectionSubtitle: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0
  },

  branchList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  branchButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    background: '#f8fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    color: '#374151',
    transition: 'all 0.3s ease'
  },

  // Ana container
  container: {
    padding: '20px',
    background: '#f8fafc',
    minHeight: '100vh',
    position: 'relative'
  },

  header: {
    marginBottom: '20px'
  },

  branchHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px'
  },

  branchInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  branchName: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },

  changeBranchBtn: {
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },

  dateNavigation: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },

  dateBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },

  dateTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#1e293b'
  },

  dateText: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0
  },

  masseursInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#e0f2fe',
    color: '#0284c7',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500'
  },

  scheduleContainer: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'auto'
  },

  scheduleGrid: {
    display: 'grid',
    minWidth: '1000px'
  },

  timeColumn: {
    background: '#f8fafc',
    padding: '12px',
    fontWeight: '600',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#374151'
  },

  masseurHeader: {
    background: '#f8fafc',
    padding: '12px',
    borderRight: '1px solid #e5e7eb',
    borderBottom: '2px solid #e5e7eb'
  },

  masseurInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },

  masseurName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },

  masseurRole: {
    fontSize: '12px',
    color: '#6b7280'
  },

  scheduleRow: {
    display: 'contents'
  },

  timeCell: {
    background: '#f8fafc',
    padding: '8px',
    borderRight: '1px solid #e5e7eb',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60px'
  },

  timeLabel: {
    fontSize: '12px',
    color: '#374151'
  },

  timeSlot: {
    borderRight: '1px solid #e5e7eb',
    borderBottom: '1px solid #f3f4f6',
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },

  emptySlot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    opacity: 0.7
  },

  appointmentCard: {
    width: '100%',
    height: '100%',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },

  appointmentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  },

  appointmentTime: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#0284c7'
  },

  appointmentActions: {
    display: 'flex',
    gap: '2px'
  },

  deleteBtn: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    padding: '2px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },

  appointmentInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },

  customerName: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#1e293b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  massageType: {
    fontSize: '9px',
    color: '#9ca3af',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  appointmentPrice: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#059669'
  },

  continueSlot: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  continueIndicator: {
    width: '100%',
    height: '4px',
    backgroundColor: '#0284c7',
    opacity: 0.6
  }
};