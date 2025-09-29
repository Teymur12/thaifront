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

const getToken = () => {
  return Cookies.get('authToken');
};

const API_BASE = 'https://thaiback.onrender.com/api';

export default function AdminCedvel() {
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [masseurs, setMasseurs] = useState([]);
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const fetchReceptionists = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/receptionists/${getToken()}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReceptionists(data);
      }
    } catch (error) {
      console.error('Resepsiyon işçiləri yüklənə bilmədi:', error);
    }
  };

  const fetchAppointments = async () => {
    if (!selectedBranch) return;
    
    setLoading(true);
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
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

  const getReceptionistName = (userId) => {
    if (!userId) return 'Məlum deyil';
    const receptionist = receptionists.find(r => r._id === userId);
    return receptionist ? receptionist.name : 'Məlum deyil';
  };

  const getPaymentMethodColor = (method) => {
    switch(method) {
      case 'cash': return '#10b981';
      case 'card': return '#3b82f6';
      case 'terminal': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getPaymentMethodName = (method) => {
    switch(method) {
      case 'cash': return 'Nağd';
      case 'card': return 'Kart';
      case 'terminal': return 'Terminal';
      default: return method;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchMasseurs();
    fetchReceptionists();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchAppointments();
    }
  }, [selectedBranch, selectedDate]);

  const getBranchMasseurs = () => {
    return masseurs.filter(masseur => 
      masseur.branch && masseur.branch._id === selectedBranch
    );
  };

  const getMasseurAppointments = (masseurId) => {
    return appointments.filter(appointment => 
      appointment.masseur && appointment.masseur._id === masseurId
    );
  };

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

  const isAppointmentStart = (masseurId, time) => {
    const masseurAppointments = getMasseurAppointments(masseurId);
    
    return masseurAppointments.find(appointment => {
      const appointmentStart = new Date(appointment.startTime);
      
      const slotTime = new Date(selectedDate);
      const [hours, minutes] = time.split(':').map(Number);
      slotTime.setHours(hours, minutes, 0, 0);
      
      return appointmentStart.getHours() === slotTime.getHours() && 
             appointmentStart.getMinutes() === slotTime.getMinutes();
    });
  };

  const deleteAppointment = async (appointmentId) => {
    if (!confirm('Bu randevunu silmək istədiyinizdən əminsiniz?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/appointments/${appointmentId}/${getToken()}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });

      if (response.ok) {
        await fetchAppointments();
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

  const changeDate = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

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
      
      <div style={styles.header}>
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

        <div style={styles.dateNavigation}>
          <button onClick={() => changeDate(-1)} style={styles.dateBtn}>
            <ChevronLeft size={20} />
            <span style={styles.dateBtnText}>Əvvəlki</span>
          </button>
          
          <div style={styles.dateTitle}>
            <Calendar size={20} />
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
            <span style={styles.dateBtnText}>Növbəti</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div style={styles.masseursInfo}>
        <Users size={18} />
        <span>Masajistlər: {branchMasseurs.length}</span>
      </div>

      <div style={styles.scheduleContainer}>
        <div 
          style={{
            ...styles.scheduleGrid,
            gridTemplateColumns: `100px repeat(${branchMasseurs.length}, 1fr)`
          }}
        >
          <div style={styles.timeColumn}>Saat</div>
          
          {branchMasseurs.map((masseur) => (
            <div key={masseur._id} style={styles.masseurHeader}>
              <div style={styles.masseurInfo}>
                <User size={16} />
                <div>
                  <div style={styles.masseurName}>{masseur.name}</div>
                  <div style={styles.masseurRole}>Masajist</div>
                </div>
              </div>
            </div>
          ))}

          {hours.map((timeSlot) => (
            <div key={timeSlot} style={styles.scheduleRow}>
              <div style={styles.timeCell}>
                <span style={styles.timeLabel}>{timeSlot}</span>
              </div>

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
                      <div style={styles.appointmentCard}>
                        <div style={styles.appointmentHeader}>
                          <div style={styles.appointmentTimeContainer}>
                            <span style={styles.appointmentTime}>
                              {new Date(appointment.startTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })} - 
                              {new Date(appointment.endTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span 
                              style={{
                                ...styles.statusBadge,
                                backgroundColor: getStatusColor(appointment.status)
                              }}
                            >
                              {appointment.status}
                            </span>
                          </div>
                          <button 
                            style={styles.deleteBtn} 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAppointment(appointment._id);
                            }}
                            title="Sil"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        
                        <div style={styles.appointmentInfo}>
                          <div style={styles.customerRow}>
                            <User size={12} />
                            <span style={styles.customerName}>
                              {appointment.customer?.name || 'Ad yoxdur'}
                            </span>
                          </div>
                          
                          <div style={styles.massageRow}>
                            <span style={styles.massageType}>
                              {appointment.massageType?.name || 'Masaj növü yoxdur'}
                            </span>
                            <span style={styles.duration}>
                              ({appointment.duration} dəq)
                            </span>
                          </div>
                          
                          <div style={styles.priceRow}>
                            <span style={styles.appointmentPrice}>
                              {appointment.price} ₼
                            </span>
                            <span 
                              style={{
                                ...styles.paymentMethod,
                                color: getPaymentMethodColor(appointment.paymentMethod)
                              }}
                            >
                              {getPaymentMethodName(appointment.paymentMethod)}
                            </span>
                          </div>
                          
                          <div style={styles.receptionistRow}>
                            <span style={styles.receptionistLabel}>Qeydiyyatçı:</span>
                            <span style={styles.receptionistName}>
                              {getReceptionistName(appointment.createdBy)}
                            </span>
                          </div>
                          
                          {appointment.notes && (
                            <div style={styles.notesRow}>
                              <span style={styles.notes}>
                                "{appointment.notes}"
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={styles.emptySlot}>
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>Boş</span>
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
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%'
  },

  branchSelectionHeader: {
    marginBottom: '24px'
  },

  branchSelectionTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '16px 0 8px 0'
  },

  branchSelectionSubtitle: {
    fontSize: '14px',
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
    gap: '12px',
    padding: '14px 18px',
    background: '#f8fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    color: '#374151',
    transition: 'all 0.3s ease',
    width: '100%',
    textAlign: 'left'
  },

  container: {
    padding: '16px',
    background: '#f8fafc',
    minHeight: '100vh',
    position: 'relative'
  },

  header: {
    marginBottom: '16px'
  },

  branchHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'white',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px'
  },

  branchInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
    minWidth: '200px'
  },

  branchName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
    wordBreak: 'break-word'
  },

  changeBranchBtn: {
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },

  dateNavigation: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'white',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    flexWrap: 'wrap',
    gap: '12px'
  },

  dateBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 14px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap'
  },

  dateBtnText: {
    display: 'inline'
  },

  dateTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#1e293b',
    flex: 1,
    justifyContent: 'center',
    minWidth: '200px'
  },

  dateText: {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
    textAlign: 'center',
    wordBreak: 'break-word'
  },

  masseursInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#e0f2fe',
    color: '#0284c7',
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '13px',
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
    minWidth: '800px'
  },

  timeColumn: {
    background: '#f8fafc',
    padding: '10px',
    fontWeight: '600',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#374151',
    fontSize: '12px',
    position: 'sticky',
    left: 0,
    zIndex: 2
  },

  masseurHeader: {
    background: '#f8fafc',
    padding: '10px',
    borderRight: '1px solid #e5e7eb',
    borderBottom: '2px solid #e5e7eb'
  },

  masseurInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },

  masseurName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    wordBreak: 'break-word'
  },

  masseurRole: {
    fontSize: '10px',
    color: '#6b7280'
  },

  scheduleRow: {
    display: 'contents'
  },

  timeCell: {
    background: '#f8fafc',
    padding: '6px',
    borderRight: '1px solid #e5e7eb',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50px',
    position: 'sticky',
    left: 0,
    zIndex: 1
  },

  timeLabel: {
    fontSize: '11px',
    color: '#374151',
    fontWeight: '500'
  },

  timeSlot: {
    borderRight: '1px solid #e5e7eb',
    borderBottom: '1px solid #f3f4f6',
    minHeight: '50px',
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
    padding: '6px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
    borderRadius: '4px',
    border: '1px solid #0284c7',
    boxShadow: '0 1px 2px rgba(2, 132, 199, 0.1)'
  },

  appointmentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '4px',
    gap: '4px'
  },

  appointmentTimeContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1
  },

  appointmentTime: {
    fontSize: '9px',
    fontWeight: '700',
    color: '#0284c7',
    lineHeight: 1.2
  },

  statusBadge: {
    fontSize: '7px',
    fontWeight: '600',
    color: 'white',
    padding: '2px 4px',
    borderRadius: '3px',
    textTransform: 'capitalize',
    alignSelf: 'flex-start'
  },

  deleteBtn: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    padding: '3px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    flexShrink: 0
  },

  appointmentInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },

  customerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },

  customerName: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#1e293b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  massageRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexWrap: 'wrap'
  },

  massageType: {
    fontSize: '9px',
    color: '#475569',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1
  },

  duration: {
    fontSize: '8px',
    color: '#64748b',
    fontWeight: '500',
    whiteSpace: 'nowrap'
  },

  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  appointmentPrice: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#059669'
  },

  paymentMethod: {
    fontSize: '8px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },

  receptionistRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '2px',
    paddingTop: '3px',
    borderTop: '1px solid rgba(2, 132, 199, 0.2)'
  },

  receptionistLabel: {
    fontSize: '7px',
    color: '#64748b',
    fontWeight: '500'
  },

  receptionistName: {
    fontSize: '7px',
    color: '#374151',
    fontWeight: '600'
  },

  notesRow: {
    marginTop: '2px',
    paddingTop: '3px',
    borderTop: '1px solid rgba(2, 132, 199, 0.2)'
  },

  notes: {
    fontSize: '7px',
    color: '#6b7280',
    fontStyle: 'italic',
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  }
};