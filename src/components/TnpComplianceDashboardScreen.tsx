import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  UserCheck,
  ShieldCheck,
  FileText,
  Search,
  Printer,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { TnpStudentTracking, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface TnpComplianceDashboardScreenProps {
  trackingRecords: TnpStudentTracking[];
  lang: Language;
  onApproveNoc: (recordId: string) => void;
  onOpenResumeModal: () => void;
}

export const TnpComplianceDashboardScreen: React.FC<TnpComplianceDashboardScreenProps> = ({
  trackingRecords,
  lang,
  onApproveNoc,
  onOpenResumeModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedNocPreview, setSelectedNocPreview] = useState<TnpStudentTracking | null>(null);
  const [showFullAuditModal, setShowFullAuditModal] = useState(false);

  const t = TRANSLATIONS[lang];

  // Filter records
  const filteredRecords = trackingRecords.filter((rec) => {
    const matchStatus = statusFilter === 'All' || rec.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      rec.studentName.toLowerCase().includes(q) ||
      rec.rollNumber.toLowerCase().includes(q) ||
      rec.company.toLowerCase().includes(q) ||
      rec.college.toLowerCase().includes(q) ||
      rec.role.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // Calculate metrics
  const totalStudents = trackingRecords.length;
  const approvedNocCount = trackingRecords.filter(
    (r) => r.status === 'NOC Approved' || r.status === 'Active Internship'
  ).length;
  const pendingCount = trackingRecords.filter((r) => r.status === 'Pending Review').length;
  const clearanceRate = totalStudents > 0 ? Math.round((approvedNocCount / totalStudents) * 100) : 0;

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Record ID',
      'Student Name',
      'Roll Number',
      'College Institution',
      'SME Company',
      'Internship Role',
      'Vizag Location / Zone',
      'Stipend',
      'Compliance Status',
      'NOC Certificate Code',
      'Hours Logged',
      'Applied Date',
    ];

    const rows = trackingRecords.map((r) => [
      `"${r.id}"`,
      `"${r.studentName}"`,
      `"${r.rollNumber}"`,
      `"${r.college}"`,
      `"${r.company}"`,
      `"${r.role}"`,
      `"${r.zone}"`,
      `"${r.stipend}"`,
      `"${r.status}"`,
      `"${r.nocCode || 'N/A'}"`,
      `"${r.attendanceHoursLogged} hrs"`,
      `"${r.appliedDate}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CampusToCareer_Vizag_TnP_Compliance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t.tnpTitle}
            </h1>
            <span className="text-xs bg-slate-900 text-white font-bold px-2.5 py-0.5 rounded-full">
              District Portal
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {t.tnpSubtitle}
          </p>
        </div>

        {/* Action Buttons: Download CSV Report & View Printable Audit */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowFullAuditModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Official NOC Audit View</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t.downloadNocBtn}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">
            Total Students Tracked
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {totalStudents}
            </span>
            <span className="text-xs font-semibold text-slate-400">Vizag Roster</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-emerald-700 block mb-1">
            NOC Issued / Active
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
              {approvedNocCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600">Cleared</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-amber-700 block mb-1">
            Pending NOC Review
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {pendingCount}
            </span>
            <span className="text-xs font-semibold text-amber-600">Action Req.</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">
            NOC Clearance Rate
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {clearanceRate}%
            </span>
            <span className="text-xs font-semibold text-emerald-600">Compliance</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="col-span-2 lg:col-span-1 bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-emerald-400 block mb-1">
            APSCHE / NEP 2020
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-extrabold text-white">
              100% Audit Ready
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

      </div>

      {/* Real-time Tracking Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4">
        
        {/* Table Filters & Search */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by student name, roll #, or SME..."
              className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-slate-800 w-full sm:w-auto"
            >
              <option value="All">All Statuses</option>
              <option value="Active Internship">{t.statusActiveInternship}</option>
              <option value="NOC Approved">{t.statusNocApproved}</option>
              <option value="Pending Review">{t.statusPendingReview}</option>
              <option value="Under Evaluation">{t.statusUnderEval}</option>
            </select>
          </div>
        </div>

        {/* Table / Cards container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student & College</th>
                <th className="py-3 px-4">Recruiter SME & Role</th>
                <th className="py-3 px-4">Zone & Stipend</th>
                <th className="py-3 px-4">Compliance Status</th>
                <th className="py-3 px-4">NOC Certificate</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record) => {
                const isApproved =
                  record.status === 'NOC Approved' || record.status === 'Active Internship';

                return (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {record.studentName}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {record.rollNumber} • {record.college}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">
                        {record.company}
                      </div>
                      <div className="text-xs text-slate-500">
                        {record.role}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs text-slate-700 font-medium">
                        {record.zone}
                      </div>
                      <div className="text-xs font-bold text-emerald-700">
                        {record.stipend}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : record.status === 'Pending Review'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-blue-50 text-blue-800 border-blue-300'
                        }`}
                      >
                        {isApproved ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-600" />
                        )}
                        {record.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {record.attendanceHoursLogged} hrs logged
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs">
                      {record.nocCode ? (
                        <button
                          onClick={() => setSelectedNocPreview(record)}
                          className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                        >
                          {record.nocCode}
                        </button>
                      ) : (
                        <span className="text-slate-400">Awaiting T&P Issue</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {!isApproved ? (
                        <button
                          onClick={() => onApproveNoc(record.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer whitespace-nowrap"
                        >
                          {t.approveNoc}
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedNocPreview(record)}
                          className="px-2.5 py-1 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                        >
                          View NOC
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">
            {t.emptyTnp}
          </div>
        )}
      </div>

      {/* Individual NOC Certificate Preview Modal */}
      {selectedNocPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl border-4 border-slate-900 max-w-xl w-full p-6 sm:p-8 space-y-6 text-slate-900 animate-in zoom-in-95">
            {/* Certificate Header */}
            <div className="text-center border-b-2 border-slate-200 pb-4 space-y-1">
              <span className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase">
                Government of Andhra Pradesh • Technical Education Directorate
              </span>
              <h2 className="text-lg sm:text-xl font-black uppercase text-slate-900 tracking-tight">
                No Objection Certificate (NOC) & Industry Internship Deputation
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Certificate Ref: {selectedNocPreview.nocCode || 'NOC-VZG-2026-PENDING'}
              </p>
            </div>

            {/* Certificate Body */}
            <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800">
              <p>
                This is to officially certify that the student specified below has been cleared by the Training and Placement (T&P) Institutional Cell for off-campus industrial internship under the AP Higher Education mandatory credit framework (AY 2026-27):
              </p>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Name:</span>
                  <strong className="text-slate-900 font-extrabold">{selectedNocPreview.studentName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Roll / Reg Number:</span>
                  <strong className="text-slate-900 font-mono">{selectedNocPreview.rollNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Deputed Enterprise (SME):</span>
                  <strong className="text-slate-900">{selectedNocPreview.company}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Industrial Cluster:</span>
                  <strong className="text-slate-900">{selectedNocPreview.zone}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Designation:</span>
                  <strong className="text-slate-900">{selectedNocPreview.role}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Approved Stipend:</span>
                  <strong className="text-emerald-700 font-bold">{selectedNocPreview.stipend}</strong>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-xs text-slate-600">
                <div>
                  <span className="font-bold block text-slate-900">Dr. M. Srinivasa Rao</span>
                  <span>Chief Placement Officer, Vizag Cluster</span>
                </div>
                <div className="w-16 h-16 border-2 border-emerald-600 rounded-full flex items-center justify-center text-[9px] text-emerald-800 font-extrabold text-center uppercase p-1">
                  OFFICIAL T&P SEAL
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedNocPreview(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Audit Report Printable / View Modal */}
      {showFullAuditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg">
                  Visakhapatnam District College-Industry Compliance Audit (AY 2026-27)
                </h3>
                <p className="text-xs text-emerald-400">
                  Institutional Accreditation Ready (NAAC Criterion 1.3.4 & AICTE Mandate)
                </p>
              </div>
              <button
                onClick={() => setShowFullAuditModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Printable Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <p className="font-bold text-slate-900">Issuing Authority: Visakhapatnam T&P Consortium</p>
                  <p className="text-xs text-slate-500">Partnered with GVPCE, AU College of Engg, ANITS, and GITAM</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Report Generated: {new Date().toLocaleDateString()}</span>
                  <span className="text-xs font-bold text-emerald-700">Verification Hash: SHA256-VZG-9981</span>
                </div>
              </div>

              {/* Summary Stats in Audit */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-100 rounded-lg">
                  <div className="text-xl font-bold text-slate-900">{totalStudents}</div>
                  <div className="text-[11px] text-slate-500">Total Enrolled Students</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <div className="text-xl font-bold text-emerald-700">{approvedNocCount}</div>
                  <div className="text-[11px] text-emerald-800">Verified SME Placements</div>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg">
                  <div className="text-xl font-bold text-slate-900">{clearanceRate}%</div>
                  <div className="text-[11px] text-slate-500">Statutory Clearance Rate</div>
                </div>
              </div>

              {/* Audit Roster */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Student Industry Roster:</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="p-2.5">Roll No</th>
                        <th className="p-2.5">Student</th>
                        <th className="p-2.5">Enterprise</th>
                        <th className="p-2.5">Role</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">NOC Ref</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {trackingRecords.map((r) => (
                        <tr key={r.id}>
                          <td className="p-2.5 font-mono text-[11px]">{r.rollNumber}</td>
                          <td className="p-2.5 font-bold">{r.studentName}</td>
                          <td className="p-2.5">{r.company}</td>
                          <td className="p-2.5">{r.role}</td>
                          <td className="p-2.5 font-semibold text-emerald-700">{r.status}</td>
                          <td className="p-2.5 font-mono text-[11px]">{r.nocCode || 'Pending'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">Campus to Career Institutional Audit</span>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCsv}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold hover:bg-slate-100 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Formal Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
