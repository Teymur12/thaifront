import { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  ChevronLeft,
  ChevronRight,
  Trash2,
  Calendar,
  Users,
  User,
  Ban,
  X
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
  const [blockedDates, setBlockedDates] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const calendarRef = useRef(null);

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

  const fetchBlockedDates = async (masseurId) => {
    try {
      const response = await fetch(
        `${API_BASE}/admin/masseurs/${masseurId}/blocked-dates/${getToken()}`,
        {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data.blockedDates || [];
      }
    } catch (error) {
      console.error('Bloklu tarixlər yüklənə bilmədi:', error);
    }
    return [];
  };

  const fetchAllBlockedDates = async () => {
    const branchMasseurs = getBranchMasseurs();
    const blocked = {};
    
    for (const masseur of branchMasseurs) {
      const dates = await fetchBlockedDates(masseur._id);
      blocked[masseur._id] = dates;
    }
    
    setBlockedDates(blocked);
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

  const isMasseurBlocked = (masseurId) => {
    const blocked = blockedDates[masseurId] || [];
    const checkDate = new Date(selectedDate);
    checkDate.setHours(0, 0, 0, 0);
    
    return blocked.some(block => {
      const blockDate = new Date(block.date);
      blockDate.setHours(0, 0, 0, 0);
      return blockDate.getTime() === checkDate.getTime();
    });
  };

  const getBlockInfo = (masseurId) => {
    const blocked = blockedDates[masseurId] || [];
    const checkDate = new Date(selectedDate);
    checkDate.setHours(0, 0, 0, 0);
    
    return blocked.find(block => {
      const blockDate = new Date(block.date);
      blockDate.setHours(0, 0, 0, 0);
      return blockDate.getTime() === checkDate.getTime();
    });
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
      case 'scheduled': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusName = (status) => {
    switch(status) {
      case 'completed': return 'Tamamlandı';
      case 'scheduled': return 'Planlandı';
      case 'pending': return 'Gözləyir';
      case 'cancelled': return 'Ləğv edildi';
      default: return status;
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const selectDate = (day) => {
    const newDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    setSelectedDate(newDate);
    setShowCalendar(false);
  };

  const changeCalendarMonth = (direction) => {
    const newMonth = new Date(calendarMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCalendarMonth(newMonth);
  };

  useEffect(() => {
    fetchBranches();
    fetchMasseurs();
    fetchReceptionists();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchAppointments();
      fetchAllBlockedDates();
    }
  }, [selectedBranch, selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

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
            <button 
              onClick={() => {
                setCalendarMonth(new Date(selectedDate));
                setShowCalendar(!showCalendar);
              }} 
              style={styles.calendarButton}
            >
              <Calendar size={20} />
              <h2 style={styles.dateText}>
                {selectedDate.toLocaleDateString('az-AZ', { 
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'long'
                })}
              </h2>
            </button>
            
            {showCalendar && (
              <div ref={calendarRef} style={styles.calendarDropdown}>
                <div style={styles.calendarHeader}>
                  <button 
                    onClick={() => changeCalendarMonth(-1)} 
                    style={styles.calendarNavBtn}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span style={styles.calendarMonthYear}>
                    {calendarMonth.toLocaleDateString('az-AZ', { 
                      year: 'numeric',
                      month: 'long'
                    })}
                  </span>
                  <button 
                    onClick={() => changeCalendarMonth(1)} 
                    style={styles.calendarNavBtn}
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button 
                    onClick={() => setShowCalendar(false)} 
                    style={styles.calendarCloseBtn}
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div style={styles.calendarWeekdays}>
                  {['B.', 'B.e.', 'Ç.a.', 'Ç.', 'C.a.', 'C.', 'Ş.'].map(day => (
                    <div key={day} style={styles.weekdayLabel}>{day}</div>
                  ))}
                </div>
                
                <div style={styles.calendarDays}>
                  {(() => {
                    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(calendarMonth);
                    const days = [];
                    
                    for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
                      days.push(<div key={`empty-${i}`} style={styles.emptyDay} />);
                    }
                    
                    for (let day = 1; day <= daysInMonth; day++) {
                      const isSelected = selectedDate.getDate() === day && 
                                        selectedDate.getMonth() === month && 
                                        selectedDate.getFullYear() === year;
                      const isToday = new Date().getDate() === day && 
                                     new Date().getMonth() === month && 
                                     new Date().getFullYear() === year;
                      
                      days.push(
                        <button
                          key={day}
                          onClick={() => selectDate(day)}
                          style={{
                            ...styles.calendarDay,
                            ...(isSelected ? styles.selectedDay : {}),
                            ...(isToday && !isSelected ? styles.todayDay : {})
                          }}
                        >
                          {day}
                        </button>
                      );
                    }
                    
                    return days;
                  })()}
                </div>
              </div>
            )}
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
          
          {branchMasseurs.map((masseur) => {
            const isBlocked = isMasseurBlocked(masseur._id);
            const blockInfo = getBlockInfo(masseur._id);
            
            return (
              <div 
                key={masseur._id} 
                style={{
                  ...styles.masseurHeader,
                  background: isBlocked ? '#f3f4f6' : '#f8fafc'
                }}
              >
                <div style={styles.masseurInfo}>
                  <User size={16} />
                  <div>
                    <div style={styles.masseurName}>{masseur.name}</div>
                    <div style={styles.masseurRole}>Masajist</div>
                    {isBlocked && (
                      <div style={styles.blockedBadge}>
                        <Ban size={10} />
                        <span>Bloklanıb</span>
                      </div>
                    )}
                  </div>
                </div>
                {isBlocked && blockInfo && (
                  <div style={styles.blockReason}>
                    {blockInfo.reason}
                  </div>
                )}
              </div>
            );
          })}

          {hours.map((timeSlot) => (
            <div key={timeSlot} style={styles.scheduleRow}>
              <div style={styles.timeCell}>
                <span style={styles.timeLabel}>{timeSlot}</span>
              </div>

              {branchMasseurs.map((masseur) => {
                const isBlocked = isMasseurBlocked(masseur._id);
                const appointment = isTimeSlotOccupied(masseur._id, timeSlot);
                const isStartSlot = isAppointmentStart(masseur._id, timeSlot);
                
                if (isBlocked) {
                  return (
                    <div 
                      key={`${masseur._id}-${timeSlot}`}
                      style={styles.blockedSlot}
                    >
                      <Ban size={14} color="#9ca3af" />
                    </div>
                  );
                }
                
                return (
                  <div 
                    key={`${masseur._id}-${timeSlot}`}
                    style={{
                      ...styles.timeSlot,
                      backgroundColor: appointment ? '#e0f2fe' : '#ffffff',
                      borderColor: appointment ? '#0284c7' : '#e5e7eb'
                    }}
                  >
                    {appointment && isStartSlot ? (
                      <div style={styles.appointmentCard}>
                        <div style={styles.appointmentHeader}>
                          <div style={styles.appointmentMainInfo}>
                            <div style={styles.statusRow}>
                              <span 
                                style={{
                                  ...styles.statusBadge,
                                  backgroundColor: getStatusColor(appointment.status)
                                }}
                              >
                                {getStatusName(appointment.status)}
                              </span>
                            </div>
                            <div style={styles.customerName}>
                              {appointment.customer?.name || 'Ad yoxdur'}
                            </div>
                            <div style={styles.massageType}>
                              {appointment.massageType?.name || 'Masaj növü yoxdur'} 
                              <span style={styles.duration}>({appointment.duration}dəq)</span>
                            </div>
                            <div style={styles.appointmentTime}>
                              {new Date(appointment.startTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })} - 
                              {new Date(appointment.endTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style={styles.pricePaymentRow}>
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
                              <span style={styles.receptionistName}>
                                {getReceptionistName(appointment.createdBy)}
                              </span>
                            </div>
                          </div>
                          <button 
                            style={styles.deleteBtn} 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAppointment(appointment._id);
                            }}
                            title="Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ) : appointment ? (
                      <div style={styles.continuationSlot} />
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
    minWidth: '200px',
    position: 'relative'
  },
  calendarButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    transition: 'background 0.2s ease'
  },
  dateText: {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
    textAlign: 'center',
    wordBreak: 'break-word'
  },
  calendarDropdown: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: '8px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    padding: '16px',
    zIndex: 1000,
    minWidth: '320px'
  },
  calendarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    gap: '8px'
  },
  calendarNavBtn: {
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '6px',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#475569',
    transition: 'all 0.2s ease'
  },
  calendarCloseBtn: {
    background: '#fee2e2',
    border: 'none',
    borderRadius: '6px',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyjustifyContent: 'center',
    color: '#ef4444',
    marginLeft: 'auto'
  },
  calendarMonthYear: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    textAlign: 'center'
  },
  calendarWeekdays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
    marginBottom: '8px'
  },
  weekdayLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
    padding: '4px'
  },
  calendarDays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px'
  },
  emptyDay: {
    padding: '8px'
  },
  calendarDay: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center'
  },
  selectedDay: {
    background: '#667eea',
    color: 'white',
    border: '1px solid #667eea',
    fontWeight: '700'
  },
  todayDay: {
    background: '#e0f2fe',
    color: '#0284c7',
    border: '1px solid #0284c7',
    fontWeight: '600'
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
    alignItems: 'flex-start',
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
  blockedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '9px',
    color: '#ef4444',
    fontWeight: '600',
    marginTop: '4px',
    background: '#fee2e2',
    padding: '2px 6px',
    borderRadius: '4px',
    width: 'fit-content'
  },
  blockReason: {
    fontSize: '9px',
    color: '#6b7280',
    marginTop: '4px',
    fontStyle: 'italic'
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
  blockedSlot: {
    background: 'repeating-linear-gradient(45deg, #f3f4f6, #f3f4f6 10px, #e5e7eb 10px, #e5e7eb 20px)',
    borderRight: '1px solid #d1d5db',
    borderBottom: '1px solid #d1d5db',
    minHeight: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6
  },
  emptySlot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    opacity: 0.7
  },
  continuationSlot: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
    border: '1px solid #0284c7',
    opacity: 0.3
  },
  appointmentCard: {
    width: '100%',
    height: '100%',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
    borderRadius: '4px',
    border: '2px solid #0284c7',
    boxShadow: '0 2px 4px rgba(2, 132, 199, 0.15)'
  },
  appointmentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px'
  },
  appointmentMainInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1
  },
  statusRow: {
    marginBottom: '2px'
  },
  statusBadge: {
    fontSize: '8px',
    fontWeight: '600',
    color: 'white',
    padding: '3px 6px',
    borderRadius: '4px',
    textTransform: 'capitalize',
    display: 'inline-block'
  },
  customerName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1e293b'
  },
  massageType: {
    fontSize: '11px',
    color: '#475569',
    fontWeight: '500'
  },
  duration: {
    fontSize: '10px',
    color: '#64748b',
    marginLeft: '4px'
  },
  appointmentTime: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#0284c7'
  },
  pricePaymentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px',
    paddingTop: '4px',
    borderTop: '1px solid rgba(2, 132, 199, 0.2)'
  },
  appointmentPrice: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#059669'
  },
  paymentMethod: {
    fontSize: '9px',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  receptionistRow: {
    marginTop: '4px',
    paddingTop: '4px',
    borderTop: '1px solid rgba(2, 132, 199, 0.2)'
  },
  receptionistName: {
    fontSize: '9px',
    color: '#475569',
    fontWeight: '500',
    fontStyle: 'italic'
  },
  deleteBtn: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    flexShrink: 0
  }
};