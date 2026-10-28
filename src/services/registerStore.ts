import { AttendanceRecord, ClassSession, SecurityAuditLog, Student } from '../types/register';

const DEFAULT_SESSIONS: ClassSession[] = [
  {
    id: 'session-cs302',
    courseCode: 'CS-302',
    courseTitle: 'Network Security & Cryptography',
    lecturerName: 'Dr. Marcus Vance',
    room: 'Turing Hall A · Room 402',
    date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    rotationIntervalSec: 6,
    geofenceEnabled: true,
    geofenceRadiusMeters: 120,
    classroomCoords: {
      lat: 51.5074,
      lng: -0.1278,
      name: 'Turing Lecture Complex (Room 402)',
    },
    requireSyncChallenge: false,
    active: true,
    startedAt: Date.now() - 1000 * 60 * 18,
  },
  {
    id: 'session-eng410',
    courseCode: 'ENG-410',
    courseTitle: 'Distributed Systems & Cloud Scale',
    lecturerName: 'Prof. Elena Rostova',
    room: 'Faraday Auditorium 101',
    date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    rotationIntervalSec: 5,
    geofenceEnabled: true,
    geofenceRadiusMeters: 100,
    classroomCoords: {
      lat: 51.5080,
      lng: -0.1285,
      name: 'Faraday Auditorium',
    },
    requireSyncChallenge: true,
    active: true,
    startedAt: Date.now() - 1000 * 60 * 32,
  },
];

export const INITIAL_STUDENTS: Student[] = [
  { id: 'st-01', name: 'Sophia Chen', studentNumber: 'ST-202401', email: 's.chen@uni.ac.uk', department: 'Computer Science' },
  { id: 'st-02', name: 'Liam O’Connor', studentNumber: 'ST-202402', email: 'l.oconnor@uni.ac.uk', department: 'Computer Science' },
  { id: 'st-03', name: 'Amara Okafor', studentNumber: 'ST-202403', email: 'a.okafor@uni.ac.uk', department: 'Software Engineering' },
  { id: 'st-04', name: 'Mateo Rossi', studentNumber: 'ST-202404', email: 'm.rossi@uni.ac.uk', department: 'Computer Science' },
  { id: 'st-05', name: 'Priya Sharma', studentNumber: 'ST-202405', email: 'p.sharma@uni.ac.uk', department: 'Cybersecurity' },
  { id: 'st-06', name: 'Kai Takahashi', studentNumber: 'ST-202406', email: 'k.takahashi@uni.ac.uk', department: 'Computer Science' },
  { id: 'st-07', name: 'Zainab Al-Mansoor', studentNumber: 'ST-202407', email: 'z.mansoor@uni.ac.uk', department: 'Software Engineering' },
  { id: 'st-08', name: 'Lucas Dubois', studentNumber: 'ST-202408', email: 'l.dubois@uni.ac.uk', department: 'Data Science' },
  { id: 'st-09', name: 'Chloe Jenkins', studentNumber: 'ST-202409', email: 'c.jenkins@uni.ac.uk', department: 'Computer Science' },
  { id: 'st-10', name: 'Ethan Morales', studentNumber: 'ST-202410', email: 'e.morales@uni.ac.uk', department: 'Cybersecurity' },
  { id: 'st-11', name: 'Hanna Lindstrom', studentNumber: 'ST-202411', email: 'h.lindstrom@uni.ac.uk', department: 'Computer Science' },
  { id: 'st-12', name: 'Tariq Habib', studentNumber: 'ST-202412', email: 't.habib@uni.ac.uk', department: 'Software Engineering' },
  { id: 'st-13', name: 'Beatriz Santos', studentNumber: 'ST-202413', email: 'b.santos@uni.ac.uk', department: 'Computer Science' },
  { id: 'st-14', name: 'Noah Van Der Beek', studentNumber: 'ST-202414', email: 'n.vanderbeek@uni.ac.uk', department: 'Computer Science' },
  { id: 'st-15', name: 'Aria Patel', studentNumber: 'ST-202415', email: 'a.patel@uni.ac.uk', department: 'Cybersecurity' },
  { id: 'st-16', name: 'Marcus Sterling', studentNumber: 'ST-202416', email: 'm.sterling@uni.ac.uk', department: 'Computer Science' },
  { id: 'st-17', name: 'Yuki Tanaka', studentNumber: 'ST-202417', email: 'y.tanaka@uni.ac.uk', department: 'Software Engineering' },
  { id: 'st-18', name: 'Devon Brooks', studentNumber: 'ST-202418', email: 'd.brooks@uni.ac.uk', department: 'Data Science' },
  { id: 'st-19', name: 'Fatima Zahra', studentNumber: 'ST-202419', email: 'f.zahra@uni.ac.uk', department: 'Computer Science' },
  { id: 'st-20', name: 'Oliver Wright', studentNumber: 'ST-202420', email: 'o.wright@uni.ac.uk', department: 'Software Engineering' },
];

const INITIAL_RECORDS: AttendanceRecord[] = [
  {
    id: 'rec-01',
    sessionId: 'session-cs302',
    studentId: 'st-01',
    studentName: 'Sophia Chen',
    studentNumber: 'ST-202401',
    checkInTime: '09:02:14 AM',
    checkInTimestamp: Date.now() - 1000 * 60 * 16,
    tokenAgeSec: 1.8,
    distanceMeters: 14,
    deviceFingerprint: 'dev_sc901_1920x1080',
    status: 'verified',
    verificationMethod: 'live_camera',
  },
  {
    id: 'rec-02',
    sessionId: 'session-cs302',
    studentId: 'st-03',
    studentName: 'Amara Okafor',
    studentNumber: 'ST-202403',
    checkInTime: '09:03:02 AM',
    checkInTimestamp: Date.now() - 1000 * 60 * 15,
    tokenAgeSec: 2.1,
    distanceMeters: 28,
    deviceFingerprint: 'dev_am410_390x844',
    status: 'verified',
    verificationMethod: 'live_camera',
  },
  {
    id: 'rec-03',
    sessionId: 'session-cs302',
    studentId: 'st-06',
    studentName: 'Kai Takahashi',
    studentNumber: 'ST-202406',
    checkInTime: '09:04:45 AM',
    checkInTimestamp: Date.now() - 1000 * 60 * 13,
    tokenAgeSec: 1.5,
    distanceMeters: 35,
    deviceFingerprint: 'dev_kt812_412x915',
    status: 'verified',
    verificationMethod: 'live_camera',
  },
  {
    id: 'rec-04',
    sessionId: 'session-cs302',
    studentId: 'st-07',
    studentName: 'Zainab Al-Mansoor',
    studentNumber: 'ST-202407',
    checkInTime: '09:05:30 AM',
    checkInTimestamp: Date.now() - 1000 * 60 * 12,
    tokenAgeSec: 3.2,
    distanceMeters: 19,
    deviceFingerprint: 'dev_zm204_393x852',
    status: 'verified',
    verificationMethod: 'live_camera',
  },
  {
    id: 'rec-05',
    sessionId: 'session-cs302',
    studentId: 'st-10',
    studentName: 'Ethan Morales',
    studentNumber: 'ST-202410',
    checkInTime: '09:07:11 AM',
    checkInTimestamp: Date.now() - 1000 * 60 * 10,
    tokenAgeSec: 2.7,
    distanceMeters: 42,
    deviceFingerprint: 'dev_em703_360x800',
    status: 'verified',
    verificationMethod: 'live_camera',
  },
  {
    id: 'rec-06',
    sessionId: 'session-cs302',
    studentId: 'st-15',
    studentName: 'Aria Patel',
    studentNumber: 'ST-202415',
    checkInTime: '09:10:04 AM',
    checkInTimestamp: Date.now() - 1000 * 60 * 7,
    tokenAgeSec: 1.9,
    distanceMeters: 8,
    deviceFingerprint: 'dev_ap110_430x932',
    status: 'verified',
    verificationMethod: 'live_camera',
  },
];

const INITIAL_LOGS: SecurityAuditLog[] = [
  {
    id: 'log-01',
    sessionId: 'session-cs302',
    timestamp: Date.now() - 1000 * 60 * 16,
    event: 'SCAN_VERIFIED',
    studentName: 'Sophia Chen',
    studentNumber: 'ST-202401',
    details: 'Verified in-person presence · Token age: 1.8s · Distance: 14m · Fingerprint: dev_sc901',
    severity: 'success',
  },
  {
    id: 'log-02',
    sessionId: 'session-cs302',
    timestamp: Date.now() - 1000 * 60 * 11,
    event: 'EXPIRED_QR_REJECTED',
    studentName: 'Unregistered / Forwarded',
    details: 'ATTACK BLOCKED: Stale QR token scanned 22.4s after generation (TTL: 6s). Forwarded photo detected and rejected.',
    severity: 'danger',
    attemptedDelaySec: 22.4,
  },
  {
    id: 'log-03',
    sessionId: 'session-cs302',
    timestamp: Date.now() - 1000 * 60 * 8,
    event: 'GEOFENCE_VIOLATION',
    studentName: 'Attempted from Off-Campus',
    details: 'ATTACK BLOCKED: Device reported location 2,450m away from Turing Room 402 (Boundary limit: 120m).',
    severity: 'warning',
  },
  {
    id: 'log-04',
    sessionId: 'session-cs302',
    timestamp: Date.now() - 1000 * 60 * 7,
    event: 'SCAN_VERIFIED',
    studentName: 'Aria Patel',
    studentNumber: 'ST-202415',
    details: 'Verified in-person presence · Token age: 1.9s · Distance: 8m · Fingerprint: dev_ap110',
    severity: 'success',
  },
];

class RegisterStore {
  private sessions: ClassSession[] = [];
  private students: Student[] = [];
  private records: AttendanceRecord[] = [];
  private logs: SecurityAuditLog[] = [];
  private currentSessionId: string = 'session-cs302';
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('my_register_bus');
        this.broadcastChannel.onmessage = (ev) => {
          if (ev.data && ev.data.type === 'SYNC_STATE') {
            this.loadFromStorage();
            this.notify();
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported', e);
      }
    }
  }

  private loadFromStorage() {
    try {
      const storedSessions = localStorage.getItem('my_register_sessions');
      this.sessions = storedSessions ? JSON.parse(storedSessions) : DEFAULT_SESSIONS;

      const storedStudents = localStorage.getItem('my_register_students');
      this.students = storedStudents ? JSON.parse(storedStudents) : INITIAL_STUDENTS;

      const storedRecords = localStorage.getItem('my_register_records');
      this.records = storedRecords ? JSON.parse(storedRecords) : INITIAL_RECORDS;

      const storedLogs = localStorage.getItem('my_register_logs');
      this.logs = storedLogs ? JSON.parse(storedLogs) : INITIAL_LOGS;

      const storedCurrentId = localStorage.getItem('my_register_current_session');
      if (storedCurrentId) {
        this.currentSessionId = storedCurrentId;
      }
    } catch {
      this.sessions = DEFAULT_SESSIONS;
      this.students = INITIAL_STUDENTS;
      this.records = INITIAL_RECORDS;
      this.logs = INITIAL_LOGS;
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('my_register_sessions', JSON.stringify(this.sessions));
      localStorage.setItem('my_register_students', JSON.stringify(this.students));
      localStorage.setItem('my_register_records', JSON.stringify(this.records));
      localStorage.setItem('my_register_logs', JSON.stringify(this.logs));
      localStorage.setItem('my_register_current_session', this.currentSessionId);

      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'SYNC_STATE', timestamp: Date.now() });
      }
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getSessions(): ClassSession[] {
    return this.sessions;
  }

  public getCurrentSession(): ClassSession {
    const found = this.sessions.find((s) => s.id === this.currentSessionId);
    return found || this.sessions[0];
  }

  public setCurrentSession(id: string) {
    this.currentSessionId = id;
    this.saveToStorage();
    this.notify();
  }

  public getStudents(): Student[] {
    return this.students;
  }

  public getRecordsForSession(sessionId?: string): AttendanceRecord[] {
    const targetSessionId = sessionId || this.currentSessionId;
    return this.records.filter((r) => r.sessionId === targetSessionId);
  }

  public getLogsForSession(sessionId?: string): SecurityAuditLog[] {
    const targetSessionId = sessionId || this.currentSessionId;
    return this.logs.filter((l) => l.sessionId === targetSessionId);
  }

  public addAttendanceRecord(record: Omit<AttendanceRecord, 'id'>): AttendanceRecord {
    const newRecord: AttendanceRecord = {
      ...record,
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    // Filter out prior record for same student in this session if any
    this.records = [newRecord, ...this.records.filter((r) => !(r.sessionId === record.sessionId && r.studentNumber === record.studentNumber))];
    this.saveToStorage();
    this.notify();
    return newRecord;
  }

  public addSecurityLog(log: Omit<SecurityAuditLog, 'id'>): SecurityAuditLog {
    const newLog: SecurityAuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    this.logs = [newLog, ...this.logs];
    // Keep max 150 logs in storage
    if (this.logs.length > 150) {
      this.logs = this.logs.slice(0, 150);
    }
    this.saveToStorage();
    this.notify();
    return newLog;
  }

  public manualOverride(sessionId: string, studentNumber: string, reason: string): boolean {
    const student = this.students.find((s) => s.studentNumber === studentNumber);
    if (!student) return false;

    const newRecord: AttendanceRecord = {
      id: `rec-${Date.now()}`,
      sessionId,
      studentId: student.id,
      studentName: student.name,
      studentNumber: student.studentNumber,
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      checkInTimestamp: Date.now(),
      tokenAgeSec: 0,
      distanceMeters: 0,
      deviceFingerprint: 'manual_lecturer_override',
      status: 'manual',
      flagReason: `Instructor Override: ${reason}`,
      verificationMethod: 'manual_override',
    };

    this.records = [newRecord, ...this.records.filter((r) => !(r.sessionId === sessionId && r.studentNumber === studentNumber))];

    this.addSecurityLog({
      sessionId,
      timestamp: Date.now(),
      event: 'MANUAL_OVERRIDE',
      studentName: student.name,
      studentNumber: student.studentNumber,
      details: `Instructor manual check-in granted: ${reason}`,
      severity: 'info',
    });

    this.saveToStorage();
    this.notify();
    return true;
  }

  public updateSessionSettings(sessionId: string, patch: Partial<ClassSession>) {
    this.sessions = this.sessions.map((s) => (s.id === sessionId ? { ...s, ...patch } : s));
    this.saveToStorage();
    this.notify();
  }

  public resetAttendance(sessionId: string) {
    this.records = this.records.filter((r) => r.sessionId !== sessionId);
    this.logs = this.logs.filter((l) => l.sessionId !== sessionId);
    this.addSecurityLog({
      sessionId,
      timestamp: Date.now(),
      event: 'TOKEN_ROTATED',
      details: 'Register reset by lecturer. Ready for new attendance sweep.',
      severity: 'info',
    });
    this.saveToStorage();
    this.notify();
  }

  public exportRegisterCsv(sessionId: string): string {
    const session = this.sessions.find((s) => s.id === sessionId) || this.getCurrentSession();
    const records = this.getRecordsForSession(sessionId);
    const enrolled = this.students;

    const rows: string[] = [];
    rows.push(`Course: ${session.courseCode} - ${session.courseTitle}`);
    rows.push(`Lecturer: ${session.lecturerName}`);
    rows.push(`Room: ${session.room}`);
    rows.push(`Date: ${session.date}`);
    rows.push(`Exported At: ${new Date().toISOString()}`);
    rows.push('');
    rows.push('Student Number,Full Name,Email,Department,Status,Check-in Time,Token Freshness (s),Proximity (m),Verification Mode,Audit Flags');

    enrolled.forEach((student) => {
      const record = records.find((r) => r.studentNumber === student.studentNumber);
      if (record) {
        rows.push(
          `"${student.studentNumber}","${student.name}","${student.email}","${student.department}","${record.status.toUpperCase()}","${record.checkInTime}","${record.tokenAgeSec}s","${record.distanceMeters !== null ? record.distanceMeters + 'm' : 'N/A'}","${record.verificationMethod}","${record.flagReason || 'CLEAN'}"`
        );
      } else {
        rows.push(
          `"${student.studentNumber}","${student.name}","${student.email}","${student.department}","ABSENT","--","--","--","--","Did not check in"`
        );
      }
    });

    return rows.join('\n');
  }
}

export const registerStore = new RegisterStore();
