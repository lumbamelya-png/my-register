import React, { useState } from 'react';
import {
  Download,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  UserCheck,
  ShieldAlert,
  Smartphone,
  MapPin,
  Check,
} from 'lucide-react';
import { AttendanceRecord, ClassSession, Student } from '../types/register';
import { registerStore } from '../services/registerStore';

interface AttendanceRosterProps {
  session: ClassSession;
  students: Student[];
  records: AttendanceRecord[];
}

export const AttendanceRoster: React.FC<AttendanceRosterProps> = ({
  session,
  students,
  records,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent' | 'manual'>('all');
  const [overrideStudentId, setOverrideStudentId] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState<string>('Visual in-person confirmation');

  // Filter students based on query and status
  const filteredStudents = students.filter((student) => {
    const record = records.find((r) => r.studentNumber === student.studentNumber);
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.department.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'present') return !!record;
    if (statusFilter === 'absent') return !record;
    if (statusFilter === 'manual') return record?.status === 'manual';
    return true;
  });

  const presentCount = records.length;
  const absentCount = students.length - presentCount;
  const attendancePercentage = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  // Handle CSV Export
  const handleExportCsv = () => {
    const csvContent = registerStore.exportRegisterCsv(session.id);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${session.courseCode}_Attendance_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApplyOverride = (studentNumber: string) => {
    registerStore.manualOverride(session.id, studentNumber, overrideReason);
    setOverrideStudentId(null);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>{session.courseCode}</span>
            <span aria-hidden="true">·</span>
            <span>{session.room}</span>
            <span aria-hidden="true">·</span>
            <span>Official Attendance Register</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Student Attendance Roster
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Register (.CSV)</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear current attendance for this session?')) {
                registerStore.resetAttendance(session.id);
              }
            }}
            className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Enrolled</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {students.length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Verified Present</span>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {presentCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Absent / Pending</span>
          <div className="text-2xl font-bold font-mono text-slate-500 mt-1">
            {absentCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Attendance Rate</span>
          <div className="text-2xl font-bold font-mono text-indigo-700 mt-1">
            {attendancePercentage}%
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Interactive Segmented Filter Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Students ({students.length})
          </button>
          <button
            onClick={() => setStatusFilter('present')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'present' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Verified Present ({presentCount})
          </button>
          <button
            onClick={() => setStatusFilter('absent')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'absent' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Absent ({absentCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, ID or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Official Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-6">Student Information</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Check-In Time</th>
                <th className="py-3.5 px-4">Token Freshness</th>
                <th className="py-3.5 px-4">Proximity / Device</th>
                <th className="py-3.5 px-6 text-right">Lecturer Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No students match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const record = records.find((r) => r.studentNumber === student.studentNumber);
                  const isPresent = !!record;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Student Info */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900 text-sm">
                          {student.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-mono">{student.studentNumber}</span>
                          <span aria-hidden="true">·</span>
                          <span>{student.department}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isPresent ? (
                          <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>
                              {record.status === 'manual' ? 'Manual Override' : 'Verified In-Person'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                            <Clock className="w-4 h-4 text-slate-300" />
                            <span>Absent / Not Signed</span>
                          </div>
                        )}
                      </td>

                      {/* Check-In Time */}
                      <td className="py-4 px-4 font-mono tabular-nums text-slate-800">
                        {record ? record.checkInTime : '—'}
                      </td>

                      {/* Token Freshness */}
                      <td className="py-4 px-4 font-mono tabular-nums">
                        {record ? (
                          <span className="text-emerald-700 font-semibold">
                            {record.tokenAgeSec}s (Pass)
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Proximity / Device Fingerprint */}
                      <td className="py-4 px-4 text-slate-600">
                        {record ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-[11px] text-slate-700">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{record.distanceMeters !== null ? `${record.distanceMeters}m from screen` : 'Classroom GPS verified'}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                              {record.deviceFingerprint}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Lecturer Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {overrideStudentId === student.studentNumber ? (
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="text"
                              value={overrideReason}
                              onChange={(e) => setOverrideReason(e.target.value)}
                              placeholder="Reason for override..."
                              className="text-[11px] p-1.5 border border-slate-300 rounded bg-white text-slate-900"
                            />
                            <button
                              onClick={() => handleApplyOverride(student.studentNumber)}
                              className="px-2.5 py-1.5 bg-emerald-600 text-white rounded text-[11px] font-semibold flex items-center gap-1 hover:bg-emerald-700"
                            >
                              <Check className="w-3 h-3" />
                              <span>Confirm</span>
                            </button>
                            <button
                              onClick={() => setOverrideStudentId(null)}
                              className="px-2 py-1.5 text-slate-500 hover:text-slate-700 text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (isPresent) {
                                alert(`${student.name} is already verified in this session.`);
                              } else {
                                setOverrideStudentId(student.studentNumber);
                              }
                            }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                              isPresent
                                ? 'text-slate-400 bg-slate-50 cursor-default'
                                : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                            }`}
                          >
                            {isPresent ? 'Signed' : 'Manual Sign-In'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
