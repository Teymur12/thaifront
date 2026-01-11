import { useState, useEffect, useRef } from 'react';
import { Building2, ChevronLeft, ChevronRight, Trash2, Calendar, Users, User, Ban, X, Plus, Search, Eye, Receipt } from 'lucide-react';
import Cookies from 'js-cookie';

const getToken = () => Cookies.get('authToken');
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [massageTypes, setMassageTypes] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [newAppointment, setNewAppointment] = useState({
    customer: '', masseur: '', massageType: '', duration: '', price: 0,
    advancePayment: { amount: 0, paymentMethod: 'cash' }
  });

  // ✅ YENİ - Randevu və qəbzi modalları
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  const SLOT_HEIGHT = 240;

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 10; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const hours = generateTimeSlots();

  const isCurrentTimeSlot = (timeSlot) => {
    const now = new Date();
    const [slotHour] = timeSlot.split(':').map(Number);
    const slotTime = new Date(now);
    slotTime.setHours(slotHour, 0, 0, 0);
    const nextSlotTime = new Date(slotTime);
    nextSlotTime.setHours(nextSlotTime.getHours() + 1);
    return now >= slotTime && now < nextSlotTime;
  };

  const isToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    return today.getTime() === selected.getTime();
  };

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

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/customers/${getToken()}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Müştərilər yüklənə bilmədi:', error);
    }
  };

  const fetchMassageTypes = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/massage-types/${getToken()}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMassageTypes(data);
      }
    } catch (error) {
      console.error('Masaj növləri yüklənə bilmədi:', error);
    }
  };

  const fetchBlockedDates = async (masseurId) => {
    try {
      const response = await fetch(
        `${API_BASE}/admin/masseurs/${masseurId}/blocked-dates/${getToken()}`,
        { headers: { 'Authorization': `Bearer ${getToken()}` } }
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
        { headers: { 'Authorization': `Bearer ${getToken()}` } }
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

  // ✅ Randevu təfərrüatlarını aç
  const openAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  // ✅ Qəbzi yüklə və göstər
  const viewReceipt = async (appointmentId) => {
    setLoadingReceipt(true);
    try {
      const response = await fetch(
        `${API_BASE}/admin/receipts/${appointmentId}/view/${getToken()}`,
        { headers: { 'Authorization': `Bearer ${getToken()}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.advancePayment?.receiptImage?.url) {
          setReceiptUrl(data.advancePayment.receiptImage.url);
          setShowReceiptModal(true);
        } else {
          alert('Qəbzi tapılmadı');
        }
      } else {
        alert('Qəbzi yükləyərkən xəta baş verdi');
      }
    } catch (error) {
      console.error('Receipt view error:', error);
      alert('Qəbzi açılarkən xəta baş verdi');
    } finally {
      setLoadingReceipt(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchMasseurs();
    fetchReceptionists();
    fetchCustomers();
    fetchMassageTypes();
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
      const [slotHour] = time.split(':').map(Number);
      const slotTime = new Date(appointmentStart);
      slotTime.setHours(slotHour, 0, 0, 0);
      const slotEndTime = new Date(slotTime);
      slotEndTime.setHours(slotEndTime.getHours() + 1);
      return (appointmentStart < slotEndTime && appointmentEnd > slotTime);
    });
  };

  const isAppointmentStart = (masseurId, time) => {
    const masseurAppointments = getMasseurAppointments(masseurId);
    return masseurAppointments.find(appointment => {
      const appointmentStart = new Date(appointment.startTime);
      const [slotHour] = time.split(':').map(Number);
      const startHour = appointmentStart.getHours();
      const startMinute = appointmentStart.getMinutes();
      return startHour === slotHour && startMinute >= 0;
    });
  };

  const getAppointmentHeight = (appointment) => {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);
    const durationMs = end - start;
    const durationHours = durationMs / (1000 * 60 * 60);
    return durationHours * SLOT_HEIGHT;
  };

  const getAppointmentTopOffset = (appointment, timeSlot) => {
    const appointmentStart = new Date(appointment.startTime);
    const [slotHour] = timeSlot.split(':').map(Number);
    const slotTime = new Date(appointmentStart);
    slotTime.setHours(slotHour, 0, 0, 0);
    
    if (appointmentStart < slotTime) return 0;
    
    const offsetMs = appointmentStart - slotTime;
    const offsetMinutes = offsetMs / (1000 * 60);
    return (offsetMinutes / 60) * SLOT_HEIGHT;
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

  const openAddAppointmentModal = (masseurId, timeSlot) => {
    const isBlocked = isMasseurBlocked(masseurId);
    if (isBlocked) {
      alert('Bu masajist bu tarixdə bloklanıb!');
      return;
    }
    const appointment = isTimeSlotOccupied(masseurId, timeSlot);
    if (appointment) {
      alert('Bu vaxt aralığında randevu var!');
      return;
    }
    setSelectedSlot({ masseurId, timeSlot });
    setNewAppointment({
      customer: '', masseur: masseurId, massageType: '', duration: '', price: 0,
      advancePayment: { amount: 0, paymentMethod: 'cash' }
    });
    setCustomerSearch('');
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setSelectedSlot(null);
    setNewAppointment({
      customer: '', masseur: '', massageType: '', duration: '', price: 0,
      advancePayment: { amount: 0, paymentMethod: 'cash' }
    });
    setCustomerSearch('');
  };

  const handleMassageTypeChange = (massageTypeId) => {
    setNewAppointment({
      ...newAppointment,
      massageType: massageTypeId,
      duration: '',
      price: 0
    });
  };

  const createAppointment = async () => {
    if (!newAppointment.customer || !newAppointment.massageType || !newAppointment.duration) {
      alert('Zəhmət olmasa bütün məcburi sahələri doldurun!');
      return;
    }
    setLoading(true);
    try {
      const [hours, minutes] = selectedSlot.timeSlot.split(':').map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + parseInt(newAppointment.duration));
      const appointmentData = {
        customer: newAppointment.customer,
        masseur: newAppointment.masseur,
        massageType: newAppointment.massageType,
        branch: selectedBranch,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: parseInt(newAppointment.duration),
        price: newAppointment.price,
        status: 'scheduled',
        paymentMethod: 'cash',
        createdBy: "68ca9d919e196ab4cd5e3b61"
      };
      if (newAppointment.advancePayment.amount > 0) {
        appointmentData.advancePayment = {
          amount: parseFloat(newAppointment.advancePayment.amount),
          paymentMethod: newAppointment.advancePayment.paymentMethod
        };
      }
      const response = await fetch(`${API_BASE}/admin/appointments/${getToken()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(appointmentData)
      });
      if (response.ok) {
        await fetchAppointments();
        closeAddModal();
        alert('Randevu uğurla yaradıldı!');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Randevu yaradıla bilmədi');
      }
    } catch (error) {
      console.error('Randevu yaradılarkən xəta:', error);
      alert(error.message || 'Randevu yaradılarkən xəta baş verdi!');
    }
    setLoading(false);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch)
  );

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
            <h1 style={styles.branchName}>{selectedBranchData?.name}</h1>
          </div>
          <button onClick={() => setSelectedBranch('')} style={styles.changeBranchBtn}>
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
                  <button onClick={() => changeCalendarMonth(-1)} style={styles.calendarNavBtn}>
                    <ChevronLeft size={18} />
                  </button>
                  <span style={styles.calendarMonthYear}>
                    {calendarMonth.toLocaleDateString('az-AZ', { 
                      year: 'numeric',
                      month: 'long'
                    })}
                  </span>
                  <button onClick={() => changeCalendarMonth(1)} style={styles.calendarNavBtn}>
                    <ChevronRight size={18} />
                  </button>
                  <button onClick={() => setShowCalendar(false)} style={styles.calendarCloseBtn}>
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
                      const isTodayDay = new Date().getDate() === day && 
                                     new Date().getMonth() === month && 
                                     new Date().getFullYear() === year;
                      days.push(
                        <button
                          key={day}
                          onClick={() => selectDate(day)}
                          style={{
                            ...styles.calendarDay,
                            ...(isSelected ? styles.selectedDay : {}),
                            ...(isTodayDay && !isSelected ? styles.todayDay : {})
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
            gridTemplateColumns: `120px repeat(${branchMasseurs.length}, minmax(200px, 1fr))`
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
                  <div style={styles.blockReason}>{blockInfo.reason}</div>
                )}
              </div>
            );
          })}

          {hours.map((timeSlot) => (
            <div key={timeSlot} style={styles.scheduleRow}>
              <div style={{
                ...styles.timeCell,
                ...(isToday() && isCurrentTimeSlot(timeSlot) ? styles.currentTimeCell : {})
              }}>
                <span style={styles.timeLabel}>{timeSlot}</span>
              </div>

              {branchMasseurs.map((masseur) => {
                const isBlocked = isMasseurBlocked(masseur._id);
                const occupiedAppointment = isTimeSlotOccupied(masseur._id, timeSlot);
                const startAppointment = isAppointmentStart(masseur._id, timeSlot);
                
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
                
                if (startAppointment) {
                  const hasReceipt = startAppointment.advancePayment?.receiptImage?.url;
                  
                  return (
                    <div 
                      key={`${masseur._id}-${timeSlot}`}
                      style={{
                        ...styles.timeSlot,
                        backgroundColor: 'transparent',
                        borderColor: '#e5e7eb',
                        cursor: 'pointer',
                        ...(isToday() && isCurrentTimeSlot(timeSlot) ? styles.currentTimeSlot : {}),
                        position: 'relative'
                      }}
                      onClick={() => openAppointmentDetails(startAppointment)}
                    >
                      <div 
                        style={{
                          ...styles.appointmentCard,
                          position: 'absolute',
                          top: `${getAppointmentTopOffset(startAppointment, timeSlot)}px`,
                          height: `${getAppointmentHeight(startAppointment)}px`,
                          left: '2px',
                          right: '2px',
                          minHeight: '55px'
                        }}
                      >
                        <div style={styles.appointmentContent}>
                          <div style={styles.appointmentTopRow}>
                            <span 
                              style={{
                                ...styles.statusBadge,
                                backgroundColor: getStatusColor(startAppointment.status)
                              }}
                            >
                              {getStatusName(startAppointment.status)}
                            </span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {hasReceipt && (
                                <button 
                                  style={styles.receiptBtn}onClick={(e) => {
                                    e.stopPropagation();
                                    viewReceipt(startAppointment._id);
                                  }}
                                  title="Qəbzə bax"
                                >
                                  <Receipt size={12} />
                                </button>
                              )}
                              <button 
                                style={styles.deleteBtn} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteAppointment(startAppointment._id);
                                }}
                                title="Sil"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                          
                          <div style={styles.customerName}>
                            {startAppointment.customer?.name || startAppointment.customer || 'Ad yoxdur'}
                          </div>
                          
                          {startAppointment.massageType && (
                            <div style={styles.massageType}>
                              {startAppointment.massageType?.name || startAppointment.massageType}
                            </div>
                          )}
                          
                          <div style={styles.appointmentTime}>
                            {new Date(startAppointment.startTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(startAppointment.endTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                            <span style={styles.durationBadge}>({startAppointment.duration}dəq)</span>
                          </div>
                          
                          <div style={styles.pricePaymentRow}>
                            <span style={styles.appointmentPrice}>
                              {startAppointment.price || 0} ₼
                            </span>
                            {startAppointment.paymentMethod && (
                              <span 
                                style={{
                                  ...styles.paymentMethod,
                                  color: getPaymentMethodColor(startAppointment.paymentMethod)
                                }}
                              >
                                {getPaymentMethodName(startAppointment.paymentMethod)}
                              </span>
                            )}
                          </div>
                          
                          <div style={styles.receptionistInfo}>
                            {getReceptionistName(startAppointment.createdBy)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                if (occupiedAppointment) {
                  return (
                    <div 
                      key={`${masseur._id}-${timeSlot}`}
                      style={{
                        ...styles.timeSlot,
                        backgroundColor: 'transparent',
                        borderColor: '#e5e7eb',
                        cursor: 'default',
                        ...(isToday() && isCurrentTimeSlot(timeSlot) ? styles.currentTimeSlot : {}),
                        position: 'relative'
                      }}
                    />
                  );
                }
                
                return (
                  <div 
                    key={`${masseur._id}-${timeSlot}`}
                    style={{
                      ...styles.timeSlot,
                      backgroundColor: '#ffffff',
                      borderColor: '#e5e7eb',
                      cursor: 'pointer',
                      ...(isToday() && isCurrentTimeSlot(timeSlot) ? styles.currentTimeSlot : {}),
                      position: 'relative'
                    }}
                    onClick={() => openAddAppointmentModal(masseur._id, timeSlot)}
                  >
                    <div style={styles.emptySlot}>
                      <Plus size={16} color="#9ca3af" />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Randevu Təfərrüatları Modalı */}
      {showAppointmentModal && selectedAppointment && (
        <div style={styles.modalOverlay} onClick={() => setShowAppointmentModal(false)}>
          <div style={styles.detailsModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Randevu Təfərrüatları</h3>
              <button onClick={() => setShowAppointmentModal(false)} style={styles.modalCloseBtn}>
                <X size={20} />
              </button>
            </div>
            
            <div style={styles.detailsModalBody}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Status:</span>
                <span 
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(selectedAppointment.status)
                  }}
                >
                  {getStatusName(selectedAppointment.status)}
                </span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Müştəri:</span>
                <span style={styles.detailValue}>
                  {selectedAppointment.customer?.name || 'Ad yoxdur'}
                </span>
              </div>

              {selectedAppointment.customer?.phone && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Telefon:</span>
                  <span style={styles.detailValue}>{selectedAppointment.customer.phone}</span>
                </div>
              )}

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Masajist:</span>
                <span style={styles.detailValue}>
                  {selectedAppointment.masseur?.name || 'Məlum deyil'}
                </span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Masaj növü:</span>
                <span style={styles.detailValue}>
                  {selectedAppointment.massageType?.name || 'Məlum deyil'}
                </span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Vaxt:</span>
                <span style={styles.detailValue}>
                  {new Date(selectedAppointment.startTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })} - 
                  {new Date(selectedAppointment.endTime).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Müddət:</span>
                <span style={styles.detailValue}>{selectedAppointment.duration} dəqiqə</span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Qiymət:</span>
                <span style={{...styles.detailValue, color: '#059669', fontWeight: '700'}}>
                  {selectedAppointment.price} ₼
                </span>
              </div>

              {selectedAppointment.advancePayment?.amount > 0 && (
                <>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>BEH (Avans):</span>
                    <span style={{...styles.detailValue, color: '#3b82f6', fontWeight: '600'}}>
                      {selectedAppointment.advancePayment.amount} ₼
                      <span style={{fontSize: '11px', color: '#64748b', marginLeft: '6px'}}>
                        ({getPaymentMethodName(selectedAppointment.advancePayment.paymentMethod)})
                      </span>
                    </span>
                  </div>

                  {selectedAppointment.advancePayment.receiptImage?.url && (
                    <div style={styles.receiptSection}>
                      <div style={styles.receiptLabel}>
                        <Receipt size={16} />
                        <span>BEH Qəbzi:</span>
                      </div>
                      <button
                        onClick={() => viewReceipt(selectedAppointment._id)}
                        style={styles.viewReceiptBtn}
                        disabled={loadingReceipt}
                      >
                        <Eye size={16} />
                        {loadingReceipt ? 'Yüklənir...' : 'Qəbzə bax'}
                      </button>
                    </div>
                  )}
                </>
              )}

              {selectedAppointment.paymentMethod && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Ödəniş üsulu:</span>
                  <span 
                    style={{
                      ...styles.detailValue,
                      color: getPaymentMethodColor(selectedAppointment.paymentMethod),
                      fontWeight: '600'
                    }}
                  >
                    {getPaymentMethodName(selectedAppointment.paymentMethod)}
                  </span>
                </div>
              )}

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Yaradan:</span>
                <span style={styles.detailValue}>
                  {getReceptionistName(selectedAppointment.createdBy)}
                </span>
              </div>

              {selectedAppointment.notes && (
                <div style={{...styles.detailRow, flexDirection: 'column', alignItems: 'flex-start', gap: '6px'}}>
                  <span style={styles.detailLabel}>Qeydlər:</span>
                  <span style={{...styles.detailValue, fontSize: '13px', lineHeight: '1.5'}}>
                    {selectedAppointment.notes}
                  </span>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button 
                onClick={() => {
                  setShowAppointmentModal(false);
                  deleteAppointment(selectedAppointment._id);
                }} 
                style={styles.deleteAppointmentBtn}
              >
                <Trash2 size={16} />
                Randevunu Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Qəbzi Göstərmə Modalı */}
      {showReceiptModal && receiptUrl && (
        <div 
          style={styles.receiptModalOverlay} 
          onClick={() => {
            setShowReceiptModal(false);
            setReceiptUrl(null);
          }}
        >
          <div style={styles.receiptModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.receiptModalHeader}>
              <h3 style={styles.receiptModalTitle}>BEH Qəbzi</h3>
              <button 
                onClick={() => {
                  setShowReceiptModal(false);
                  setReceiptUrl(null);
                }} 
                style={styles.modalCloseBtn}
              >
                <X size={20} />
              </button>
            </div>
            <div style={styles.receiptImageContainer}>
              <img 
                src={receiptUrl} 
                alt="Receipt" 
                style={styles.receiptImage}
              />
            </div>
          </div>
        </div>
      )}

      {/* Yeni Randevu Modalı */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={closeAddModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Yeni Randevu</h3>
              <button onClick={closeAddModal} style={styles.modalCloseBtn}>
                <X size={20} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Masajist</label>
                <input
                  type="text"
                  value={masseurs.find(m => m._id === selectedSlot?.masseurId)?.name || ''}
                  disabled
                  style={{ ...styles.input, backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Vaxt</label>
                <input
                  type="text"
                  value={selectedSlot?.timeSlot || ''}
                  disabled
                  style={{ ...styles.input, backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Müştəri Axtar *</label>
                <div style={styles.searchContainer}>
                  <Search size={18} color="#9ca3af" style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Ad və ya telefon nömrəsi ilə axtar..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>
                {customerSearch && (
                  <div style={styles.customerList}>
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map(customer => (
                        <div
                          key={customer._id}
                          onClick={() => {
                            setNewAppointment({ ...newAppointment, customer: customer._id });
                            setCustomerSearch(customer.name);
                          }}
                          style={styles.customerItem}
                        >
                          <div style={styles.customerItemName}>{customer.name}</div>
                          <div style={styles.customerPhone}>{customer.phone}</div>
                        </div>
                      ))
                    ) : (
                      <div style={styles.noResults}>Müştəri tapılmadı</div>
                    )}
                  </div>
                )}
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Masaj Növü *</label>
                <select
                  value={newAppointment.massageType}
                  onChange={(e) => handleMassageTypeChange(e.target.value)}
                  style={styles.select}
                >
                  <option value="">Seçin</option>
                  {massageTypes.map(type => (
                    <option key={type._id} value={type._id}>{type.name}</option>
                  ))}
                </select>
              </div>
              {newAppointment.massageType && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Müddət *</label>
                  <select
                    value={newAppointment.duration}
                    onChange={(e) => {
                      const selectedType = massageTypes.find(mt => mt._id === newAppointment.massageType);
                      const selectedDuration = selectedType?.durations.find(d => d.minutes === parseInt(e.target.value));
                      if (selectedDuration) {
                        setNewAppointment({
                          ...newAppointment,
                          duration: selectedDuration.minutes,
                          price: selectedDuration.price
                        });
                      }
                    }}
                    style={styles.select}
                  >
                    <option value="">Seçin</option>
                    {massageTypes
                      .find(mt => mt._id === newAppointment.massageType)
                      ?.durations.map(duration => (
                        <option key={duration._id} value={duration.minutes}>
                          {duration.minutes} dəqiqə - {duration.price} ₼
                        </option>
                      ))}
                  </select>
                </div>
              )}
              {newAppointment.price > 0 && (
                <>
                  <div style={styles.priceDisplay}>
                    <span>Qiymət:</span>
                    <strong>{newAppointment.price} ₼</strong>
                  </div>
                  <div style={styles.advancePaymentSection}>
                    <h4 style={styles.sectionTitle}>Avans Ödənişi (İstəyə bağlı)</h4>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Avans məbləği</label>
                      <input
                        type="number"
                        min="0"
                        max={newAppointment.price}
                        value={newAppointment.advancePayment.amount}
                        onChange={(e) => setNewAppointment({
                          ...newAppointment,
                          advancePayment: {
                            ...newAppointment.advancePayment,
                            amount: parseFloat(e.target.value) || 0
                          }
                        })}
                        style={styles.input}
                        placeholder="0"
                      />
                    </div>
                    {newAppointment.advancePayment.amount > 0 && (
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Ödəniş üsulu</label>
                        <select
                          value={newAppointment.advancePayment.paymentMethod}
                          onChange={(e) => setNewAppointment({
                            ...newAppointment,
                            advancePayment: {
                              ...newAppointment.advancePayment,
                              paymentMethod: e.target.value
                            }
                          })}
                          style={styles.select}
                        >
                          <option value="cash">Nağd</option>
                          <option value="card">Kart</option>
                          <option value="terminal">Terminal</option>
                        </select>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button onClick={closeAddModal} style={styles.cancelBtn}>
                Ləğv et
              </button>
              <button onClick={createAppointment} style={styles.createBtn}>
                Randevu Yarat
              </button>
            </div>
          </div>
        </div>
      )}
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
    justifyContent: 'center',
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
    minWidth: '900px'
  },
  timeColumn: {
    background: '#f8fafc',
    padding: '12px',
    fontWeight: '600',
    borderRight: '2px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#374151',
    fontSize: '13px',
    position: 'sticky',
    left: 0,
    zIndex: 2
  },
  masseurHeader: {
    background: '#f8fafc',
    padding: '12px',
    borderRight: '1px solid #e5e7eb',
    borderBottom: '2px solid #e5e7eb',
    minHeight: '70px'
  },
  masseurInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px'
  },
  masseurName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    wordBreak: 'break-word',
    lineHeight: '1.3'
  },
  masseurRole: {
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '2px'
  },
  blockedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    color: '#ef4444',
    fontWeight: '600',
    marginTop: '4px',
    background: '#fee2e2',
    padding: '3px 6px',
    borderRadius: '4px',
    width: 'fit-content'
  },
  blockReason: {
    fontSize: '10px',
    color: '#6b7280',
    marginTop: '6px',
    fontStyle: 'italic'
  },
  scheduleRow: {
    display: 'contents'
  },
  timeCell: {
    background: '#f8fafc',
    padding: '8px',
    borderRight: '2px solid #e5e7eb',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '240px',
    position: 'sticky',
    left: 0,
    zIndex: 1
  },
  currentTimeCell: {
    background: '#fef2f2',
    borderTop: '2px solid #ef4444',
    borderBottom: '2px solid #ef4444'
  },
  timeLabel: {
    fontSize: '12px',
    color: '#374151',
    fontWeight: '600'
  },
  timeSlot: {
    borderRight: '1px solid #e5e7eb',
    borderBottom: '1px solid #f3f4f6',
    minHeight: '240px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'background 0.2s ease'
  },
  currentTimeSlot: {
    borderTop: '2px solid #ef4444',
    borderBottom: '2px solid #ef4444'
  },
  blockedSlot: {
    background: 'repeating-linear-gradient(45deg, #f9fafb, #f9fafb 10px, #f3f4f6 10px, #f3f4f620px)',
    borderRight: '1px solid #d1d5db',
    borderBottom: '1px solid #d1d5db',
    minHeight: '240px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7
  },
  emptySlot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    opacity: '0.5',
    transition: 'opacity 0.2s ease'
  },
  appointmentCard: {
    padding: '6px',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
    borderRadius: '8px',
    border: '2px solid #3b82f6',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
    overflow: 'hidden'
  },
  appointmentContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    height: '100%',
    fontSize: '12px'
  },
  appointmentTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '3px'
  },
  statusBadge: {
    fontSize: '9px',
    fontWeight: '700',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    display: 'inline-block',
    letterSpacing: '0.3px'
  },
  customerName: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: '1.2',
    wordBreak: 'break-word',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical'
  },
  massageType: {
    fontSize: '11px',
    color: '#475569',
    fontWeight: '500',
    lineHeight: '1.2',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  appointmentTime: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#0284c7',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    marginTop: '1px',
    flexWrap: 'wrap'
  },
  durationBadge: {
    fontSize: '9px',
    color: '#64748b',
    fontWeight: '600'
  },
  pricePaymentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '3px',
    paddingTop: '3px',
    borderTop: '1px solid rgba(59, 130, 246, 0.2)',
    gap: '6px'
  },
  appointmentPrice: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#059669',
    whiteSpace: 'nowrap'
  },
  paymentMethod: {
    fontSize: '9px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap'
  },
  receptionistInfo: {
    fontSize: '9px',
    color: '#64748b',
    fontWeight: '500',
    fontStyle: 'italic',
    marginTop: '3px',
    paddingTop: '3px',
    borderTop: '1px solid rgba(59, 130, 246, 0.15)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  receiptBtn: {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    flexShrink: 0
  },
  deleteBtn: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    flexShrink: 0
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px'
  },
  modalContent: {
    background: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
  },
  detailsModalContent: {
    background: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e5e7eb'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  modalCloseBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '6px',
    transition: 'all 0.2s ease'
  },
  modalBody: {
    padding: '20px',
    overflowY: 'auto',
    flex: 1
  },
  detailsModalBody: {
    padding: '20px',
    overflowY: 'auto',
    flex: 1
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6'
  },
  detailLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b'
  },
  detailValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e293b',
    textAlign: 'right'
  },
  receiptSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    background: '#eff6ff',
    borderRadius: '8px',
    marginTop: '12px',
    border: '1px solid #3b82f6'
  },
  receiptLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e40af'
  },
  viewReceiptBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e293b',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e293b',
    backgroundColor: 'white',
    cursor: 'pointer',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease'
  },
  searchContainer: {
    position: 'relative'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none'
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px 10px 40px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e293b',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease'
  },
  customerList: {
    marginTop: '8px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    maxHeight: '200px',
    overflowY: 'auto',
    background: 'white'
  },
  customerItem: {
    padding: '12px',
    cursor: 'pointer',
    borderBottom: '1px solid #f3f4f6',
    transition: 'background 0.2s ease'
  },
  customerItemName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e293b'
  },
  customerPhone: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px'
  },
  noResults: {
    padding: '12px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '13px'
  },
  priceDisplay: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: '#f0fdf4',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '15px',
    color: '#166534',
    fontWeight: '600'
  },
  advancePaymentSection: {
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '8px',
    marginTop: '16px'
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569',
    marginTop: 0,
    marginBottom: '12px'
  },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    padding: '20px',
    borderTop: '1px solid #e5e7eb'
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  createBtn: {
    flex: 1,
    padding: '12px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  deleteAppointmentBtn: {
    flex: 1,
    padding: '12px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  },
  receiptModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3000,
    padding: '20px'
  },
  receiptModalContent: {
    background: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
  },
  receiptModalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e5e7eb'
  },
  receiptModalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  receiptImageContainer: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    overflow: 'auto',
    background: '#f8fafc'
  },
  receiptImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  }
};