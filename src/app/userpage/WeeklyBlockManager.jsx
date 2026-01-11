import { useState, useEffect } from 'react';
import { Calendar, X, Check, AlertCircle, Users, ChevronDown } from 'lucide-react';
import Cookies from 'js-cookie';


const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://thaiback.onrender.com/api';

const WeeklyBlockManager = ({ masseurs, loading: masseursLoading }) => {
  const [selectedMasseur, setSelectedMasseur] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [reason, setReason] = useState('İstirahət günləri');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [showStats, setShowStats] = useState(false);

  const userName = JSON.parse(localStorage.getItem('userData'))?.name;
  const weekDays = [
    { value: 0, name: 'Bazar', short: 'B' },
    { value: 1, name: 'Bazar ertəsi', short: 'BE' },
    { value: 2, name: 'Çərşənbə axşamı', short: 'ÇA' },
    { value: 3, name: 'Çərşənbə', short: 'Ç' },
    { value: 4, name: 'Cümə axşamı', short: 'CA' },
    { value: 5, name: 'Cümə', short: 'C' },
    { value: 6, name: 'Şənbə', short: 'Ş' }
  ];

  const getToken = () => {
      return Cookies.get('authToken');
    };

  useEffect(() => {
    if (selectedMasseur) {
      const today = new Date();
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

      setStartDate(today.toISOString().split('T')[0]);
      setEndDate(threeMonthsLater.toISOString().split('T')[0]);

      fetchWeeklyStats(selectedMasseur._id);
    }
  }, [selectedMasseur]);

  const fetchWeeklyStats = async (masseurId) => {
    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE}/receptionist/masseurs/${masseurId}/weekly-schedule/${token}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWeeklyStats(data.weeklyStats);
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  };

  const toggleDay = (dayValue) => {
    setSelectedDays(prev => 
      prev.includes(dayValue)
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue]
    );
  };

  const handleBlock = async () => {
    if (selectedDays.length === 0) {
      alert('Ən azı bir gün seçin!');
      return;
    }

    if (!startDate || !endDate) {
      alert('Başlanğıc və son tarixi seçin!');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert('Son tarix başlanğıc tarixdən böyük olmalıdır!');
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(
        `${API_BASE}/receptionist/masseurs/${selectedMasseur._id}/block-weekly/${token}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            weekDays: selectedDays,
            reason,
            startDate,
            endDate
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.blockedCount} tarix bloklandı!`);
        setSelectedDays([]);
        fetchWeeklyStats(selectedMasseur._id);
      } else {
        if (data.conflicts) {
          const conflictMsg = data.conflicts.map(c => 
            `${c.date}: ${c.appointments.length} randevu`
          ).join('\n');
          alert(`⚠️ ${data.message}\n\n${conflictMsg}`);
        } else {
          alert('❌ ' + data.message);
        }
      }
    } catch (error) {
      console.error('Block error:', error);
      alert('Xəta baş verdi!');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async () => {
    if (selectedDays.length === 0) {
      alert('Ən azı bir gün seçin!');
      return;
    }

    if (!confirm('Bu günlərdəki blokları götürmək istədiyinizdən əminsiniz?')) {
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(
        `${API_BASE}/receptionist/masseurs/${selectedMasseur._id}/unblock-weekly/${token}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            weekDays: selectedDays,
            startDate,
            endDate
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.removedCount} tarix blokdan çıxarıldı!`);
        setSelectedDays([]);
        fetchWeeklyStats(selectedMasseur._id);
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Unblock error:', error);
      alert('Xəta baş verdi!');
    } finally {
      setLoading(false);
    }
  };

  const handleMasseurSelect = (masseur) => {
    setSelectedMasseur(masseur);
    setShowModal(true);
    setSelectedDays([]);
    setWeeklyStats(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMasseur(null);
    setSelectedDays([]);
    setWeeklyStats(null);
  };

  return (
    <>
      <style jsx>{`
        .page-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .page-subtitle {
          font-size: 1rem;
          color: #6b7280;
        }

        .masseurs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .masseur-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          transition: all 0.2s;
          cursor: pointer;
        }

        .masseur-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .masseur-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .masseur-avatar {
          width: 50px;
          height: 50px;
          border-radius: 25px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1.25rem;
        }

        .masseur-info {
          flex: 1;
        }

        .masseur-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.25rem 0;
        }

        .masseur-role {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .masseur-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .block-count {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .manage-btn {
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .manage-btn:hover {
          background: #2563eb;
        }

        .loading-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          position: sticky;
          top: 0;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 10;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .modal-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .close-btn {
          border: none;
          background: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .close-btn:hover {
          color: #4b5563;
          background: #f3f4f6;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .stats-section {
          background: #eff6ff;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .stats-toggle {
          width: 100%;
          border: none;
          background: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          padding: 0;
          color: #1e3a8a;
          font-weight: 600;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .stat-item {
          text-align: center;
          background: white;
          border-radius: 6px;
          padding: 0.5rem;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.125rem;
          font-weight: 700;
          color: #2563eb;
          margin-top: 0.25rem;
        }

        .form-section {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.75rem;
        }

        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
        }

        .day-btn {
          padding: 0.75rem;
          border-radius: 8px;
          border: 2px solid #e5e7eb;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .day-btn:hover {
          border-color: #d1d5db;
        }

        .day-btn.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .day-short {
          font-size: 0.75rem;
          font-weight: 500;
        }

        .day-full {
          font-size: 0.625rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .check-icon {
          margin: 0.25rem auto 0;
          color: #3b82f6;
        }

        .date-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .input-field {
          width: 100%;
          padding: 0.625rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.875rem;color: #374151;
          transition: all 0.2s;
        }

        .input-field:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .textarea-field {
          width: 100%;
          padding: 0.625rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #374151;
          resize: vertical;
          min-height: 80px;
          transition: all 0.2s;
        }

        .textarea-field:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .modal-footer {
          position: sticky;
          bottom: 0;
          background: white;
          border-top: 1px solid #e5e7eb;
          padding: 1.5rem;
          display: flex;
          gap: 1rem;
          z-index: 10;
        }

        .action-btn {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .block-btn {
          background: #ef4444;
          color: white;
        }

        .block-btn:hover:not(:disabled) {
          background: #dc2626;
        }

        .unblock-btn {
          background: #10b981;
          color: white;
        }

        .unblock-btn:hover:not(:disabled) {
          background: #059669;
        }

        .info-box {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .info-text {
          font-size: 0.875rem;
          color: #92400e;
          margin: 0;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }

          .masseurs-grid {
            grid-template-columns: 1fr;
          }

          .days-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .date-grid {
            grid-template-columns: 1fr;
          }

          .modal-footer {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Həftəlik Qrafik İdarəetməsi</h1>

          <p className="page-subtitle">Massajçıların həftəlik iş günlərini idarə edin</p>
        </div>

        {masseursLoading ? (
          <div className="loading-state">
            <Calendar size={48} />
            <p>Yüklənir...</p>
          </div>
        ) : masseurs.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <p>Hələ heç bir massajçı yoxdur</p>
          </div>
        ) : (
          <div className="masseurs-grid">
            {masseurs.map((masseur) => (
              <div
                key={masseur._id}
                className="masseur-card"
                onClick={() => handleMasseurSelect(masseur)}
              >
                <div className="masseur-header">
                  <div className="masseur-avatar">
                    {masseur.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="masseur-info">
                    <h3 className="masseur-name">{masseur.name}</h3>
                    <p className="masseur-role">Massajçı</p>
                  </div>
                </div>
                <div className="masseur-footer">
                  <span className="block-count">
                    <Calendar size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    Həftəlik qrafik
                  </span>
                  <button className="manage-btn">İdarə et</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedMasseur && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">{selectedMasseur.name}</h2>
                <p className="modal-subtitle">Həftəlik qrafik parametrləri</p>
              </div>
              <button className="close-btn" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              {weeklyStats && (
                <div className="stats-section">
                  <button 
                    className="stats-toggle"
                    onClick={() => setShowStats(!showStats)}
                  >
                    <span>Mövcud bloklar</span>
                    <ChevronDown 
                      size={20} 
                      style={{ 
                        transform: showStats ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.2s'
                      }} 
                    />
                  </button>
                  {showStats && (
                    <div className="stats-grid">
                      {weekDays.map((day) => (
                        <div key={day.value} className="stat-item">
                          <div className="stat-label">{day.short}</div>
                          <div className="stat-value">
                            {weeklyStats[day.value] || 0}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="info-box">
                <AlertCircle size={20} color="#92400e" />
                <p className="info-text">
                  Seçilmiş günlər tarix aralığında bloklanacaq və bu günlərdə randevu alına bilməyəcək.
                </p>
              </div>

              <div className="form-section">
                <label className="form-label">Həftə günləri seçin</label>
                <div className="days-grid">
                  {weekDays.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      className={`day-btn ${selectedDays.includes(day.value) ? 'selected' : ''}`}
                      onClick={() => toggleDay(day.value)}
                    >
                      <div className="day-short">{day.short}</div>
                      <div className="day-full">{day.name}</div>
                      {selectedDays.includes(day.value) && (
                        <Check size={16} className="check-icon" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <label className="form-label">Tarix aralığı</label>
                <div className="date-grid">
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                      Başlanğıc
                    </label>
                    <input
                      type="date"
                      className="input-field"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                      Son
                    </label>
                    <input
                      type="date"
                      className="input-field"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <label className="form-label">Səbəb</label>
                <textarea
                  className="textarea-field"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Blok səbəbini yazın..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="action-btn block-btn"
                onClick={handleBlock}
                disabled={loading || selectedDays.length === 0}
              >
                <AlertCircle size={18} />
                Blokla
              </button>
              <button
                type="button"
                className="action-btn unblock-btn"
                onClick={handleUnblock}
                disabled={loading || selectedDays.length === 0}
              >
                <Check size={18} />
                Bloku götür
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WeeklyBlockManager;