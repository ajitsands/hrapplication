# e:\hrsolution\scratch\build_full_document.py
# High-End Functionality Document Generator (19 Dedicated Pages)
# Prepared By: Uniglobal Consultancy
# Powered By: SaNDS Lab Middle East W.L.L.

import base64
import os
import subprocess
import sys
import pypdf

def get_base64_img(path):
    if not os.path.exists(path):
        print(f"Error: Path does not exist: {path}")
        sys.exit(1)
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

uniglobal_white_b64 = get_base64_img(r"e:\hrsolution\UniGlobal\UniGlobalWhite.png")
uniglobal_final_b64 = get_base64_img(r"e:\hrsolution\UniGlobal\UNIGLOBAL_CONSULTANCY_LOGO_FINAL.png")
sandslab_logo_b64 = get_base64_img(r"e:\hrsolution\assets\SaNDSLab_Logo.png")

print("Base64 assets ready.")

# Shared Page Header Component
def render_header(section_num, section_title):
    return f"""
    <div class="doc-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        <img class="doc-header-logo" src="data:image/png;base64,{uniglobal_final_b64}" alt="Uniglobal Consultancy" />
        <span style="font-size: 7pt; color: #94a3b8; letter-spacing: 0.5px; text-transform: uppercase;">| Prepared By Uniglobal Consultancy</span>
      </div>
      <div style="text-align: right; font-weight: 600; color: #475569;">
        <span>Sec {section_num}: {section_title}</span>
      </div>
    </div>
    """

# Shared Page Footer Component
def render_footer(page_num, total_pages=19):
    return f"""
    <div class="doc-footer">
      <div>
        Prepared by <strong>Uniglobal Consultancy</strong> • Powered by <strong>SaNDS Lab Middle East W.L.L. (Kingdom of Bahrain)</strong>
      </div>
      <div style="font-weight: 700; color: #0f172a;">
        Page {page_num} of {total_pages}
      </div>
    </div>
    """

# Constructing the 19 Pages
pages = []

# ==============================================================================
# PAGE 1: COVER PAGE
# ==============================================================================
page_1 = f"""
<div class="cover-container">
  <div class="cover-accent-circle"></div>

  <div class="cover-top-bar">
    <div>
      <div style="font-size: 7.5pt; text-transform: uppercase; letter-spacing: 1.2px; color: #94a3b8; margin-bottom: 6px;">Prepared By:</div>
      <img class="cover-uniglobal-logo" src="data:image/png;base64,{uniglobal_white_b64}" alt="Uniglobal Consultancy" />
    </div>
    <div class="cover-badge">Enterprise Edition 2026</div>
  </div>

  <div class="cover-hero">
    <div class="cover-pill">
      <span>🇧🇭 Kingdom of Bahrain &amp; GCC Regional Compliance Standards</span>
    </div>
    <div class="cover-title">
      Gulf Enterprise HR &amp; Payroll Solution
    </div>
    <div class="cover-subtitle">
      Comprehensive System Functionality Specification, Statutory Rules Engine, Hardware Integration Architecture &amp; Operational Workflow Documentation.
    </div>

    <div class="cover-features-grid">
      <div class="cover-feature-card">
        <div class="cover-feature-title">Bahrain Labor Law No. 36/2012</div>
        <div class="cover-feature-desc">Automated GOSI social insurance tiers, LMRA monthly levy, overtime multipliers (1.25x/1.50x/2.00x), and statutory EOSB gratuity formulas.</div>
      </div>
      <div class="cover-feature-card">
        <div class="cover-feature-title">Smart Card Hardware Bridge</div>
        <div class="cover-feature-desc">Instant Bahrain CPR chip reading for 2025/2026 back-chip &amp; legacy front-chip cards via SaNDSLabCardBridge on Port 5050.</div>
      </div>
      <div class="cover-feature-card">
        <div class="cover-feature-title">Executive Laser Print Engines</div>
        <div class="cover-feature-desc">Official A5 Laser Payslips with dual authorization signatures and 1-31 Landscape Attendance Matrix sheets.</div>
      </div>
    </div>

    <div class="cover-meta-box">
      <div>
        <div class="meta-col-title">Document Reference</div>
        <div class="meta-col-val">UGC-HRMS-DOC-2026-V2</div>
        <div class="meta-col-sub">Classification: Commercial &amp; Operational Spec</div>
      </div>
      <div>
        <div class="meta-col-title">Primary Consultant</div>
        <div class="meta-col-val">Uniglobal Consultancy</div>
        <div class="meta-col-sub">Strategic HR &amp; Business Advisory</div>
      </div>
      <div>
        <div class="meta-col-title">Technology Partner</div>
        <div class="meta-col-val">SaNDS Lab Middle East W.L.L.</div>
        <div class="meta-col-sub">Software Architecture &amp; Automation</div>
      </div>
    </div>
  </div>

  <div class="cover-footer">
    <div class="sandslab-box">
      <img class="sandslab-cover-logo" src="data:image/png;base64,{sandslab_logo_b64}" alt="SaNDS Lab Middle East W.L.L." />
      <div class="sandslab-text-block">
        <div class="sandslab-text-bold">Powered by SaNDS Lab Middle East W.L.L.</div>
        <div>Salmabad, Kingdom of Bahrain • www.sandslab.com • +97335078079</div>
      </div>
    </div>
    <div style="font-size: 7.5pt; color: #94a3b8; text-align: right;">
      CONFIDENTIAL &amp; PROPRIETARY<br>
      Release Date: October 2026 • Version 2.5.0
    </div>
  </div>
</div>
"""
pages.append(page_1)

# ==============================================================================
# PAGE 2: TABLE OF CONTENTS & DOCUMENT CONTROL
# ==============================================================================
page_2 = f"""
<div class="page">
  {render_header("00", "Table of Contents & Document Control")}
  <div class="body">
    <h1 class="section-title"><span class="sec-num">00</span> Table of Contents &amp; Executive Document Control</h1>

    <div class="grid-2" style="margin: 4px 0 6px 0;">
      <div class="info-card blue" style="padding: 6px 8px;">
        <div class="card-title" style="font-size: 7.5pt;">Document Governance &amp; Control</div>
        <table style="width: 100%; font-size: 6.8pt; margin-top: 2px;">
          <tr><td style="color: #64748b; width: 35%;">Project Name:</td><td><strong>Gulf Enterprise HR &amp; Payroll Solution</strong></td></tr>
          <tr><td style="color: #64748b;">Document Title:</td><td>Comprehensive System Functionality &amp; Workflow Document</td></tr>
          <tr><td style="color: #64748b;">Prepared By:</td><td><strong>Uniglobal Consultancy</strong></td></tr>
          <tr><td style="color: #64748b;">Powered By:</td><td><strong>SaNDS Lab Middle East W.L.L. (Kingdom of Bahrain)</strong></td></tr>
          <tr><td style="color: #64748b;">Release Version:</td><td>v2.5.0 Enterprise (Release 2026)</td></tr>
          <tr><td style="color: #64748b;">Primary Territory:</td><td>Kingdom of Bahrain (Default) + Multi-Country GCC Presets</td></tr>
        </table>
      </div>
      <div class="info-card pink" style="padding: 6px 8px;">
        <div class="card-title" style="font-size: 7.5pt;">Compliance Baseline &amp; Standards</div>
        <table style="width: 100%; font-size: 6.8pt; margin-top: 2px;">
          <tr><td style="color: #64748b; width: 35%;">Labor Regulation:</td><td>Bahrain Labor Law for the Private Sector (Law No. 36/2012)</td></tr>
          <tr><td style="color: #64748b;">Social Insurance:</td><td>General Organisation for Social Insurance (GOSI Bahrain)</td></tr>
          <tr><td style="color: #64748b;">Labor Market:</td><td>Labour Market Regulatory Authority (LMRA) Expat Levy</td></tr>
          <tr><td style="color: #64748b;">Smart Card Spec:</td><td>Bahrain Information &amp; eGovernment Authority (IGA / CIO)</td></tr>
          <tr><td style="color: #64748b;">Currency Standard:</td><td>ISO 4217 BHD (3 Decimal Places, e.g. BD 1,250.000)</td></tr>
          <tr><td style="color: #64748b;">Timezone:</td><td>Asia/Bahrain (GMT+3) Standard Arabian Time</td></tr>
        </table>
      </div>
    </div>

    <h2 class="subsection-title" style="margin: 4px 0; font-size: 9.5pt;">Index of Chapters</h2>
    <table class="data-table" style="font-size: 6.8pt; margin: 3px 0;">
      <thead>
        <tr>
          <th style="width: 6%; padding: 3px 6px;">Sec</th>
          <th style="width: 33%; padding: 3px 6px;">Chapter Title</th>
          <th style="width: 50%; padding: 3px 6px;">Core Scope &amp; Functional Highlights</th>
          <th style="width: 11%; padding: 3px 6px;">Type</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="padding: 2.5px 6px;"><strong>01</strong></td><td style="padding: 2.5px 6px;"><strong>Executive Overview &amp; GCC Compliance</strong></td><td style="padding: 2.5px 6px;">Strategic purpose, Bahrain Law 36/2012, GCC presets, 3-decimal currency standards.</td><td style="padding: 2.5px 6px;"><span class="badge badge-blue">Foundation</span></td></tr>
        <tr><td style="padding: 2.5px 6px;"><strong>02</strong></td><td style="padding: 2.5px 6px;"><strong>System Architecture &amp; Tech Stack</strong></td><td style="padding: 2.5px 6px;">Pure Core PHP MVC backend, React 19 + Vite frontend, 18 MySQL tables, REST APIs.</td><td style="padding: 2.5px 6px;"><span class="badge badge-slate">Technical</span></td></tr>
        <tr><td style="padding: 2.5px 6px;"><strong>03</strong></td><td style="padding: 2.5px 6px;"><strong>Role-Based Access Control (RBAC)</strong></td><td style="padding: 2.5px 6px;">System Admin, HR Operations Admin, Employee Self-Service, permissions matrix.</td><td style="padding: 2.5px 6px;"><span class="badge badge-slate">Security</span></td></tr>
        <tr><td style="padding: 2.5px 6px;"><strong>04</strong></td><td style="padding: 2.5px 6px;"><strong>Dashboard &amp; Executive GCC Radar</strong></td><td style="padding: 2.5px 6px;">Real-time workforce metrics, 30/60/90 days document expiry radar, live digital clock.</td><td style="padding: 2.5px 6px;"><span class="badge badge-blue">Functional</span></td></tr>
        <tr><td style="padding: 2.5px 6px;"><strong>05</strong></td><td style="padding: 2.5px 6px;"><strong>Employee Lifecycle &amp; Document Vault</strong></td><td style="padding: 2.5px 6px;">Onboarding, CPR/Passport/Visa tracking, Bahrain salary structure, expiry badges.</td><td style="padding: 2.5px 6px;"><span class="badge badge-blue">Functional</span></td></tr>
        <tr><td style="padding: 2.5px 6px;"><strong>06</strong></td><td style="padding: 2.5px 6px;"><strong>Bahrain Smart Card Hardware Bridge</strong></td><td style="padding: 2.5px 6px;">SaNDSLabCardBridge (Port 5050), 2025/2026 back-chip &amp; front-chip CPR reading.</td><td style="padding: 2.5px 6px;"><span class="badge badge-pink">Hardware</span></td></tr>
        <tr><td style="padding: 2.5px 6px;"><strong>07</strong></td><td style="padding: 2.5px 6px;"><strong>Shift Management &amp; Rostering</strong></td><td style="padding: 2.5px 6px;">Shift Master, Morning/Evening/Night/Split shifts, grace periods, night OT, roster.</td><td style="padding: 2.5px 6px;"><span class="badge badge-blue">Operations</span></td></tr>
        <tr><td style="padding: 2.5px 6px;"><strong>08</strong></td><td style="padding: 2.5px 6px;"><strong>Biometric Attendance &amp; Overtime</strong></td><td style="padding: 2.5px 6px;">Biometric CSV importer, live punches, overtime calculation (1.25x / 1.50x / 2.00x).</td><td style="padding: 2.5px 6px;"><span class="badge badge-emerald">Engine</span></td></tr>
        <tr><td style="padding: 2.5px 6px;"><strong>09</strong></td><td style="padding: 2.5px 6px;"><strong>1-31 Landscape Attendance Matrix</strong></td><td style="padding: 2.5px 6px;">Full monthly calendar grid, daily tokens (P, A, HD, L, OFF, H), laser print engine.</td><td style="padding: 2.5px 6px;"><span class="badge badge-emerald">Reporting</span></td></tr>
        <tr><td style="padding: 2.5px 6px;"><strong>10</strong></td><td style="padding: 2.5px 6px;"><strong>Gulf Payroll Engine &amp; Deductions</strong></td><td style="padding: 2.5px 6px;">Batch processing, GOSI citizen (7%/12%) vs expat (1%/3%), LMRA levy, loan EMI.</td><td style="padding: 2.5px 6px;"><span class="badge badge-emerald">Engine</span></td></tr>
        <tr><td style="padding: 2.5px 6px;"><strong>11</strong></td><td style="padding: 2.5px 6px;"><strong>Official A5 Laser Payslip Generation</strong></td><td style="padding: 2.5px 6px;">A5 Laser/Thermal print layout, dual authorization signatures, detailed breakdown.</td><td style="padding: 2.5px 6px;"><span class="badge badge-emerald">Output</span></td></tr>
        <tr><td style="padding: 2.5px 6px;"><strong>12</strong></td><td style="padding: 2.5px 6px;"><strong>Indemnity (EOSB) &amp; Leave Encashment</strong></td><td style="padding: 2.5px 6px;">Article 116 gratuity formula (15 days Y1-3, 30 days Y4+), pro-rata days, Settlement Cert.</td><td style="padding: 2.5px 6px;"><span class="badge badge-amber">Legal Engine</span></td></tr>
        <tr><td style="padding: 2.5px 6px;"><strong>13</strong></td><td style="padding: 2.5px 6px;"><strong>Leaves &amp; Vacation Management</strong></td><td style="padding: 2.5px 6px;">Statutory leave types (Annual 30d, Sick tiered, Maternity 60d, Hajj 14d), approvals.</td><td style="padding: 2.5px 6px;"><span class="badge badge-blue">Operations</span></td></tr>
        <tr><td style="padding: 2.5px 6px;"><strong>14</strong></td><td style="padding: 2.5px 6px;"><strong>Loans &amp; Salary Advance Schedules</strong></td><td style="padding: 2.5px 6px;">Loan disbursement, automated monthly EMI deduction during payroll, repayment ledger.</td><td style="padding: 2.5px 6px;"><span class="badge badge-blue">Finance</span></td></tr>
        <tr><td style="padding: 2.5px 6px;"><strong>15</strong></td><td style="padding: 2.5px 6px;"><strong>Regional Settings &amp; Org Masters</strong></td><td style="padding: 2.5px 6px;">1-Click GCC presets (BH, KSA, UAE, KW, QA, OM), departments, designations, holidays.</td><td style="padding: 2.5px 6px;"><span class="badge badge-slate">Config</span></td></tr>
        <tr><td style="padding: 2.5px 6px;"><strong>16</strong></td><td style="padding: 2.5px 6px;"><strong>End-to-End Operational Workflows</strong></td><td style="padding: 2.5px 6px;">Step-by-step visual workflow procedures for onboarding, attendance, payroll, exit.</td><td style="padding: 2.5px 6px;"><span class="badge badge-pink">Workflows</span></td></tr>
        <tr><td style="padding: 2.5px 6px;"><strong>17</strong></td><td style="padding: 2.5px 6px;"><strong>Consultant &amp; Partner Credentials</strong></td><td style="padding: 2.5px 6px;">Uniglobal Consultancy corporate advisory profile and SaNDS Lab Middle East credentials.</td><td style="padding: 2.5px 6px;"><span class="badge badge-blue">Credentials</span></td></tr>
      </tbody>
    </table>
  </div>
  {render_footer(2)}
</div>
"""
pages.append(page_2)

# ==============================================================================
# PAGE 3: SECTION 01 — EXECUTIVE OVERVIEW & GCC COMPLIANCE FRAMEWORK
# ==============================================================================
page_3 = f"""
<div class="page">
  {render_header("01", "Executive Overview & GCC Compliance Framework")}
  <div class="body">
    <h1 class="section-title"><span class="sec-num">01</span> Executive Overview &amp; GCC Compliance Framework</h1>

    <h2 class="subsection-title">1.1 Strategic Solution Purpose</h2>
    <p>
      The <strong>Gulf Enterprise HR &amp; Payroll Solution</strong> is a mission-critical Human Resource Management, Workforce Attendance, and Payroll Processing platform engineered specifically for corporate enterprises, contracting companies, retail groups, and service organizations operating in the <strong>Kingdom of Bahrain and the greater Gulf Cooperation Council (GCC) region</strong>.
    </p>

    <h2 class="subsection-title">1.2 Kingdom of Bahrain Statutory Labor Law Compliance (Law No. 36 of 2012)</h2>
    <div class="grid-3">
      <div class="info-card blue">
        <div class="card-title">GOSI Social Insurance</div>
        <div class="card-text">
          <strong>Bahraini / GCC Citizens:</strong> 7.00% Employee Share and 12.00% Employer Share on Basic + Housing.<br>
          <strong>Expatriate Workforce:</strong> 1.00% Employee Share and 3.00% Employer Share on Basic Salary.
        </div>
      </div>
      <div class="info-card pink">
        <div class="card-title">LMRA Expatriate Levy</div>
        <div class="card-text">
          Automated accounting for the monthly <strong>10.000 BHD</strong> Labour Market Regulatory Authority (LMRA) work permit levy per expatriate staff member.
        </div>
      </div>
      <div class="info-card emerald">
        <div class="card-title">Overtime Multipliers (Art. 54)</div>
        <div class="card-text">
          <strong>Normal Day OT:</strong> 1.25x hourly wage.<br>
          <strong>Night (19:00 - 07:00) / Weekend OT:</strong> 1.50x.<br>
          <strong>Official Holiday OT:</strong> 2.00x hourly wage.
        </div>
      </div>
    </div>

    <h2 class="subsection-title">1.3 Multi-Country GCC Configuration &amp; Regional Presets</h2>
    <p>
      The architecture features a <strong>1-Click Regional Preset Engine</strong> that dynamically reconfigures currency codes, symbol displays, decimal precision, social security tiers, and statutory rules for all GCC member states:
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th>Country</th>
          <th>Currency</th>
          <th>Precision</th>
          <th>Social Insurance Agency</th>
          <th>Statutory Gratuity Rule</th>
          <th>Standard Workweek</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><strong>Kingdom of Bahrain 🇧🇭</strong></td><td>BHD (BD)</td><td><strong>3 Decimals (0.000)</strong></td><td>GOSI Bahrain (7% / 12% Cit., 1% / 3% Exp.)</td><td>15 days (Y1-3), 30 days (Y4+)</td><td>Sun – Thu (Fri/Sat Off)</td></tr>
        <tr><td><strong>Kingdom of Saudi Arabia 🇸🇦</strong></td><td>SAR (SR)</td><td>2 Decimals (0.00)</td><td>GOSI KSA (9.75% / 11.75% Saudi)</td><td>15 days (Y1-5), 30 days (Y6+)</td><td>Sun – Thu (Fri/Sat Off)</td></tr>
        <tr><td><strong>United Arab Emirates 🇦🇪</strong></td><td>AED (Dhs)</td><td>2 Decimals (0.00)</td><td>GPSSA UAE (5% / 12.5% Emirati)</td><td>21 days (Y1-5), 30 days (Y6+)</td><td>Mon – Fri (Sat/Sun Off)</td></tr>
        <tr><td><strong>State of Kuwait 🇰🇼</strong></td><td>KWD (KD)</td><td><strong>3 Decimals (0.000)</strong></td><td>PIFSS Kuwait (10.5% / 11.5% Kuwaiti)</td><td>15 days (Y1-5), 30 days (Y6+)</td><td>Sun – Thu (Fri/Sat Off)</td></tr>
        <tr><td><strong>State of Qatar 🇶🇦</strong></td><td>QAR (QR)</td><td>2 Decimals (0.00)</td><td>GRSIA Qatar (5% / 10% Qatari)</td><td>21 days per year of service</td><td>Sun – Thu (Fri/Sat Off)</td></tr>
        <tr><td><strong>Sultanate of Oman 🇴🇲</strong></td><td>OMR (RO)</td><td><strong>3 Decimals (0.000)</strong></td><td>PASI / SPF Oman (7% / 11.5% Omani)</td><td>15 days (Y1-3), 30 days (Y4+)</td><td>Sun – Thu (Fri/Sat Off)</td></tr>
      </tbody>
    </table>

    <h2 class="subsection-title">1.4 Currency, Precision &amp; Regional Timezone Standards</h2>
    <p>
      In Bahrain, Kuwait, and Oman, currencies are denominated in 1,000 fils/baisa units requiring exact 3-decimal precision (e.g., <code>BD 1,250.750</code>). The system guarantees zero rounding discrepancies across basic salaries, variable allowances, hourly overtime fractions, loan EMI deductions, and net payouts. System timestamps and attendance clocks strictly utilize <code>Asia/Bahrain</code> (GMT+3) timezone synchronization.
    </p>
  </div>
  {render_footer(3)}
</div>
"""
pages.append(page_3)

# ==============================================================================
# PAGE 4: SECTION 02 — SYSTEM ARCHITECTURE & TECHNICAL SPECIFICATIONS
# ==============================================================================
page_4 = f"""
<div class="page">
  {render_header("02", "System Architecture & Technical Specifications")}
  <div class="body">
    <h1 class="section-title"><span class="sec-num">02</span> System Architecture &amp; Technical Stack</h1>

    <h2 class="subsection-title">2.1 Pure Core PHP MVC Architecture (Zero-Bloat Foundation)</h2>
    <p>
      Unlike conventional bloated enterprise suites that bundle thousands of unnecessary vendor dependencies and suffer from slow execution, this system is engineered with a custom, ultra-lightweight <strong>Pure MVC Core PHP</strong> backend:
    </p>
    <ul class="doc-list">
      <li><strong>Zero Heavy Framework Dependencies:</strong> Built with native PHP 8.x eliminating bulky vendor folders, security vulnerabilities in unvetted third-party packages, and memory overhead.</li>
      <li><strong>Sub-50ms Response Latency:</strong> Clean, compiled routing table and direct PDO singleton connection ensure lightning-fast API responses even under concurrent multi-user load.</li>
      <li><strong>Stateless RESTful JSON Design:</strong> Clean separation between backend services and client interfaces. Every endpoint operates as a pure REST API supporting <code>Authorization: Bearer &lt;token&gt;</code> headers.</li>
    </ul>

    <h2 class="subsection-title">2.2 React 19 + Vite Modern Frontend</h2>
    <p>
      The user experience is delivered through a high-performance Single Page Application (SPA) built with <strong>React 19</strong> and bundled via <strong>Vite</strong>:
    </p>
    <ul class="doc-list">
      <li><strong>Executive Gulf Theme:</strong> Premium corporate aesthetic featuring an Indigo &amp; Slate background with vibrant Blue &amp; Pink accenting, glassmorphic cards, and high-readability typography.</li>
      <li><strong>Horizontal Top Navigation:</strong> Optimized for wide executive desktop displays and workstations, keeping all 10 core modules accessible in a single top bar.</li>
      <li><strong>Native Laser Print Engines:</strong> Embedded CSS print drivers specifically formatted for A5 Laser Payslips and 1-31 Landscape Attendance Matrix sheets without third-party PDF pop-ups.</li>
    </ul>

    <h2 class="subsection-title">2.3 Relational Database Schema (18 Normalized MySQL Tables)</h2>
    <div class="grid-2">
      <div class="info-card blue">
        <div class="card-title">Core Workforce Tables</div>
        <table style="width: 100%; font-size: 7.5pt;">
          <tr><td><code>users</code></td><td>Admin, HR, and ESS login credentials with Bcrypt hashes.</td></tr>
          <tr><td><code>departments</code></td><td>Department master records with division mapping.</td></tr>
          <tr><td><code>designations</code></td><td>Job titles and hierarchy classifications.</td></tr>
          <tr><td><code>employees</code></td><td>Comprehensive 360° master employee records (CPR, passport, etc.).</td></tr>
          <tr><td><code>employee_documents</code></td><td>Attachment vault for digital copies with expiry dates.</td></tr>
          <tr><td><code>settings</code></td><td>Regional parameters, GOSI rates, overtime multipliers.</td></tr>
        </table>
      </div>
      <div class="info-card pink">
        <div class="card-title">Attendance, Shift &amp; Payroll Tables</div>
        <table style="width: 100%; font-size: 7.5pt;">
          <tr><td><code>shifts</code> &amp; <code>shift_roster</code></td><td>Shift definitions, start/end times, and rotational calendar.</td></tr>
          <tr><td><code>employee_shift_assignments</code></td><td>Default and employee-specific shift mappings.</td></tr>
          <tr><td><code>attendance</code></td><td>Daily punch registers, biometric CSV logs, overtime hours.</td></tr>
          <tr><td><code>payroll_periods</code> &amp; <code>payslips</code></td><td>Monthly payroll cycles, processing dates, itemized payslips.</td></tr>
          <tr><td><code>loans</code> &amp; <code>loan_repayments</code></td><td>Active loans, EMI schedules, repayment ledgers.</td></tr>
          <tr><td><code>leave_types</code> &amp; <code>leave_applications</code></td><td>Leave entitlements, balances, and multi-tier approval logs.</td></tr>
          <tr><td><code>indemnity_calculations</code></td><td>Statutory EOSB gratuity computations and settlement certs.</td></tr>
          <tr><td><code>holidays</code></td><td>Gazetted national and official public holiday calendar.</td></tr>
        </table>
      </div>
    </div>

    <h2 class="subsection-title">2.4 Phase 2 Native Mobile Application Readiness</h2>
    <p>
      Because all backend endpoints adhere strictly to stateless RESTful JSON conventions with token-based authentication, the system is architected for immediate Phase 2 plug-and-play connectivity with <strong>React Native (iOS &amp; Android)</strong> mobile applications for Employee Self-Service (ESS), mobile check-in, leave submissions, and digital payslip viewing without requiring any backend modifications.
    </p>
  </div>
  {render_footer(4)}
</div>
"""
pages.append(page_4)

# ==============================================================================
# PAGE 5: SECTION 03 — ROLE-BASED ACCESS CONTROL (RBAC) & SECURITY
# ==============================================================================
page_5 = f"""
<div class="page">
  {render_header("03", "Role-Based Access Control & Security")}
  <div class="body">
    <h1 class="section-title"><span class="sec-num">03</span> Role-Based Access Control &amp; User Permissions</h1>

    <h2 class="subsection-title">3.1 Role Hierarchy &amp; Segregation of Duties</h2>
    <p>
      Security governance enforces strict Segregation of Duties (SoD) through three standardized corporate access roles:
    </p>

    <div class="grid-3">
      <div class="info-card blue">
        <div class="card-title"><span class="badge badge-blue">Admin</span> System Administrator</div>
        <div class="card-text">
          Full administrative sovereignty. Manages organization-wide settings, GCC country presets, GOSI rates, overtime multipliers, user accounts, role delegations, and database maintenance.
        </div>
      </div>
      <div class="info-card pink">
        <div class="card-title"><span class="badge badge-pink">HR Admin</span> HR Operations Admin</div>
        <div class="card-text">
          Day-to-day HR operational authority. Manages employee onboarding, CPR smart card reading, document vault, shift scheduling, biometric attendance imports, payroll processing, and approvals.
        </div>
      </div>
      <div class="info-card emerald">
        <div class="card-title"><span class="badge badge-emerald">ESS</span> Employee Self-Service</div>
        <div class="card-text">
          Personal portal for individual staff members. View personal profile, submit leave requests, view loan EMI schedules, download monthly A5 payslips, and monitor document expiry countdowns.
        </div>
      </div>
    </div>

    <h2 class="subsection-title">3.2 Granular Permissions Matrix Across Core Modules</h2>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 25%;">System Module</th>
          <th style="width: 25%;">System Administrator</th>
          <th style="width: 25%;">HR Operations Admin</th>
          <th style="width: 25%;">Employee Self-Service</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><strong>Executive Dashboard</strong></td><td>Full GCC Radar, Financials &amp; KPIs</td><td>Workforce Metrics &amp; Expiry Radar</td><td>Personal Attendance &amp; Leave Balances</td></tr>
        <tr><td><strong>Employee Management</strong></td><td>Full CRUD + Salary Setup</td><td>Full CRUD + Smart Card Reader</td><td>Read-Only Personal Profile</td></tr>
        <tr><td><strong>Document Expiry Vault</strong></td><td>View, Upload, Delete Any Document</td><td>View, Upload, Delete Any Document</td><td>View &amp; Upload Personal Docs</td></tr>
        <tr><td><strong>Smart Card CPR Bridge</strong></td><td>Full Access (Port 5050 Bridge)</td><td>Full Access (Port 5050 Bridge)</td><td>No Access</td></tr>
        <tr><td><strong>Shift Master &amp; Rostering</strong></td><td>Create, Edit, Delete Shifts &amp; Roster</td><td>Assign Shifts &amp; Manage Roster</td><td>View Assigned Shift Schedule</td></tr>
        <tr><td><strong>Biometric Attendance</strong></td><td>Import CSV, Edit Logs, Override OT</td><td>Import CSV, Edit Logs, Override OT</td><td>Web Punch (If Enabled) &amp; Log View</td></tr>
        <tr><td><strong>1-31 Matrix Sheet</strong></td><td>View All, Department Filter, Print</td><td>View All, Department Filter, Print</td><td>View Personal Monthly Timesheet</td></tr>
        <tr><td><strong>Payroll Calculation Engine</strong></td><td>Process, Finalize, Recalculate</td><td>Process, Finalize, Print Payslips</td><td>No Access</td></tr>
        <tr><td><strong>A5 Laser Payslips</strong></td><td>Generate, Print All, Sign Off</td><td>Generate, Print All, Sign Off</td><td>View &amp; Print Personal Payslip</td></tr>
        <tr><td><strong>Indemnity &amp; EOSB Engine</strong></td><td>Calculate, Override, Final Settlement</td><td>Calculate &amp; Print Settlement Cert.</td><td>View Estimated Accrued Gratuity</td></tr>
        <tr><td><strong>Leaves &amp; Vacations</strong></td><td>Approve, Reject, Adjust Balances</td><td>Approve, Reject, Review Calendar</td><td>Submit Request, View Balance</td></tr>
        <tr><td><strong>Loans &amp; Advances</strong></td><td>Disburse, Modify, Write-Off</td><td>Disburse &amp; Track EMI Deductions</td><td>Apply &amp; View Repayment Schedule</td></tr>
        <tr><td><strong>Regional Settings</strong></td><td>Full Access (Switch GCC Presets)</td><td>Read-Only View</td><td>No Access</td></tr>
      </tbody>
    </table>

    <h2 class="subsection-title">3.3 Authentication &amp; Session Security Standards</h2>
    <p>
      Passwords are encrypted using <strong>Bcrypt (PHP <code>password_hash</code> with cost factor 12)</strong>. All API communications require a signed Bearer Token transmitted in the HTTP Authorization header. Cross-Origin Resource Sharing (CORS) is strictly regulated, SQL injection is completely prevented through parameterized PDO prepared statements, and all HTML inputs are scrubbed against Cross-Site Scripting (XSS).
    </p>
  </div>
  {render_footer(5)}
</div>
"""
pages.append(page_5)

# ==============================================================================
# PAGE 6: SECTION 04 — EXECUTIVE DASHBOARD & GCC KPI RADAR
# ==============================================================================
page_6 = f"""
<div class="page">
  {render_header("04", "Executive Dashboard & GCC KPI Radar")}
  <div class="body">
    <h1 class="section-title"><span class="sec-num">04</span> Executive Dashboard &amp; GCC KPI Radar</h1>

    <h2 class="subsection-title">4.1 Operational Overview &amp; Flight Deck Architecture</h2>
    <p>
      The Dashboard serves as the central flight deck for executive management and HR leaders, providing real-time operational visibility across workforce attendance, payroll liability, and statutory compliance deadlines:
    </p>

    <div class="grid-4">
      <div class="info-card blue">
        <div class="card-title">Total Headcount</div>
        <div style="font-size: 13pt; font-weight: 800; color: #1e40af; margin: 4px 0;">Active Roster</div>
        <div class="card-text">Real-time count of active employees vs on-leave and probationary staff.</div>
      </div>
      <div class="info-card pink">
        <div class="card-title">Document Expiry Radar</div>
        <div style="font-size: 13pt; font-weight: 800; color: #db2777; margin: 4px 0;">30 / 60 / 90 Days</div>
        <div class="card-text">Automated alerts for CPR, Passport, and Visa documents nearing expiry.</div>
      </div>
      <div class="info-card emerald">
        <div class="card-title">Monthly Payroll Summary</div>
        <div style="font-size: 13pt; font-weight: 800; color: #059669; margin: 4px 0;">BHD Payout</div>
        <div class="card-text">Live aggregation of gross salaries, GOSI contributions, and net disbursements.</div>
      </div>
      <div class="info-card amber">
        <div class="card-title">Live Digital Clock</div>
        <div style="font-size: 13pt; font-weight: 800; color: #d97706; margin: 4px 0;">Asia/Bahrain</div>
        <div class="card-text">GMT+3 synchronized digital clock with daily present/absent counters.</div>
      </div>
    </div>

    <h2 class="subsection-title">4.2 Document Expiry Radar Engine</h2>
    <p>
      The document radar scans all employee identification credentials, passports, residence permits, and certifications, grouping them into intuitive priority buckets:
    </p>
    <div class="grid-3">
      <div class="info-card pink">
        <div class="card-title"><span class="badge badge-pink">Critical: &lt; 30 Days</span></div>
        <div class="card-text">Immediate action required. Prominently flagged to prevent LMRA expatriate work permit fines or immigration visa overstay penalties.</div>
      </div>
      <div class="info-card amber">
        <div class="card-title"><span class="badge badge-amber">Warning: 30 – 60 Days</span></div>
        <div class="card-text">Proactive preparation window. HR officers can initiate embassy passport renewal applications or medical insurance policy endorsements.</div>
      </div>
      <div class="info-card emerald">
        <div class="card-title"><span class="badge badge-emerald">Safe: &gt; 60 Days</span></div>
        <div class="card-text">Compliant status. Displays remaining countdown days ensuring long-term audit readiness for corporate governance.</div>
      </div>
    </div>

    <h2 class="subsection-title">4.3 Financial Quick-View &amp; Operational Launchers</h2>
    <div class="grid-2">
      <div class="info-card blue">
        <div class="card-title">Monthly Payroll Financial Snapshot</div>
        <p style="font-size: 7.5pt; color: #475569; margin-bottom: 6px;">
          Aggregates monthly disbursement figures directly from the payroll calculation engine:
        </p>
        <ul class="doc-list" style="margin-left: 12px;">
          <li><strong>Gross Salary Commitment:</strong> Total contractual basic + allowances.</li>
          <li><strong>GOSI Employer Liability:</strong> 12% citizen / 3% expat employer share.</li>
          <li><strong>Net Payout Obligation:</strong> Cash/WPS transfer total for banking clearance.</li>
        </ul>
      </div>
      <div class="info-card emerald">
        <div class="card-title">One-Click Operational Quick Launchers</div>
        <p style="font-size: 7.5pt; color: #475569; margin-bottom: 6px;">
          Direct execution shortcuts for high-frequency HR administration tasks:
        </p>
        <ul class="doc-list" style="margin-left: 12px;">
          <li><strong>Onboard New Employee:</strong> Opens CPR reader &amp; master profile modal.</li>
          <li><strong>Upload Biometric CSV:</strong> Direct link to punch log ingestion tool.</li>
          <li><strong>Generate Monthly Payroll:</strong> One-click pay period calculation engine.</li>
          <li><strong>Calculate EOSB Indemnity:</strong> Instant Article 116 final settlement wizard.</li>
        </ul>
      </div>
    </div>
  </div>
  {render_footer(6)}
</div>
"""
pages.append(page_6)

# ==============================================================================
# PAGE 7: SECTION 05 — EMPLOYEE LIFECYCLE & DOCUMENT VAULT
# ==============================================================================
page_7 = f"""
<div class="page">
  {render_header("05", "Employee Lifecycle & Document Vault")}
  <div class="body">
    <h1 class="section-title"><span class="sec-num">05</span> Employee Lifecycle &amp; Document Expiry Vault</h1>

    <h2 class="subsection-title">5.1 360° Comprehensive Employee Master Record</h2>
    <p>
      The employee profile captures all regulatory and organizational attributes required under Bahrain and GCC employment laws:
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 25%;">Category</th>
          <th style="width: 75%;">Captured Data Attributes &amp; Specifications</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Personal &amp; Identity</strong></td>
          <td>Employee Code, CPR / National ID, CPR Expiry Date, Passport Number, Passport Expiry, Visa / Residence Permit Number, Visa Expiry, Driving License Number, Driving License Expiry, Full Name (English &amp; Arabic), Date of Birth, Gender, Blood Group, Marital Status, Religion, Nationality.</td>
        </tr>
        <tr>
          <td><strong>Employment &amp; Organization</strong></td>
          <td>Department, Designation, Date of Joining, Employment Type (Permanent, Contract, Probation), Work Location, Reporting Manager, GOSI Social Insurance Registration Number, LMRA Work Permit Number.</td>
        </tr>
        <tr>
          <td><strong>Bahrain Salary Package</strong></td>
          <td>Basic Salary + Housing Allowance (HR) + Transport Allowance + Car Allowance + Mobile Allowance + Food Allowance + Other Fixed Allowances = Gross Monthly Salary.</td>
        </tr>
        <tr>
          <td><strong>Disbursement &amp; Banking</strong></td>
          <td>Payment Mode (WPS Bank Transfer, Cheque, Cash), Bank Name, IBAN (International Bank Account Number), Swift Code.</td>
        </tr>
        <tr>
          <td><strong>Emergency Contacts</strong></td>
          <td>Primary Next of Kin Name, Relationship, Contact Phone Number, Local Bahrain Residential Address.</td>
        </tr>
      </tbody>
    </table>

    <h2 class="subsection-title">5.2 Document Vault &amp; Dynamic Expiry Countdown Badges</h2>
    <p>
      Every employee record includes a dedicated digital document vault supporting high-resolution image and PDF attachments. The system continuously evaluates expiry dates against the current system date and assigns real-time visual badges:
    </p>
    <div class="grid-3">
      <div class="info-card pink">
        <div class="card-title"><span class="badge badge-pink">Critical (&lt; 30 Days)</span></div>
        <div class="card-text">Urgent renewal required immediately. Triggers red alert badge on dashboard to prevent LMRA or immigration fines.</div>
      </div>
      <div class="info-card amber">
        <div class="card-title"><span class="badge badge-amber">Warning (30 – 60 Days)</span></div>
        <div class="card-text">Renewal preparation window. Amber badge allows HR to initiate passport embassy renewals or medical checkups.</div>
      </div>
      <div class="info-card emerald">
        <div class="card-title"><span class="badge badge-emerald">Valid (&gt; 60 Days)</span></div>
        <div class="card-text">Compliant status. Green badge showing exact remaining days countdown until next renewal milestone.</div>
      </div>
    </div>

    <h2 class="subsection-title">5.3 Search, Advanced Filtering &amp; Export Capabilities</h2>
    <p>
      The employee directory includes real-time search across Employee Code, Name, CPR, Passport, Department, and Designation, with instant CSV and Excel export for compliance audits, insurance renewals, and corporate reporting.
    </p>
  </div>
  {render_footer(7)}
</div>
"""
pages.append(page_7)

# ==============================================================================
# PAGE 8: SECTION 06 — BAHRAIN SMART CARD (CPR) HARDWARE BRIDGE
# ==============================================================================
page_8 = f"""
<div class="page">
  {render_header("06", "Bahrain Smart Card (CPR) Hardware Bridge")}
  <div class="body">
    <h1 class="section-title"><span class="sec-num">06</span> Bahrain Smart Card (CPR) Hardware Bridge</h1>

    <h2 class="subsection-title">6.1 SaNDSLabCardBridge Architecture &amp; Technology Stack</h2>
    <p>
      One of the crowning technical innovations of the platform is the native <strong>Bahrain CPR Smart Card Reader Integration</strong>. Built as a specialized .NET bridge application (<code>SaNDSLabCardBridge</code>), it establishes a direct hardware communication pipeline between standard PC/SC smart card readers (e.g., OMNIKEY, Identiv, ACS) and the HR web application:
    </p>

    <div class="grid-2">
      <div class="info-card blue">
        <div class="card-title">Bridge Technical Core</div>
        <ul class="doc-list" style="margin-left: 12px;">
          <li><strong>Runtime:</strong> C# .NET 8 / Framework 4.8 high-speed local daemon.</li>
          <li><strong>PC/SC Driver Layer:</strong> Native <code>pcsc-sharp.dll</code> interfacing with Windows WinSCard subsystem.</li>
          <li><strong>Official IGA/CIO Assemblies:</strong> <code>BH.CIO.Smartcard.Bahrain.dll</code>, <code>BH.CIO.Smartcard.IDCardManager.dll</code>, <code>BH.CIO.Smartcard.Lookup.dll</code>.</li>
          <li><strong>Photo Rendering:</strong> <code>Magick.NET</code> decoding embedded biometric citizen photo byte streams into web-ready Base64 PNG formats.</li>
          <li><strong>Local REST Service:</strong> Embedded HTTP server listening on <code>http://127.0.0.1:5050</code>.</li>
        </ul>
      </div>
      <div class="info-card pink">
        <div class="card-title">Dual CPR Card Generation Compatibility</div>
        <p style="font-size: 7.5pt; color: #475569; margin-bottom: 6px;">
          The Kingdom of Bahrain issued updated smart card designs. SaNDSLabCardBridge dynamically detects the card generation:
        </p>
        <ul class="doc-list" style="margin-left: 12px;">
          <li><strong>2025/2026 New CPR Cards (Back Chip):</strong> Reads modern secure memory structures on the rear of the card.</li>
          <li><strong>Legacy CPR Cards (Front Chip):</strong> Backward compatible with earlier contact chip structures.</li>
        </ul>
      </div>
    </div>

    <h2 class="subsection-title">6.2 Automated One-Click Onboarding Workflow</h2>
    <div class="step-flow">
      <div class="step-item">
        <div class="step-number">1</div>
        <div class="step-content">
          <div class="step-head">Insert Bahrain Smart Card into USB Reader</div>
          <div class="step-desc">The officer inserts the employee's physical CPR card into any connected USB smart card reader. The reader LED indicates active contact.</div>
        </div>
      </div>
      <div class="step-item">
        <div class="step-number">2</div>
        <div class="step-content">
          <div class="step-head">Click "Read Card" in HR Solution Onboarding Modal</div>
          <div class="step-desc">The React frontend sends an asynchronous HTTP GET request to <code>http://127.0.0.1:5050/api/operation/ReadCard</code>.</div>
        </div>
      </div>
      <div class="step-item">
        <div class="step-number">3</div>
        <div class="step-content">
          <div class="step-head">Decryption &amp; Attribute Parsing via SaNDSLabCardBridge</div>
          <div class="step-desc">The bridge queries the card chip, parses BER-TLV elementary files (EF), maps lookup tables, and decompresses the card photograph.</div>
        </div>
      </div>
      <div class="step-item">
        <div class="step-number">4</div>
        <div class="step-content">
          <div class="step-head">Automatic Form Population (15+ Fields Filled in 1.2 Seconds)</div>
          <div class="step-desc">The onboarding form instantly populates CPR Number, Full English Name, Full Arabic Name, Date of Birth, Gender, Nationality, Passport Number, Passport Expiry, Card Expiry, Local Address, and attaches the official digital photo.</div>
        </div>
      </div>
    </div>

    <h2 class="subsection-title">6.3 Bridge Launcher Script &amp; Conflict Resolution</h2>
    <p>
      The launcher script (<code>Start_Bahrain_Card_Bridge.bat</code>) automatically stops conflicting legacy services (<code>SCardReadServer</code>), configures Windows URL ACL permissions on Port 5050, and starts the bridge with diagnostics.
    </p>
  </div>
  {render_footer(8)}
</div>
"""
pages.append(page_8)

# ==============================================================================
# PAGE 9: SECTION 07 — SHIFT MANAGEMENT & MULTI-SHIFT ROSTERING
# ==============================================================================
page_9 = f"""
<div class="page">
  {render_header("07", "Shift Management & Multi-Shift Rostering")}
  <div class="body">
    <h1 class="section-title"><span class="sec-num">07</span> Shift Management &amp; Multi-Shift Rostering</h1>

    <h2 class="subsection-title">7.1 Shift Master Configuration Parameters</h2>
    <p>
      Enterprises operate diverse operational shifts across corporate, retail, security, and industrial divisions. The Shift Master module allows administrators to define custom shift rules:
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th>Shift Code</th>
          <th>Shift Name</th>
          <th>Timing Range</th>
          <th>Standard Hrs</th>
          <th>Grace Period</th>
          <th>Night OT Premium</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><code>MS01</code></td><td>Morning / General Shift</td><td>08:00 AM – 04:00 PM</td><td>8.00 Hours</td><td>15 mins in / 15 mins out</td><td>No (Standard Rate 1.25x)</td></tr>
        <tr><td><code>ES02</code></td><td>Evening Shift</td><td>04:00 PM – 12:00 AM</td><td>8.00 Hours</td><td>15 mins in / 15 mins out</td><td>Partial (After 19:00 -> 1.50x)</td></tr>
        <tr><td><code>NS03</code></td><td>Night Shift (Overnight)</td><td>12:00 AM – 08:00 AM</td><td>8.00 Hours</td><td>15 mins in / 15 mins out</td><td><strong>Yes (Full 1.50x Night Rate)</strong></td></tr>
        <tr><td><code>SS04</code></td><td>Split Shift</td><td>09:00–13:00 &amp; 17:00–21:00</td><td>8.00 Hours</td><td>10 mins in / 10 mins out</td><td>Partial (Evening segment)</td></tr>
        <tr><td><code>FL05</code></td><td>Flexible / Custom Shift</td><td>Configurable Start/End</td><td>Variable</td><td>Configurable</td><td>Based on worked hours</td></tr>
      </tbody>
    </table>

    <h2 class="subsection-title">7.2 Shift Rostering &amp; Rest Day Scheduling</h2>
    <p>
      Shifts can be assigned through a multi-tier hierarchy:
    </p>
    <div class="grid-2">
      <div class="info-card blue">
        <div class="card-title">Shift Assignment Hierarchy</div>
        <ul class="doc-list" style="margin-left: 12px;">
          <li><strong>Department Default Shift:</strong> Default operational shift applied to all employees in a department (e.g. Administration -> Morning Shift).</li>
          <li><strong>Employee Default Shift:</strong> Overrides department default for specific staff (e.g. Night Security Guard -> Night Shift).</li>
          <li><strong>Roster Override:</strong> Day-specific assignments from the monthly shift calendar overriding default rules.</li>
        </ul>
      </div>
      <div class="info-card emerald">
        <div class="card-title">Rest Day &amp; Off-Day Detection</div>
        <p style="font-size: 7.5pt; color: #475569; margin-bottom: 6px;">
          The monthly roster allows managers to assign scheduled rest days (<code>is_off_day = 1</code>):
        </p>
        <ul class="doc-list" style="margin-left: 12px;">
          <li>When an employee punches in on an assigned off-day, work is automatically flagged as <strong>Rest Day Work</strong>.</li>
          <li>Automatically applies <strong>1.50x Weekend/Rest Day Overtime Multiplier</strong> under Bahrain Labor Law.</li>
        </ul>
      </div>
    </div>

    <h2 class="subsection-title">7.3 Night Shift Differential Accounting (Article 54)</h2>
    <p>
      Bahrain Labor Law mandates enhanced compensation for nighttime work. When a shift is designated with <code>is_night_shift = 1</code>, or when hours fall between 19:00 (7:00 PM) and 07:00 (7:00 AM), the overtime calculation engine automatically calculates the 1.50x night premium differential.
    </p>
  </div>
  {render_footer(9)}
</div>
"""
pages.append(page_9)

# ==============================================================================
# PAGE 10: SECTION 08 — BIOMETRIC ATTENDANCE & OVERTIME ENGINE
# ==============================================================================
page_10 = f"""
<div class="page">
  {render_header("08", "Biometric Attendance & Overtime Engine")}
  <div class="body">
    <h1 class="section-title"><span class="sec-num">08</span> Biometric Attendance &amp; Overtime Engine</h1>

    <h2 class="subsection-title">8.1 Multi-Channel Attendance Ingestion</h2>
    <p>
      Workforce attendance is captured through three flexible operational channels:
    </p>
    <ul class="doc-list">
      <li><strong>Universal Biometric CSV / Excel Punch Importer:</strong> Ingest punch logs exported from ZKTeco, Suprema, Hikvision, or Anviz biometric devices via drag-and-drop CSV or copy-paste text parser (<code>EmpCode, Date, CheckIn, CheckOut, Status, OvertimeHours</code>).</li>
      <li><strong>Live Web Check-In / Punch Register:</strong> Real-time digital clock marking daily check-in and check-out with automatic late-in tolerance tracking.</li>
      <li><strong>Manual Attendance Register:</strong> Supervisor override grid for duty exemptions, outdoor duty, or off-site project work.</li>
    </ul>

    <h2 class="subsection-title">8.2 Bahrain Statutory Overtime Engine (Law No. 36/2012, Article 54)</h2>
    <p>
      The overtime engine automatically evaluates daily attendance logs against the employee's assigned shift and statutory thresholds:
    </p>

    <div class="formula-box">
      <div class="formula-title">STATUTORY HOURLY WAGE FORMULA (BAHRAIN LABOR LAW)</div>
      Hourly Wage = (Basic Salary + Fixed Allowances) / (30 Days * 8.0 Standard Hours)
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Overtime Classification</th>
          <th>Statutory Rate</th>
          <th>Trigger Condition</th>
          <th>Accounting Application</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Normal Working Day Overtime</strong></td>
          <td><strong>1.25x (125%)</strong></td>
          <td>Work hours exceeding 8.0 standard shift hours on normal business days.</td>
          <td><code>OT Pay = Excess Hours * Hourly Wage * 1.25</code></td>
        </tr>
        <tr>
          <td><strong>Night Overtime Premium</strong></td>
          <td><strong>1.50x (150%)</strong></td>
          <td>Hours worked during nighttime between 19:00 (7:00 PM) and 07:00 (7:00 AM).</td>
          <td><code>Night OT Pay = Night Hours * Hourly Wage * 1.50</code></td>
        </tr>
        <tr>
          <td><strong>Weekend / Rest Day Overtime</strong></td>
          <td><strong>1.50x (150%)</strong></td>
          <td>Any work performed on scheduled weekly rest days (Friday / Saturday / Off Day).</td>
          <td><code>Rest Day Pay = Worked Hours * Hourly Wage * 1.50</code></td>
        </tr>
        <tr>
          <td><strong>Official Public Holiday Overtime</strong></td>
          <td><strong>2.00x (200%)</strong></td>
          <td>Work performed on gazetted Bahrain national/religious holidays.</td>
          <td><code>Holiday Pay = Worked Hours * Hourly Wage * 2.00</code></td>
        </tr>
      </tbody>
    </table>

    <h2 class="subsection-title">8.3 Grace Periods &amp; Half-Day Automation</h2>
    <p>
      Configurable late grace tolerance (e.g. 15 minutes) prevents penalizing employees for minor traffic delays. If worked hours fall between 4.0 and 7.0 hours, the day is automatically classified as <strong>Half Day (HD)</strong>, ensuring fair wage adjustments.
    </p>
  </div>
  {render_footer(10)}
</div>
"""
pages.append(page_10)

# ==============================================================================
# PAGE 11: SECTION 09 — 1-31 LANDSCAPE ATTENDANCE MATRIX SHEET
# ==============================================================================
page_11 = f"""
<div class="page">
  {render_header("09", "1-31 Landscape Attendance Matrix Sheet")}
  <div class="body">
    <h1 class="section-title"><span class="sec-num">09</span> 1-31 Landscape Monthly Attendance Matrix</h1>

    <h2 class="subsection-title">9.1 Landscape Calendar Grid (Days 1 to 31) Visualization</h2>
    <p>
      For executive audit compliance, Ministry of Labour inspection, and payroll validation, the application features an official <strong>1-31 Landscape Monthly Attendance Matrix Sheet Generator</strong>. This module compiles the entire workforce or specific departments into a panoramic monthly calendar view:
    </p>

    <div class="grid-2">
      <div class="info-card blue">
        <div class="card-title">Daily Attendance Status Legend</div>
        <table style="width: 100%; font-size: 7.5pt;">
          <tr><td><span class="badge badge-emerald">P</span></td><td><strong>Present:</strong> Full day attendance completed within shift hours.</td></tr>
          <tr><td><span class="badge badge-pink">A</span></td><td><strong>Absent:</strong> Unexcused absence. Triggers automatic salary deduction.</td></tr>
          <tr><td><span class="badge badge-amber">HD</span></td><td><strong>Half Day:</strong> Attendance between 4.0 and 7.0 hours.</td></tr>
          <tr><td><span class="badge badge-blue">L</span></td><td><strong>Approved Leave:</strong> Annual, Sick, Casual, or Maternity leave.</td></tr>
          <tr><td><span class="badge badge-slate">OFF</span></td><td><strong>Rest Day / Off:</strong> Weekly scheduled rest day (Friday/Saturday).</td></tr>
          <tr><td><span class="badge badge-blue">H</span></td><td><strong>Public Holiday:</strong> Gazetted Bahrain national holiday.</td></tr>
        </table>
      </div>
      <div class="info-card emerald">
        <div class="card-title">Audit Aggregation Columns</div>
        <p style="font-size: 7.5pt; color: #475569; margin-bottom: 6px;">
          Each employee row concludes with four automated reconciliation totals:
        </p>
        <ul class="doc-list" style="margin-left: 12px;">
          <li><strong>Total Worked Days:</strong> Count of valid working days credited.</li>
          <li><strong>Total Absent Days:</strong> Deductible unapproved days count.</li>
          <li><strong>Total Late Marks:</strong> Late arrivals beyond grace tolerance.</li>
          <li><strong>Total Overtime Hours:</strong> Exact sum of regular, night, and holiday OT hours feeding into the payroll engine.</li>
        </ul>
      </div>
    </div>

    <h2 class="subsection-title">9.2 Executive Laser Print Engine (A4 Landscape)</h2>
    <p>
      The matrix sheet is paired with a dedicated CSS print engine formatted specifically for <strong>A4 Landscape Laser Printing</strong>:
    </p>
    <ul class="doc-list">
      <li><strong>Compact Grid Typography:</strong> High-density tabular layout ensuring all 31 days and audit summaries fit seamlessly without horizontal clipping.</li>
      <li><strong>Departmental Grouping &amp; Filtering:</strong> Export or print all company personnel at once, or filter specifically by Operations, Administration, Engineering, Logistics, or Sales.</li>
      <li><strong>Formal Verification Signatures:</strong> Each printed matrix includes authorization blocks for <em>HR Supervisor Verification</em> and <em>General Management Approval</em>.</li>
    </ul>

    <h2 class="subsection-title">9.3 Shift Code &amp; Roster Correlation</h2>
    <p>
      The matrix displays the employee's assigned shift code (e.g. <code>MS01</code>, <code>NS03</code>) directly in the employee header row, allowing auditors to immediately verify whether overtime was correctly calculated against standard shift timings.
    </p>
  </div>
  {render_footer(11)}
</div>
"""
pages.append(page_11)

# ==============================================================================
# PAGE 12: SECTION 10 — GULF PAYROLL ENGINE & STATUTORY DEDUCTIONS
# ==============================================================================
page_12 = f"""
<div class="page">
  {render_header("10", "Gulf Payroll Engine & Statutory Deductions")}
  <div class="body">
    <h1 class="section-title"><span class="sec-num">10</span> Gulf Payroll Engine &amp; Statutory Deductions</h1>

    <h2 class="subsection-title">10.1 Batch Payroll Processing Pipeline</h2>
    <p>
      The payroll engine processes monthly disbursements through a secure, high-speed automated pipeline. HR administrators select the target Pay Period (Month and Year), and can calculate payroll for <strong>All Staff</strong>, <strong>By Department</strong>, or for an <strong>Individual Employee</strong> in a single click:
    </p>

    <div class="formula-box">
      <div class="formula-title">CORE NET SALARY CALCULATION FORMULA</div>
      Net Salary = (Basic Salary + Fixed Allowances + OT Earnings + Bonus) - (GOSI Employee Share + Loan EMI + Absent Deductions)
    </div>

    <h2 class="subsection-title">10.2 Social Insurance (GOSI) Statutory Calculations</h2>
    <table class="data-table">
      <thead>
        <tr>
          <th>Workforce Category</th>
          <th>Employee Deduction (%)</th>
          <th>Employer Contribution (%)</th>
          <th>Salary Calculation Base</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Bahraini / GCC Citizens 🇧🇭</strong></td>
          <td><strong>7.00%</strong></td>
          <td><strong>12.00%</strong></td>
          <td>Basic Salary + Housing Allowance (HR)</td>
        </tr>
        <tr>
          <td><strong>Expatriate Workforce 🌍</strong></td>
          <td><strong>1.00%</strong></td>
          <td><strong>3.00%</strong></td>
          <td>Basic Salary Only</td>
        </tr>
      </tbody>
    </table>

    <h2 class="subsection-title">10.3 LMRA Levy, Loan Deductions &amp; Absence Proration</h2>
    <ul class="doc-list">
      <li><strong>LMRA Monthly Expatriate Levy:</strong> Fixed 10.000 BHD monthly employer levy tracked per active expatriate staff member.</li>
      <li><strong>Automated Loan EMI Deductions:</strong> Active employee loans automatically inject monthly installment deductions, updating outstanding loan ledgers.</li>
      <li><strong>Statutory Absence Proration:</strong> <code>Absence Deduction = (Basic Salary / 30 Days) * Absent Days</code>.</li>
      <li><strong>Wage Protection System (WPS) Readiness:</strong> Generates official SIF (Salary Information File) structures compliant with Central Bank of Bahrain (CBB) payroll file formats.</li>
    </ul>

    <h2 class="subsection-title">10.4 Recalculation &amp; Pay Period Finalization</h2>
    <p>
      Draft payroll runs can be recalculated multiple times to account for retroactive overtime adjustments or approved leaves before final approval and payslip generation.
    </p>
  </div>
  {render_footer(12)}
</div>
"""
pages.append(page_12)

# ==============================================================================
# PAGE 13: SECTION 11 — OFFICIAL A5 LASER PAYSLIP GENERATION
# ==============================================================================
page_13 = f"""
<div class="page">
  {render_header("11", "Official A5 Laser Payslip Generation")}
  <div class="body">
    <h1 class="section-title"><span class="sec-num">11</span> Official A5 Laser Payslip Generation</h1>

    <h2 class="subsection-title">11.1 Industry Standard A5 Laser &amp; Thermal Formatting</h2>
    <p>
      In Bahrain and the GCC, the standard medium for confidential salary disbursement is the <strong>A5 Landscape / Portrait Laser Slip</strong>. The system includes an executive laser-optimized payslip generator designed to print two complete payslips per A4 sheet or output directly to dedicated A5 laser/thermal printers:
    </p>

    <div class="grid-2">
      <div class="info-card blue">
        <div class="card-title">Dual-Column Financial Breakdown</div>
        <p style="font-size: 7.5pt; color: #475569; margin-bottom: 6px;">
          Clean separation between contractual earnings and statutory deductions:
        </p>
        <ul class="doc-list" style="margin-left: 12px;">
          <li><strong>Earnings Column:</strong> Basic Salary, Housing Allowance, Transport, Car, Mobile, Food, Overtime Pay, Bonus, Incentives.</li>
          <li><strong>Deductions Column:</strong> Employee GOSI (7% / 1%), Active Loan EMI, Unpaid Absence Deductions.</li>
          <li><strong>Net Payout:</strong> Clear display in figures (BD 1,250.000) and full alphabetical word representation.</li>
        </ul>
      </div>
      <div class="info-card emerald">
        <div class="card-title">Dual Authorization Signature Blocks</div>
        <p style="font-size: 7.5pt; color: #475569; margin-bottom: 6px;">
          Each generated payslip features two official acknowledgment boxes:
        </p>
        <ul class="doc-list" style="margin-left: 12px;">
          <li><strong>Prepared &amp; Verified By:</strong> HR &amp; Accounts Officer seal and authorization signature.</li>
          <li><strong>Employee Acknowledgment:</strong> Formal signature line confirming receipt of net salary without dispute.</li>
          <li><strong>WPS Compliant:</strong> Includes Bank Name and IBAN for seamless Wage Protection System auditing.</li>
        </ul>
      </div>
    </div>

    <h2 class="subsection-title">11.2 Single-Click Bulk Printing &amp; Employee Self-Service Delivery</h2>
    <p>
      Administrators can batch print all payslips for an entire department or company with a single click. Simultaneously, individual payslips are instantly published to the <strong>Employee Self-Service (ESS)</strong> portal, where staff members can view and download encrypted PDF copies securely.
    </p>

    <h2 class="subsection-title">11.3 Security &amp; Anti-Tampering Features</h2>
    <p>
      Each payslip contains a cryptographic transaction hash, document generation timestamp, and unique payslip ID matching the internal database record, preventing salary certificate forgery.
    </p>
  </div>
  {render_footer(13)}
</div>
"""
pages.append(page_13)

# ==============================================================================
# PAGE 14: SECTION 12 — INDEMNITY (EOSB) & LEAVE ENCASHMENT
# ==============================================================================
page_14 = f"""
<div class="page">
  {render_header("12", "Indemnity (EOSB) & Final Settlement Engine")}
  <div class="body">
    <h1 class="section-title"><span class="sec-num">12</span> Indemnity (EOSB) &amp; Final Settlement Engine</h1>

    <h2 class="subsection-title">12.1 Statutory Bahrain Gratuity Formula (Law No. 36/2012, Article 116)</h2>
    <p>
      When an employee concludes their service, the system calculates End of Service Benefits (Indemnity) based on exact continuous service duration:
    </p>

    <div class="grid-2">
      <div class="info-card blue">
        <div class="card-title">Tier 1: First 3 Years of Service</div>
        <div class="card-text">
          <strong>15 Days Basic Salary</strong> for each year of continuous service during the first 3 years.<br>
          <code>Yearly Rate = Basic Salary * (15 / 30) = 0.5 * Basic Salary</code>
        </div>
      </div>
      <div class="info-card pink">
        <div class="card-title">Tier 2: Beyond 3 Years of Service</div>
        <div class="card-text">
          <strong>30 Days (1 Full Month) Basic Salary</strong> for each subsequent year of service.<br>
          <code>Yearly Rate = Basic Salary * (30 / 30) = 1.0 * Basic Salary</code>
        </div>
      </div>
    </div>

    <div class="formula-box">
      <div class="formula-title">PRO-RATA FRACTIONAL SERVICE INDEMNITY FORMULA</div>
      Total Indemnity = (Min(Years, 3.0) * 0.5 * Basic) + (Max(0, Years - 3.0) * 1.0 * Basic) + Pro-Rata Days Calculation
    </div>

    <h2 class="subsection-title">12.2 Resignation vs Termination Multipliers &amp; Leave Encashment</h2>
    <ul class="doc-list">
      <li><strong>Termination by Employer / Non-Renewal:</strong> 100% full statutory indemnity entitlement.</li>
      <li><strong>Voluntary Resignation:</strong> Scaled according to Article 116 service brackets (&lt; 3 yrs = 0%, 3-5 yrs = partial, &gt; 5 yrs = 100%).</li>
      <li><strong>Unused Annual Leave Encashment:</strong> <code>Leave Salary = (Basic Salary / 30 Days) * Unused Annual Leave Days</code>.</li>
      <li><strong>Final Settlement Certificate:</strong> Official legal clearance statement consolidating Indemnity, Leave Salary, Notice Pay, Loan balances, and Net Final Settlement with full employee discharge waiver.</li>
    </ul>

    <h2 class="subsection-title">12.3 Legal Discharge &amp; Ministry of Labour Compliance</h2>
    <p>
      The generated Final Settlement Certificate contains standard bilingual legal release clauses confirming the employee has received all statutory dues and releases the employer from further civil or labor claims.
    </p>
  </div>
  {render_footer(14)}
</div>
"""
pages.append(page_14)

# ==============================================================================
# PAGE 15: SECTION 13 — LEAVES & VACATION MANAGEMENT
# ==============================================================================
page_15 = f"""
<div class="page">
  {render_header("13", "Leaves & Vacation Management")}
  <div class="body">
    <h1 class="section-title"><span class="sec-num">13</span> Leaves &amp; Vacation Lifecycle Management</h1>

    <h2 class="subsection-title">13.1 GCC Statutory Leave Types &amp; Policies</h2>
    <p>
      The leave management engine administers statutory leave entitlements with multi-tier approval workflows:
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th>Leave Category</th>
          <th>Statutory Allocation</th>
          <th>Remuneration Policy</th>
          <th>Labor Law Reference</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><strong>Annual Leave</strong></td><td><strong>30 Calendar Days / Year</strong></td><td>Full Pay (Accrues at 2.5 days per month)</td><td>Article 58 (Law 36/2012)</td></tr>
        <tr><td><strong>Sick Leave</strong></td><td><strong>55 Days Total</strong> (Tiered)</td><td>15 Days Full Pay • 20 Days Half Pay • 20 Days Unpaid</td><td>Article 65 (Law 36/2012)</td></tr>
        <tr><td><strong>Maternity Leave</strong></td><td><strong>60 Calendar Days</strong></td><td>Full Pay for female employees</td><td>Article 32 (Law 36/2012)</td></tr>
        <tr><td><strong>Hajj Pilgrimage Leave</strong></td><td><strong>14 Calendar Days</strong></td><td>Full Pay (Once during entire employment tenure)</td><td>Article 67 (Law 36/2012)</td></tr>
        <tr><td><strong>Compassionate / Casual</strong></td><td><strong>3 Days</strong></td><td>Full Pay (Marriage, Bereavement)</td><td>Article 63 (Law 36/2012)</td></tr>
        <tr><td><strong>Unpaid Leave (LWP)</strong></td><td>As approved by Employer</td><td>Zero Pay (Deducts from monthly payroll)</td><td>Mutual Agreement</td></tr>
      </tbody>
    </table>

    <h2 class="subsection-title">13.2 Multi-Stage Approval Lifecycle</h2>
    <div class="grid-2">
      <div class="info-card blue">
        <div class="card-title">Approval Stages</div>
        <ul class="doc-list" style="margin-left: 12px;">
          <li><strong>Step 1: Submission:</strong> Employee requests leave via portal with dates, reason, handover notes, and replacement contact.</li>
          <li><strong>Step 2: Department Review:</strong> Line manager reviews coverage and operational requirements.</li>
          <li><strong>Step 3: HR Final Approval:</strong> HR verifies balance and formally approves, updating attendance registers.</li>
        </ul>
      </div>
      <div class="info-card emerald">
        <div class="card-title">Automatic Payroll Integration</div>
        <p style="font-size: 7.5pt; color: #475569; margin-bottom: 6px;">
          Approved leaves directly interface with the monthly payroll engine:
        </p>
        <ul class="doc-list" style="margin-left: 12px;">
          <li>Paid leaves are credited as valid worked days.</li>
          <li>Unpaid leaves (LWP) automatically trigger proration salary deductions.</li>
          <li>Tiered sick leaves past day 15 trigger 50% basic salary deductions.</li>
        </ul>
      </div>
    </div>
  </div>
  {render_footer(15)}
</div>
"""
pages.append(page_15)

# ==============================================================================
# PAGE 16: SECTION 14 — EMPLOYEE LOANS & EMI SCHEDULES
# ==============================================================================
page_16 = f"""
<div class="page">
  {render_header("14", "Loans, Advances & EMI Schedules")}
  <div class="body">
    <h1 class="section-title"><span class="sec-num">14</span> Employee Loans, Advances &amp; EMI Schedules</h1>

    <h2 class="subsection-title">14.1 Loan Origination &amp; EMI Scheduling</h2>
    <p>
      To assist workforce welfare while maintaining disciplined corporate accounting, HR administrators can record employee emergency loans, vehicle loans, and salary advances:
    </p>

    <div class="grid-2">
      <div class="info-card blue">
        <div class="card-title">Loan Origination Parameters</div>
        <ul class="doc-list" style="margin-left: 12px;">
          <li><strong>Principal Amount:</strong> Disbursed loan sum in local currency (e.g. BD 600.000).</li>
          <li><strong>Tenure (Months):</strong> Repayment window (e.g. 6, 12, 24 months).</li>
          <li><strong>Start Period:</strong> Month and year when first EMI deduction begins.</li>
          <li><strong>Reason / Category:</strong> Emergency medical, education, family travel, housing advance.</li>
        </ul>
      </div>
      <div class="info-card emerald">
        <div class="card-title">Automated Monthly EMI Calculation</div>
        <div class="formula-box" style="margin: 4px 0 8px 0; padding: 6px 10px;">
          <div class="formula-title">EQUATED MONTHLY INSTALLMENT</div>
          Monthly EMI = Principal Amount / Tenure Months
        </div>
        <p style="font-size: 7.5pt; color: #475569;">
          Fractional decimals are handled cleanly to ensure zero rounding slippage across the repayment lifespan.
        </p>
      </div>
    </div>

    <h2 class="subsection-title">14.2 Integrated Payroll Deduction &amp; Balance Depletion</h2>
    <p>
      During each monthly payroll batch run, the payroll engine automatically queries active loans:
    </p>
    <ul class="doc-list">
      <li>The monthly EMI is deducted directly from gross earnings as a statutory/voluntary deduction.</li>
      <li>The deduction is logged into <code>loan_repayments</code> with the pay period reference.</li>
      <li>The outstanding loan balance decreases in real-time. Once the balance reaches 0.000, the loan automatically flips to <strong>Fully Paid</strong>.</li>
    </ul>

    <h2 class="subsection-title">14.3 Early Settlement &amp; Exit Deductions</h2>
    <p>
      Employees can make lump-sum early repayments. In the event of contract termination or resignation, any remaining loan balance is automatically pulled into the <strong>Final Settlement Engine</strong> to offset against accrued EOSB Indemnity before net payout.
    </p>
  </div>
  {render_footer(16)}
</div>
"""
pages.append(page_16)

# ==============================================================================
# PAGE 17: SECTION 15 — REGIONAL SETTINGS & ORGANIZATIONAL MASTERS
# ==============================================================================
page_17 = f"""
<div class="page">
  {render_header("15", "Regional Settings & Organizational Masters")}
  <div class="body">
    <h1 class="section-title"><span class="sec-num">15</span> Regional Settings &amp; Organizational Masters</h1>

    <h2 class="subsection-title">15.1 One-Click GCC Regional Presets</h2>
    <p>
      The Settings module empowers administrators to customize corporate governance rules across the GCC:
    </p>

    <div class="grid-3">
      <div class="info-card blue">
        <div class="card-title">1-Click Country Switcher</div>
        <div class="card-text">
          Instantly switches regional rules between Bahrain (Default), Saudi Arabia, UAE, Kuwait, Qatar, and Oman. Automatically re-maps currency symbols and GOSI tiers.
        </div>
      </div>
      <div class="info-card pink">
        <div class="card-title">Currency &amp; Decimals</div>
        <div class="card-text">
          Precision configuration for 3 decimals (BHD, KWD, OMR) vs 2 decimals (SAR, AED, QAR). Enforces exact accounting standards across all ledger tables.
        </div>
      </div>
      <div class="info-card emerald">
        <div class="card-title">Timezone &amp; Calendar</div>
        <div class="card-text">
          Synchronized to <code>Asia/Bahrain</code> (GMT+3). Sets default workweek schedule (Sunday–Thursday vs Monday–Friday) and standard daily hours.
        </div>
      </div>
    </div>

    <h2 class="subsection-title">15.2 Organizational Masters (Departments &amp; Designations)</h2>
    <div class="grid-2">
      <div class="info-card blue">
        <div class="card-title">Departments Master</div>
        <p style="font-size: 7.5pt; color: #475569; margin-bottom: 6px;">
          Manage corporate operational divisions (Operations, Administration, Human Resources, Engineering, Sales, Logistics):
        </p>
        <ul class="doc-list" style="margin-left: 12px;">
          <li>Assign default department shift codes.</li>
          <li>Track active headcount tallies per department.</li>
          <li>Filter attendance sheets and payroll runs department-wise.</li>
        </ul>
      </div>
      <div class="info-card pink">
        <div class="card-title">Designations Master</div>
        <p style="font-size: 7.5pt; color: #475569; margin-bottom: 6px;">
          Maintain official job descriptions, classifications, and executive ranks:
        </p>
        <ul class="doc-list" style="margin-left: 12px;">
          <li>Executive Management, Project Managers, Engineers, Officers, Technicians.</li>
          <li>Correlates with Bahrain LMRA occupation classification codes.</li>
        </ul>
      </div>
    </div>

    <h2 class="subsection-title">15.3 Gazetted Public Holidays Calendar</h2>
    <p>
      Administrators maintain the annual schedule of official gazetted holidays (National Day, Eid Al Fitr, Eid Al Adha, Hijri New Year, Ashoora, Labor Day). Any attendance punches logged on these dates automatically trigger the statutory <strong>2.00x Public Holiday Overtime Multiplier</strong>.
    </p>
  </div>
  {render_footer(17)}
</div>
"""
pages.append(page_17)

# ==============================================================================
# PAGE 18: SECTION 16 — END-TO-END OPERATIONAL WORKFLOW MAPS
# ==============================================================================
page_18 = f"""
<div class="page">
  {render_header("16", "End-to-End Operational Workflow Maps")}
  <div class="body">
    <h1 class="section-title"><span class="sec-num">16</span> End-to-End Operational Workflow Maps</h1>

    <div class="grid-2">
      <div class="info-card blue">
        <div class="card-title">Workflow 1: Smart Card Onboarding</div>
        <div class="step-flow" style="margin: 4px 0;">
          <div class="step-item">
            <div class="step-number" style="width: 18px; height: 18px; font-size: 7pt;">1</div>
            <div class="step-content">
              <div class="step-head" style="font-size: 7.5pt;">Insert CPR into USB Reader</div>
              <div class="step-desc" style="font-size: 7pt;">Connect PC/SC reader; insert card.</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number" style="width: 18px; height: 18px; font-size: 7pt;">2</div>
            <div class="step-content">
              <div class="step-head" style="font-size: 7.5pt;">One-Click Chip Ingestion</div>
              <div class="step-desc" style="font-size: 7pt;">Click "Read Card" (Port 5050 Bridge). Auto-populates 15+ fields &amp; photo.</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number" style="width: 18px; height: 18px; font-size: 7pt;">3</div>
            <div class="step-content">
              <div class="step-head" style="font-size: 7.5pt;">Salary &amp; Shift Assignment</div>
              <div class="step-desc" style="font-size: 7pt;">Set basic + allowances, assign shift, upload contracts to vault.</div>
            </div>
          </div>
        </div>
      </div>

      <div class="info-card emerald">
        <div class="card-title">Workflow 2: Monthly Attendance &amp; OT</div>
        <div class="step-flow" style="margin: 4px 0;">
          <div class="step-item">
            <div class="step-number" style="width: 18px; height: 18px; font-size: 7pt;">1</div>
            <div class="step-content">
              <div class="step-head" style="font-size: 7.5pt;">Ingest Biometric CSV Logs</div>
              <div class="step-desc" style="font-size: 7pt;">Upload monthly biometric device punch exports.</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number" style="width: 18px; height: 18px; font-size: 7pt;">2</div>
            <div class="step-content">
              <div class="step-head" style="font-size: 7.5pt;">Evaluate Shifts &amp; Overtime</div>
              <div class="step-desc" style="font-size: 7pt;">Compute normal 1.25x, night 1.50x, weekend 1.50x, holiday 2.00x.</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number" style="width: 18px; height: 18px; font-size: 7pt;">3</div>
            <div class="step-content">
              <div class="step-head" style="font-size: 7.5pt;">1-31 Matrix Sheet Audit</div>
              <div class="step-desc" style="font-size: 7pt;">Print landscape matrix for departmental manager verification.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid-2" style="margin-top: 10px;">
      <div class="info-card pink">
        <div class="card-title">Workflow 3: Monthly Payroll &amp; Payout</div>
        <div class="step-flow" style="margin: 4px 0;">
          <div class="step-item">
            <div class="step-number" style="width: 18px; height: 18px; font-size: 7pt;">1</div>
            <div class="step-content">
              <div class="step-head" style="font-size: 7.5pt;">Select Pay Period &amp; Calculate</div>
              <div class="step-desc" style="font-size: 7pt;">Pulls basic, allowances, OT pay, GOSI, loan EMIs, absence deductions.</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number" style="width: 18px; height: 18px; font-size: 7pt;">2</div>
            <div class="step-content">
              <div class="step-head" style="font-size: 7.5pt;">Review &amp; Finalize Payroll Run</div>
              <div class="step-desc" style="font-size: 7pt;">Verify total bank commitment and GOSI/LMRA employer liabilities.</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number" style="width: 18px; height: 18px; font-size: 7pt;">3</div>
            <div class="step-content">
              <div class="step-head" style="font-size: 7.5pt;">Print Official A5 Laser Payslips</div>
              <div class="step-desc" style="font-size: 7pt;">Batch output payslips with dual authorization signatures.</div>
            </div>
          </div>
        </div>
      </div>

      <div class="info-card amber">
        <div class="card-title">Workflow 4: Exit &amp; Indemnity Settlement</div>
        <div class="step-flow" style="margin: 4px 0;">
          <div class="step-item">
            <div class="step-number" style="width: 18px; height: 18px; font-size: 7pt;">1</div>
            <div class="step-content">
              <div class="step-head" style="font-size: 7.5pt;">Select Employee &amp; Exit Reason</div>
              <div class="step-desc" style="font-size: 7pt;">Termination vs Resignation (Article 116 tenure brackets).</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number" style="width: 18px; height: 18px; font-size: 7pt;">2</div>
            <div class="step-content">
              <div class="step-head" style="font-size: 7.5pt;">Auto-Compute EOSB &amp; Leave Salary</div>
              <div class="step-desc" style="font-size: 7pt;">15d Y1-3 + 30d Y4+ pro-rata + unused annual leave encashment.</div>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number" style="width: 18px; height: 18px; font-size: 7pt;">3</div>
            <div class="step-content">
              <div class="step-head" style="font-size: 7.5pt;">Generate Final Settlement Certificate</div>
              <div class="step-desc" style="font-size: 7pt;">Legal discharge &amp; waiver document for LMRA/Ministry clearance.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  {render_footer(18)}
</div>
"""
pages.append(page_18)

# ==============================================================================
# PAGE 19: SECTION 17 — SOLUTION CREDENTIALS & VENDOR PROFILES
# ==============================================================================
page_19 = f"""
<div class="page">
  {render_header("17", "Consultant & Technology Credentials")}
  <div class="body">
    <h1 class="section-title"><span class="sec-num">17</span> Solution Credentials &amp; Vendor Profiles</h1>

    <!-- UNIGLOBAL CONSULTANCY -->
    <div class="vendor-box">
      <div class="vendor-header">
        <div>
          <div style="font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; font-weight: 700;">PREPARED BY:</div>
          <h3 style="font-size: 13pt; font-weight: 800; color: #0f172a; margin: 2px 0 0 0;">Uniglobal Consultancy</h3>
          <div style="font-size: 8pt; color: #2563eb; font-weight: 600;">Strategic Management, Human Resources Advisory &amp; Regional Corporate Implementation</div>
        </div>
        <img class="vendor-logo-lg" src="data:image/png;base64,{uniglobal_final_b64}" alt="Uniglobal Consultancy" />
      </div>
      <p style="font-size: 8pt; color: #475569; line-height: 1.45; margin-bottom: 8px;">
        <strong>Uniglobal Consultancy</strong> is a premier management consulting and human resource advisory firm delivering strategic business transformations, regulatory compliance frameworks, and organizational excellence across the GCC region. Uniglobal specializes in aligning corporate workforce governance with Bahrain Labor Law, LMRA mandates, and GOSI statutory requirements, ensuring operational efficiency and risk mitigation.
      </p>
      <div class="grid-3" style="margin-top: 4px;">
        <div class="info-card blue" style="padding: 6px 10px;">
          <div class="card-title" style="font-size: 7.5pt;">HR Process Engineering</div>
          <div class="card-text" style="font-size: 7pt;">Designing compliant organizational structures, job descriptions, and salary benchmarks.</div>
        </div>
        <div class="info-card pink" style="padding: 6px 10px;">
          <div class="card-title" style="font-size: 7.5pt;">Labor Law Compliance</div>
          <div class="card-text" style="font-size: 7pt;">Auditing indemnity liabilities, contracts, and employment practices under Law 36/2012.</div>
        </div>
        <div class="info-card emerald" style="padding: 6px 10px;">
          <div class="card-title" style="font-size: 7.5pt;">Enterprise Rollout</div>
          <div class="card-text" style="font-size: 7pt;">End-to-end change management, data migration, and workforce onboarding execution.</div>
        </div>
      </div>
    </div>

    <!-- SANDS LAB MIDDLE EAST W.L.L. -->
    <div class="vendor-box" style="margin-top: 14px;">
      <div class="vendor-header">
        <div>
          <div style="font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.8px; color: #db2777; font-weight: 700;">POWERED BY:</div>
          <h3 style="font-size: 13pt; font-weight: 800; color: #0f172a; margin: 2px 0 0 0;">SaNDS Lab Middle East W.L.L.</h3>
          <div style="font-size: 8pt; color: #db2777; font-weight: 600;">Enterprise Software Architecture, Gulf Labor Law Systems, Digital Biometrics &amp; Cloud Automation</div>
        </div>
        <div style="background: #ffffff; padding: 4px 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <img class="vendor-logo-lg" src="data:image/png;base64,{sandslab_logo_b64}" alt="SaNDS Lab Middle East W.L.L." />
        </div>
      </div>
      <p style="font-size: 8pt; color: #475569; line-height: 1.45; margin-bottom: 8px;">
        <strong>SaNDS Lab Middle East W.L.L.</strong> is an advanced engineering and enterprise software development firm headquartered in the Kingdom of Bahrain. SaNDS Lab pioneers high-performance cloud architectures, custom ERP solutions, statutory payroll engines, and proprietary hardware bridge drivers connecting web applications directly with national identification cards and biometric terminals.
      </p>

      <div class="grid-2" style="margin-top: 4px;">
        <div class="info-card blue" style="padding: 6px 10px;">
          <div class="card-title" style="font-size: 7.5pt;">Corporate Headquarters &amp; Operations</div>
          <table style="width: 100%; font-size: 7pt; margin-top: 2px;">
            <tr><td style="color: #64748b; width: 30%;">Location:</td><td><strong>Salmabad, Kingdom of Bahrain</strong></td></tr>
            <tr><td style="color: #64748b;">Official Portal:</td><td><a href="https://www.sandslab.com" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 600;">www.sandslab.com ↗</a></td></tr>
            <tr><td style="color: #64748b;">Product Suite:</td><td><a href="https://sandslab.com/products/" target="_blank" style="color: #db2777; text-decoration: none; font-weight: 600;">sandslab.com/products/ ↗</a></td></tr>
          </table>
        </div>
        <div class="info-card pink" style="padding: 6px 10px;">
          <div class="card-title" style="font-size: 7.5pt;">Direct Technical Support &amp; Assistance</div>
          <table style="width: 100%; font-size: 7pt; margin-top: 2px;">
            <tr><td style="color: #64748b; width: 30%;">WhatsApp:</td><td><strong>+97335078079</strong> (Live Instant Support)</td></tr>
            <tr><td style="color: #64748b;">Email:</td><td><a href="mailto:info@sandslab.com" style="color: #2563eb; text-decoration: none; font-weight: 600;">info@sandslab.com</a></td></tr>
            <tr><td style="color: #64748b;">Core Domain:</td><td>Digital Biometrics, PC/SC Card Bridges &amp; Cloud ERP</td></tr>
          </table>
        </div>
      </div>
    </div>

    <div class="info-card blue" style="margin-top: 10px; text-align: center; padding: 6px 10px;">
      <div style="font-size: 7.5pt; font-weight: 700; color: #0f172a; margin-bottom: 2px;">Official Release &amp; Document Authorization</div>
      <div style="font-size: 6.5pt; color: #64748b; line-height: 1.3;">
        This specification document represents the verified functional architecture of the Gulf Enterprise HR &amp; Payroll Solution. All features, calculation formulas, and workflows are certified compliant with the laws of the Kingdom of Bahrain.<br>
        © 2026 Uniglobal Consultancy &amp; SaNDS Lab Middle East W.L.L. All Rights Reserved.
      </div>
    </div>
  </div>
  {render_footer(19)}
</div>
"""
pages.append(page_19)

# Master CSS and HTML wrapper
master_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Gulf Enterprise HR & Payroll Solution — Functionality & Workflow Document</title>
<style>
  @page {{
    size: A4 portrait;
    margin: 10mm 12mm 10mm 12mm;
  }}
  @page:first {{
    margin: 0;
  }}
  * {{
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }}
  body {{
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #1e293b;
    background: #ffffff;
    font-size: 8.5pt;
    line-height: 1.45;
  }}

  /* Page Break & Container Constraints */
  .page {{
    page-break-after: always;
    break-after: page;
    height: 275mm;
    max-height: 275mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
  }}
  .body {{
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }}

  /* Running Header & Footer for Content Pages */
  .doc-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 5px;
    margin-bottom: 10px;
    border-bottom: 1.5px solid #cbd5e1;
    font-size: 7.5pt;
    color: #64748b;
  }}
  .doc-header-logo {{
    height: 20px;
    object-fit: contain;
  }}
  .doc-footer {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 5px;
    margin-top: 10px;
    border-top: 1px solid #cbd5e1;
    font-size: 7.5pt;
    color: #64748b;
  }}

  /* COVER PAGE (DARK LUXURY THEME) */
  .cover-container {{
    width: 100vw;
    height: 100vh;
    background: radial-gradient(circle at 80% 20%, #1e1b4b 0%, #0f172a 60%, #090d16 100%);
    color: #ffffff;
    padding: 45px 50px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    page-break-after: always;
    break-after: page;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
  }}
  .cover-accent-circle {{
    position: absolute;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(219, 39, 119, 0.15) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%);
    top: -100px;
    right: -100px;
    pointer-events: none;
  }}
  .cover-top-bar {{
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    padding-bottom: 18px;
  }}
  .cover-uniglobal-logo {{
    max-height: 48px;
    object-fit: contain;
  }}
  .cover-badge {{
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 6px 14px;
    border-radius: 9999px;
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #93c5fd;
  }}
  .cover-hero {{
    margin: 25px 0;
  }}
  .cover-pill {{
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(219, 39, 119, 0.3));
    border: 1px solid rgba(255, 255, 255, 0.25);
    padding: 5px 14px;
    border-radius: 20px;
    font-size: 8pt;
    font-weight: 700;
    color: #fbcfe8;
    margin-bottom: 16px;
  }}
  .cover-title {{
    font-size: 26pt;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.6px;
    margin: 0 0 10px 0;
    background: linear-gradient(135deg, #ffffff 30%, #bfdbfe 70%, #f472b6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }}
  .cover-subtitle {{
    font-size: 12pt;
    font-weight: 400;
    color: #cbd5e1;
    max-width: 620px;
    line-height: 1.45;
    margin: 0 0 20px 0;
  }}
  .cover-features-grid {{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 18px;
  }}
  .cover-feature-card {{
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    padding: 10px 12px;
  }}
  .cover-feature-title {{
    font-size: 8pt;
    font-weight: 700;
    color: #60a5fa;
    margin-bottom: 3px;
  }}
  .cover-feature-desc {{
    font-size: 7pt;
    color: #94a3b8;
    line-height: 1.35;
  }}

  .cover-meta-box {{
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    padding: 14px 18px;
    margin-top: 20px;
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr;
    gap: 14px;
    align-items: center;
  }}
  .meta-col-title {{
    font-size: 6.5pt;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #94a3b8;
    margin-bottom: 2px;
  }}
  .meta-col-val {{
    font-size: 8.5pt;
    font-weight: 700;
    color: #ffffff;
  }}
  .meta-col-sub {{
    font-size: 7pt;
    color: #cbd5e1;
  }}

  .cover-footer {{
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    padding-top: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }}
  .sandslab-box {{
    display: flex;
    align-items: center;
    gap: 12px;
  }}
  .sandslab-cover-logo {{
    height: 28px;
    background: #ffffff;
    padding: 3px 8px;
    border-radius: 6px;
    object-fit: contain;
  }}
  .sandslab-text-block {{
    font-size: 7pt;
    color: #cbd5e1;
    line-height: 1.3;
  }}
  .sandslab-text-bold {{
    font-size: 8pt;
    font-weight: 700;
    color: #ffffff;
  }}

  /* HEADINGS */
  h1.section-title {{
    font-size: 14.5pt;
    font-weight: 800;
    color: #0f172a;
    border-bottom: 2px solid #2563eb;
    padding-bottom: 4px;
    margin: 0 0 10px 0;
    display: flex;
    align-items: center;
    letter-spacing: -0.3px;
  }}
  h1.section-title span.sec-num {{
    background: #2563eb;
    color: #ffffff;
    font-size: 9pt;
    padding: 2px 7px;
    border-radius: 5px;
    margin-right: 8px;
  }}
  h2.subsection-title {{
    font-size: 10.5pt;
    font-weight: 700;
    color: #1e3a8a;
    margin: 10px 0 6px 0;
    padding-left: 6px;
    border-left: 3px solid #ec4899;
  }}
  p {{
    margin: 0 0 6px 0;
    color: #334155;
    text-align: justify;
    font-size: 8pt;
    line-height: 1.42;
  }}

  /* TABLES */
  table.data-table {{
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0 8px 0;
    font-size: 7.5pt;
    background: #ffffff;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #cbd5e1;
  }}
  table.data-table th {{
    background: #0f172a;
    color: #ffffff;
    text-align: left;
    padding: 5px 8px;
    font-weight: 700;
    letter-spacing: 0.3px;
    font-size: 7.5pt;
  }}
  table.data-table td {{
    padding: 4.5px 8px;
    border-bottom: 1px solid #e2e8f0;
    color: #334155;
    vertical-align: top;
  }}
  table.data-table tr:nth-child(even) td {{
    background: #f8fafc;
  }}
  table.data-table tr:last-child td {{
    border-bottom: none;
  }}

  /* CARDS & GRIDS */
  .grid-2 {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin: 6px 0;
  }}
  .grid-3 {{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin: 6px 0;
  }}
  .grid-4 {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 7px;
    margin: 6px 0;
  }}
  .info-card {{
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 8px 10px;
  }}
  .info-card.blue {{
    border-left: 3px solid #2563eb;
    background: #eff6ff;
  }}
  .info-card.pink {{
    border-left: 3px solid #ec4899;
    background: #fdf2f8;
  }}
  .info-card.emerald {{
    border-left: 3px solid #059669;
    background: #ecfdf5;
  }}
  .info-card.amber {{
    border-left: 3px solid #d97706;
    background: #fffbeb;
  }}
  .card-title {{
    font-size: 8pt;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    gap: 5px;
  }}
  .card-text {{
    font-size: 7.5pt;
    color: #475569;
    line-height: 1.35;
  }}

  /* BADGES */
  .badge {{
    display: inline-block;
    padding: 1.5px 5px;
    border-radius: 4px;
    font-size: 6.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }}
  .badge-blue {{ background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }}
  .badge-pink {{ background: #fce7f3; color: #9d174d; border: 1px solid #fbcfe8; }}
  .badge-emerald {{ background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }}
  .badge-amber {{ background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }}
  .badge-slate {{ background: #e2e8f0; color: #334155; border: 1px solid #cbd5e1; }}

  /* FORMULA BOXES */
  .formula-box {{
    background: #0f172a;
    color: #ffffff;
    border-radius: 6px;
    padding: 8px 12px;
    margin: 6px 0;
    font-family: "Courier New", Courier, monospace;
    font-size: 8pt;
    border-left: 3.5px solid #10b981;
  }}
  .formula-title {{
    color: #6ee7b7;
    font-weight: 700;
    font-size: 7.5pt;
    margin-bottom: 3px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }}

  /* WORKFLOW STEPS */
  .step-flow {{
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 6px 0;
  }}
  .step-item {{
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 6px 10px;
  }}
  .step-number {{
    background: #2563eb;
    color: #ffffff;
    font-weight: 800;
    font-size: 8pt;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }}
  .step-content {{
    flex: 1;
  }}
  .step-head {{
    font-size: 8pt;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 2px;
  }}
  .step-desc {{
    font-size: 7pt;
    color: #475569;
    line-height: 1.35;
  }}

  /* VENDOR PROFILES */
  .vendor-box {{
    border: 1.5px solid #cbd5e1;
    border-radius: 8px;
    padding: 12px 14px;
    margin: 8px 0;
    background: #ffffff;
  }}
  .vendor-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 8px;
    margin-bottom: 8px;
  }}
  .vendor-logo-lg {{
    max-height: 36px;
    object-fit: contain;
  }}

  ul.doc-list {{
    margin: 3px 0 6px 16px;
    padding: 0;
    font-size: 7.5pt;
    color: #334155;
  }}
  ul.doc-list li {{
    margin-bottom: 3px;
    line-height: 1.35;
  }}
</style>
</head>
<body>
  {"".join(pages)}
</body>
</html>
"""

output_html = r"e:\hrsolution\GULF_HR_PAYROLL_SOLUTION_FUNCTIONALITY_DOCUMENT.html"
output_pdf = r"e:\hrsolution\GULF_HR_PAYROLL_SOLUTION_FUNCTIONALITY_DOCUMENT.pdf"

print("Writing HTML document...")
with open(output_html, "w", encoding="utf-8") as f:
    f.write(master_html)
print(f"HTML written ({len(master_html)} bytes).")

print("Generating PDF via Chrome Headless...")
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
cmd = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--run-all-compositor-stages-before-draw",
    "--no-pdf-header-footer",
    f"--print-to-pdf={output_pdf}",
    output_html
]

res = subprocess.run(cmd, capture_output=True, text=True)
print("Chrome return code:", res.returncode)

if os.path.exists(output_pdf):
    size = os.path.getsize(output_pdf)
    print(f"PDF Size: {size} bytes ({size/1024:.2f} KB)")
    reader = pypdf.PdfReader(output_pdf)
    print(f"SUCCESS: Exact Page Count = {len(reader.pages)}")
else:
    print("Error: PDF not found!")
    sys.exit(1)
