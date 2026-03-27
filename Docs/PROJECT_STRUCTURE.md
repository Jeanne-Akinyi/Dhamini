
1. Executive Summary

Dhamini is a consent-based automated loan repayment and credit intelligence middleware platform built for the Kenyan and broader East African financial market. It connects every type of financial institution — commercial banks, SACCOs, chamas, microfinance institutions, and digital lenders — into a single, unified repayment and credit scoring infrastructure.

The platform solves three interconnected problems simultaneously:
    • Lenders spend 15–30% of operational budgets chasing repayments manually, with default rates of 20–35%
    • Borrowers pay punitive interest rates (up to 360% APR) because lenders price in default risk they cannot measure
    • No unified credit identity exists across institutions — a borrower with perfect SACCO history is unknown to a bank

Dhamini introduces four core pillars that did not exist together in a single platform before:
    • Consent-based automated deduction — via M-Pesa, bank APIs, and SACCO/chama payroll systems
    • Universal KYC layer — single identity verification that works across all institution types
    • AI-powered credit scoring — built from real repayment behaviour, not just CRB history
    • Blockchain audit trail — immutable mandate and repayment records for regulatory compliance

Target Year 2 metrics: 250,000 active borrowers · 25+ lender integrations · KES 30M+ monthly platform revenue · default rate under 8%.

2. Problem Statement

2.1 The Repayment Problem
Stakeholder	Core Pain Point
Commercial Banks	Manual standing orders fail silently. No real-time deduction visibility. High cost of recovery for salary advance products.
SACCOs	Payroll check-off is manual and month-delayed. Members with multiple loans create allocation errors. Field collection is expensive.
Chamas	No formalised loan tracking. Repayments collected in cash or by M-Pesa without automated reconciliation. Default harms group trust.
Microfinance Institutions	Field officer collection costs 8–15% of loan value. Geographic reach limits growth. Cash handling creates fraud risk.
Digital Lenders	Default rates 20–35%. No deduction authority beyond M-Pesa push reminders. Borrowers ignore or block communications.
Borrowers	Pay 200–360% APR partly because lenders cannot trust repayment. No way to port good repayment history across institutions.


2.2 The Credit Scoring Gap
Kenya has three Credit Reference Bureaus (TransUnion, Metropol, CreditInfo Kenya). All three have the same fundamental problem: they only capture negative events — defaults, blacklistings, and court judgments. Positive repayment behaviour in SACCOs, chamas, and microfinance institutions is almost entirely invisible to the formal credit system.

The result: a borrower who has repaid 5 years of SACCO loans perfectly is treated as a credit ghost by a commercial bank. Dhamini fixes this by building a live credit score from actual repayment behaviour across all institution types.


2.3 The KYC Fragmentation Problem
Every institution in Kenya maintains its own KYC record for each customer. A single borrower may be KYC'd separately at their bank, their SACCO, their chama, and two digital lenders — with different data quality at each. This creates:
    • Duplicated onboarding cost for both borrower and lender
    • Inconsistent identity data that enables fraud across institutions
    • No shared fraud signal — a blacklisted borrower can re-enter through a different institution type
    • Data Protection Act compliance risk from holding redundant personal data

3. Solution Overview

Dhamini operates as a financial infrastructure middleware layer — not a lender, not a bank, not a SACCO. It sits between institutions and provides services that each institution cannot economically build alone.

3.1 The Four Pillars
Pillar	What It Does
1. Consent & Mandate Engine	Borrower signs one legally-binding digital debit mandate at loan origination. That mandate authorises Dhamini to deduct repayments on agreed dates — from bank accounts, M-Pesa wallets, or SACCO payroll.
2. Universal KYC Layer	Single identity verification using IPRS (national ID), KRA PIN, selfie liveness, and bank account ownership check. KYC is done once and shared (with consent) across all connected institutions.
3. AI Credit Scoring Engine	Builds a live Dhamini Credit Score (DCS) from actual repayment behaviour. Draws data from banks, SACCOs, chamas, microfinance, and M-Pesa history. Updated after every repayment event.
4. Blockchain Audit Trail	Every mandate and every repayment event is hashed and logged to a smart contract on Polygon. Immutable. Accessible to regulators, lenders, and borrowers. Cannot be altered after the fact.


3.2 Institution Coverage
Institution Type	Integration Method	Dhamini Services Provided
Commercial Banks (Equity, KCB, Co-op, NCBA, Absa)	REST/SOAP Open Banking APIs + ISO 20022	Direct debit mandates · salary detection · KYC data share · credit score feed
SACCOs (700K+ loan accounts)	SACCO MIS API connectors + payroll file integration	Payroll check-off automation · loan tracking · member credit profiles
Chamas (informal groups)	Mobile app + USSD interface + M-Pesa integration	Formalised loan records · automated M-Pesa collection · group credit scoring
Microfinance Institutions	REST API + mobile field agent app	Field agent digital receipts · automated reconciliation · borrower credit history
Digital Lenders (Tala, Branch, M-Shwari)	Daraja API + direct API partnership	M-Pesa STK Push mandates · B2C payouts · repayment behavioural data
Employer Payroll Systems	Payroll file API (SAGE, QuickBooks connectors)	Salary advance deduction at source · employer-verified income data for scoring

4. System Architecture

Dhamini is a five-layer system. The middleware core and AI engine are the primary intellectual property. All layers communicate over a private API mesh with end-to-end encryption.

LAYER 1 — FRONTEND (Web + Mobile + USSD)
├─  Borrower Portal — loan application, mandate signing, repayment tracker, credit score dashboard
├─  Lender Dashboard — real-time repayment status, analytics, dispute management, credit score API
├─  SACCO / Chama Admin Panel — member loan management, payroll upload, batch reporting
├─  Field Agent Mobile App — offline-capable receipt capture, borrower KYC completion
├─  USSD Interface (*xxx#) — for borrowers without smartphones
├─  Tech: React (Web) · React Native (Mobile) · REST & WebSocket APIs

LAYER 2 — BACKEND API GATEWAY
├─  Auth Service — OAuth2/JWT · MFA · Role-based access (borrower / lender / admin / regulator)
├─  Universal KYC Service — IPRS verification · KRA PIN check · Selfie liveness · Bank account ping
├─  Loan Lifecycle Service — loan registration · schedule calculation · status tracking
├─  Consent Management Service — mandate creation · digital signing · storage · revocation
├─  Notification Service — SMS (Africa's Talking) · Email · Push · USSD callbacks
├─  Tech: Node.js microservices · PostgreSQL + Redis · Docker / Kubernetes

LAYER 3 — MIDDLEWARE CORE (Primary IP)
├─  Mandate Engine — validates and persists debit mandates (ISO 20022 DirectDebit schema, AES-256)
├─  Deduction Scheduler — cron-based · salary-date-aware · timezone-safe · 6-hour deduction window
├─  Bank Adapter Layer — pluggable connectors: Equity · KCB · Co-op · NCBA · Absa · PesaLink
├─  M-Pesa Adapter — Daraja STK Push (C2B) · B2C payouts · Standing Orders
├─  SACCO Adapter — MIS API connectors · payroll file parser (CSV/XML) · batch reconciliation
├─  Chama Adapter — M-Pesa group collection · contribution tracking · loan ledger management
├─  MFI Adapter — field agent sync · offline receipt queue · end-of-day reconciliation
├─  Retry & Reconciliation Engine — NSF handling · 3-tier retry (T+24h, T+48h, T+7d)
├─  Blockchain Logger — Polygon smart contract event emission for every mandate and repayment
├─  Audit & Compliance Engine — immutable logs · CBK reporting · DPA compliance
├─  Tech: Python (FastAPI) · Apache Kafka · TimescaleDB · Redis Queue

LAYER 4 — AI & CREDIT INTELLIGENCE ENGINE
├─  Credit Scoring Model — ML model trained on multi-institution repayment behaviour (XGBoost + neural net)
├─  Salary Detection — balance delta analysis to identify actual salary arrival date
├─  Fraud Detection — anomaly signals: unusual deduction patterns · duplicate mandate attempts · identity mismatch
├─  Risk Stratification — borrower risk tiers (AAA to D) updated in real time after every repayment event
├─  Income Estimation — derives monthly income from M-Pesa flows + bank credits for unbanked borrowers
├─  Chama Group Scoring — group-level credit model incorporating individual member histories
├─  Tech: Python (scikit-learn · XGBoost · PyTorch) · Claude API (NLP) · Pinecone (embeddings)

LAYER 5 — EXTERNAL INTEGRATIONS
├─  Kenyan Commercial Banks — REST/SOAP APIs + ISO 20022 (Equity · KCB · Co-op · NCBA · Absa)
├─  Safaricom Daraja — M-Pesa STK Push · B2C · C2B · Standing Orders
├─  PesaLink / KBA Infrastructure — interbank transfer rails
├─  IPRS — Kenya National ID verification (Ministry of Interior API)
├─  KRA — PIN verification for business borrowers
├─  CRBs — TransUnion · Metropol · CreditInfo Kenya (read + write)
├─  Africa's Talking — SMS / USSD gateway
├─  Polygon Blockchain — smart contract audit trail (testnet → mainnet)
├─  Employer Payroll APIs — SAGE · QuickBooks · custom payroll system connectors

5. Universal KYC System

The Universal KYC layer is one of Dhamini's most strategically important components. A borrower completes KYC once on the Dhamini platform. That verified identity is then shared with any connected institution the borrower chooses to transact with, subject to explicit consent.

5.1 KYC Data Points Collected
Data Point	Source / Verification Method
National ID Number	IPRS API — Ministry of Interior · real-time verification
Full Legal Name	IPRS cross-reference · document OCR
Date of Birth	IPRS cross-reference
Phone Number	OTP verification · Safaricom / Airtel / Telkom carrier check
Selfie / Liveness	AI liveness detection · face match against ID photo
Bank Account Ownership	Micro-deposit verification or bank API account ping
M-Pesa Wallet Ownership	OTP on registered line · Daraja account inquiry
KRA PIN	KRA API — for business borrowers and formal employees
Employer / Income Source	Payroll letter upload · employer API verification
Physical Address	GPS coordinates + manual verification for MFI field agents


5.2 KYC Tiers
Not all borrowers need full KYC. Dhamini uses a tiered approach that matches verification depth to loan size and institution type.

KYC Tier	Requirements	Applicable Loan Range
Tier 1 — Basic	Phone OTP + National ID number	Up to KES 50,000 (chama / digital lender)
Tier 2 — Standard	Tier 1 + Selfie liveness + Bank account ping	KES 50,001 – 500,000 (SACCO / MFI)
Tier 3 — Enhanced	Tier 2 + KRA PIN + Employer verification + Physical address	Above KES 500,000 (commercial bank)
Tier 4 — Business	Tier 3 + Business registration + Directors KYC + Audited accounts	Business loans — all sizes


5.3 KYC Data Sharing Rules
Borrower consent governs all KYC data sharing. The Dhamini consent framework uses granular opt-in:
    • Borrower selects which institutions can access their Dhamini KYC record
    • Each data point can be individually consented — a borrower may share identity but not income data
    • Consent can be revoked at any time; revocation does not affect existing loan mandates
    • All sharing is logged immutably to the blockchain audit trail
    • Full compliance with Kenya Data Protection Act 2019 and GDPR principles

6. Dhamini Credit Score (DCS)

The Dhamini Credit Score is a live, behavioural credit score built from actual repayment events across all connected institution types. It is fundamentally different from existing CRB scores, which are static, negative-event-only, and exclude informal institutions entirely.

6.1 Score Architecture
Score Component	Weight & Data Source
Repayment Consistency	35% — Did borrower repay on time, across all institutions? Penalty for late, partial, or missed payments.
Repayment History Depth	20% — How many years of verifiable repayment history? More institutions = higher confidence.
Credit Utilisation	15% — Ratio of current outstanding debt to total available credit limits. Lower = better.
Income Stability	15% — Regularity and consistency of income inflows (salary, M-Pesa, SACCO dividends). AI-estimated from transaction patterns.
Institution Diversity	10% — Borrower with history across banks, SACCOs, and MFIs = lower risk than single-institution profile.
Fraud & Dispute Record	5% — Any disputed mandates, identity inconsistencies, or cross-institution blacklisting events.


6.2 Score Range & Tiers
DCS Range	Risk Tier	Typical Outcome
800 – 1000	AAA — Exceptional	Maximum loan amounts · lowest interest rates · fast-track approval
700 – 799	AA — Very Good	High loan limits · competitive rates · standard approval
600 – 699	A — Good	Standard loan limits · market-rate interest · normal approval
500 – 599	B — Fair	Moderate limits · slightly elevated rates · additional verification
400 – 499	C — Poor	Limited loan access · high rates · guarantor may be required
300 – 399	D — High Risk	Restricted access · secured lending only · intensive monitoring
Below 300	F — Declined	Platform access suspended · mandatory financial counselling referral


6.3 Data Sources by Institution Type
Institution	Credit Signal Captured
Commercial Banks	Loan repayment history · account balance patterns · salary credit regularity · overdraft usage
SACCOs	Share contribution consistency · loan repayment from payroll · guarantor performance · dividend record
Chamas	Monthly contribution consistency · internal loan repayment · group meeting attendance · leadership roles
Microfinance Institutions	Weekly/monthly repayment · group lending solidarity · loan graduation history
Digital Lenders	M-Pesa repayment behaviour · repeat borrowing patterns · loan size progression
M-Pesa Transaction History	Income regularity · spending patterns · merchant payment behaviour · agent transaction frequency
Employer Payroll Systems	Employment duration · salary consistency · payroll-linked loan deduction history


6.4 Score Update Frequency
The DCS updates in real time. Every repayment event — successful or failed — triggers an immediate score recalculation. Lenders with a live Dhamini integration see the updated score within seconds of each payment event.

Score history is retained permanently on the blockchain, giving borrowers a portable, verifiable credit timeline that survives even if they change banks, SACCOs, or digital lenders.


6.5 CRB Integration
Dhamini integrates bidirectionally with Kenya's three CRBs:
    • Read — pulls existing CRB negative event history as an input to the DCS model
    • Write — submits positive repayment data to CRBs on behalf of connected institutions (where licensed)
    • This creates a feedback loop: good Dhamini repayment behaviour eventually improves formal CRB profiles
    • Negative events are not submitted to CRBs without borrower notification and a 7-day dispute window

7. Blockchain Audit Trail

The blockchain layer provides an immutable, independently verifiable record of every mandate and every repayment event on the Dhamini platform. No party — including Dhamini — can alter or delete records once committed.

7.1 Why Blockchain
    • Trust between institutions — a SACCO accepting a bank borrower needs to trust the repayment history
    • Borrower protection — borrowers can prove their repayment history independently of any lender's records
    • Regulatory compliance — CBK and CMA can run independent audits without relying on platform-generated reports
    • Dispute resolution — any disputed deduction has a timestamped, immutable chain of evidence
    • Smart contract automation — mandates on-chain can trigger automatic deductions without human intervention


7.2 Smart Contract Design
Network: Polygon (PoS) — chosen for low transaction costs (~$0.001 per event) and Ethereum compatibility. Contracts are deployed on Polygon Mumbai testnet during development and Polygon mainnet in production.

Core smart contracts:
    • MandateRegistry.sol — stores mandate hashes, institution IDs, borrower IDs, and mandate status
    • RepaymentLedger.sol — logs every repayment attempt: amount, timestamp, success/failure, institution
    • CreditEventLogger.sol — logs credit score change events with before/after values
    • KYCRegistry.sol — stores KYC completion hashes (not PII — hashes only, PII stays off-chain)


7.3 On-Chain vs Off-Chain Data
Stored ON-Chain (public, immutable)	Stored OFF-Chain (encrypted, private)
Mandate hash (SHA-256 of mandate document)	Full mandate document with PII
Repayment event: amount, timestamp, success/fail	Borrower name, ID number, account details
Institution ID (anonymised)	Lender commercial terms
Credit score change events	Income and salary data
KYC completion hash	Selfie and identity documents
Dispute event flags	Internal risk assessments

8. Payment Rails & M-Pesa Integration

8.1 M-Pesa Daraja API Integration
Daraja API	Dhamini Use Case
STK Push (C2B)	Primary deduction method for borrowers with M-Pesa wallets. Borrower receives push prompt; PIN confirms payment.
B2C (Business to Customer)	Refunds, reversals, and overpayment returns to borrower M-Pesa wallets.
Standing Orders	Recurring mandate-based deductions without per-transaction STK prompts (once borrower consents).
Account Balance Inquiry	Pre-deduction balance check to assess NSF probability before firing deduction.
Transaction Status Query	Async callback reconciliation for delayed confirmation events.
Reversal API	Automated reversal of erroneous or disputed deductions within the allowed window.


8.2 Bank Direct Debit Integration
Dhamini connects to Kenyan commercial banks via their open banking APIs and ISO 20022 direct debit messaging. Each bank has a dedicated adapter within the Bank Adapter Layer:
Bank	Integration Method	Mandate Type Supported
Equity Bank	Equity Developer API (REST)	Salary account debit · loan account debit
KCB Bank	KCB Open API (REST)	Salary advance debit · personal loan debit
Co-operative Bank	Co-op Bank API (REST)	SACCO payroll debit · business loan debit
NCBA Bank	NCBA API (REST)	Salary debit · M-Shwari linkage
Absa Kenya	Absa Open Banking API	Retail and business loan debit
PesaLink (KBA)	ISO 20022 messaging	Interbank mandates between any member banks


8.3 SACCO & Chama Payment Methods
    • SACCO payroll check-off — digital upload of payroll file; deduction at source before salary credit
    • SACCO share account debit — with member consent, deductions from share capital or dividend accounts
    • Chama M-Pesa collection — automated STK Push to each member on contribution due dates
    • Chama treasurer app — mobile app for manual receipt capture with automatic reconciliation
    • Group loan management — pro-rata deduction across group members for solidarity lending

9. Institution-Specific Integration Flows

9.1 Commercial Bank Flow
    • Borrower completes Tier 3 KYC on Dhamini
    • IPRS verification · selfie liveness · bank account ping · KRA PIN · employer confirmation
    • Bank disburses loan; registers loan on Dhamini via API call
    • Loan amount · repayment schedule · account number · agreed deduction date
    • Borrower digitally signs Dhamini mandate (OTP + digital signature)
    • Mandate hash logged to blockchain smart contract
    • On repayment date: AI salary detection fires → bank adapter sends ISO 20022 direct debit → bank processes → confirmation received → loan balance updated → blockchain repayment event logged → credit score updated

9.2 SACCO Flow
    • SACCO registers on Dhamini as an institution; uploads member roster via CSV or MIS API
    • Member completes Tier 2 KYC; links their SACCO membership number
    • SACCO uploads monthly payroll file; Dhamini parses and maps loan deductions per member
    • Deduction instructions sent to employer payroll system or direct bank debit
    • Failed deductions trigger retry via M-Pesa STK Push as fallback
    • Monthly reconciliation report generated and shared with SACCO treasurer
    • Member's SACCO loan history feeds into DCS credit model

9.3 Chama Flow
    • Chama chair registers group on Dhamini mobile app; invites members via phone number
    • Each member completes Tier 1 KYC (phone OTP + National ID)
    • Chair defines contribution schedule and internal loan terms
    • On contribution date: automated M-Pesa STK Push to each member
    • For chama loans: borrower signs Dhamini mandate; repayments collected via M-Pesa
    • Group ledger maintained on platform; chair and members have real-time view
    • Consistent chama contribution history improves member DCS score

9.4 Microfinance Institution Flow
    • MFI field agents use Dhamini field agent mobile app (offline-capable)
    • Borrower KYC completed in field via agent; selfie + ID scan uploaded when connectivity available
    • Loan disbursed via M-Pesa B2C or cash; registered on Dhamini platform by agent
    • Repayment collection: M-Pesa STK Push (preferred) or agent cash receipt (captured digitally)
    • End-of-day sync reconciles all offline agent receipts with central platform
    • Group lending: Dhamini tracks individual repayment within solidarity groups

10. Technical Stack

Layer	Technologies
Frontend Web	React · TypeScript · Next.js · Tailwind CSS
Frontend Mobile	React Native · Expo · Offline-first architecture
USSD Interface	Africa's Talking USSD Gateway · Node.js session manager
Backend API Gateway	Node.js · Express · GraphQL · REST · JWT · OAuth2
Middleware Core	Python · FastAPI · Apache Kafka · Redis Queue
Database (Transactional)	PostgreSQL (primary) · Redis (cache + session)
Database (Time-Series)	TimescaleDB — for repayment event streams and AI training data
AI / ML Engine	Python · scikit-learn · XGBoost · PyTorch · Claude API (NLP)
Blockchain	Solidity smart contracts · Polygon (PoS) · ethers.js
Infrastructure	Docker · Kubernetes · AWS (EKS + RDS + S3) · Nginx
Observability	Prometheus · Grafana · ELK Stack (Elasticsearch, Logstash, Kibana)
Security	AES-256 encryption at rest · TLS 1.3 in transit · HSM for key management
Messaging / Notifications	Africa's Talking (SMS/USSD) · Firebase (Push) · SendGrid (Email)

11. Regulatory & Compliance Framework

Regulation	How Dhamini Complies
Central Bank of Kenya Act (Cap 491)	PSP licence application submitted. Interim operation via licensed payment aggregator partner.
National Payment System Act 2011	All payment instructions conform to CBK NPS guidelines. Audit trails maintained as required.
Digital Credit Providers Regulations 2022	Dhamini operates as middleware, not a lender. Lenders using platform must hold valid CBK DCP licence.
Data Protection Act 2019	Explicit consent for all data collection. Right to erasure honoured (off-chain data only — on-chain hashes cannot be deleted by design). DPA-registered.
Electronic Transactions Act 2007	Digital mandate signatures are legally valid under ETA. OTP + digital signature chain provides enforceability.
Computer Misuse & Cybercrimes Act 2018	Security controls, penetration testing programme, and incident response plan maintained.
AML / CFT Requirements	KYC tiers enforce identity verification. Transaction monitoring flags unusual patterns. Suspicious activity reporting protocol in place.
SACCO Societies Regulatory Authority (SASRA)	SACCO data handling follows SASRA guidelines. SACCO institutions retain primary regulatory relationship.

12. Business Model & Revenue

Revenue Stream	Structure
Per-Transaction Fee	KES 50–120 per successful deduction. Charged to lender institution. Primary revenue driver.
KYC-as-a-Service	KES 150–300 per new borrower KYC completion. One-time per borrower, reusable across institutions.
Credit Score API	KES 50–200 per score query. Lenders query DCS before loan approval decisions.
SaaS Subscription (SACCOs / Chamas)	KES 2,000–15,000/month depending on member count. Full platform access including payroll integration.
Credit Score Report (Borrower)	KES 200 per report. Borrowers can purchase their own detailed DCS report.
Enterprise API Access	Custom pricing. Full API access for digital lenders, fintechs, and financial data aggregators.
Data Analytics (Anonymised)	Aggregate market intelligence reports sold to financial institutions and investors. No PII.


12.1 Year 2 Financial Targets
Metric	Target	Basis
Active Borrowers	250,000	5% of Kenya's 5M active digital borrowers
Institution Integrations	25+	Tier 2 & 3 banks + SACCOs + digital lenders + MFIs
Monthly Transactions	500,000+	2 repayments/borrower average
Platform Revenue (Monthly)	KES 30M+	At KES 60 average per transaction
Default Rate on Platform	< 8%	vs 25–35% market average
DCS Score Queries	200,000+/month	Lenders and borrowers querying score
Chama Groups Onboarded	5,000+	Self-service onboarding via mobile app

13. Security Architecture

    • End-to-end encryption — TLS 1.3 for all data in transit · AES-256 for all data at rest
    • Hardware Security Module (HSM) — private keys for blockchain signing and mandate encryption never touch application memory
    • Role-based access control — borrower / lender / SACCO admin / MFI agent / Dhamini admin / regulator read-only
    • API rate limiting — per-institution, per-endpoint limits prevent abuse and DDoS amplification
    • Mandate tamper detection — mandate document hash verified against blockchain at every deduction
    • Fraud detection AI — real-time anomaly scoring on every deduction attempt before execution
    • Penetration testing — quarterly external pentest programme; responsible disclosure policy
    • SOC 2 Type II audit — planned for Year 1 post-launch
    • Incident response plan — documented runbook for data breach, payment failure, and blockchain compromise scenarios

14. Build Roadmap

Phase	Deliverables	Timeline
Phase 1 — MVP (Hackathon)	M-Pesa STK Push mandate flow · Basic loan schedule · Blockchain event logging · Borrower & lender dashboard · Polygon testnet integration	2–4 weeks
Phase 2 — Bank Integration	Equity + KCB bank adapter · ISO 20022 direct debit · Salary detection AI · Retry engine · Full KYC Tier 1 & 2	2–3 months
Phase 3 — SACCO & Chama	SACCO MIS connectors · Payroll file parser · Chama mobile app · USSD interface · Group credit scoring	2–3 months
Phase 4 — Credit Intelligence	Full DCS model launch · CRB bidirectional integration · Income estimation AI · Credit score API for lenders · Borrower credit dashboard	2–3 months
Phase 5 — MFI & Employer	Field agent mobile app · Offline sync · Employer payroll API connectors · Business KYC Tier 4 · Full audit reporting	3–4 months
Phase 6 — Scale & Compliance	PSP licence finalisation · SOC 2 audit · Enterprise API product · White-label option · East Africa expansion (Uganda, Tanzania)	Ongoing


14.1 Hackathon Demo Scope (Phase 1 MVP)
For the M-Pesa Africa × GOMYCODE Hackathon (Demo Day: 31 March 2025), the demonstration will cover the complete core loop:
    • Borrower completes KYC (phone OTP + ID number)
    • Loan registered on platform by lender
    • Borrower signs digital mandate — hash logged to Polygon testnet
    • Repayment date simulated — M-Pesa Daraja STK Push fired via Safaricom sandbox
    • Callback received — loan balance updated — DCS score updated
    • Repayment event logged to blockchain — transaction hash shown
    • Lender dashboard shows green repayment confirmation

15. Team & Contact

Role	Person / Detail
Founder & Lead Engineer	Samson Roy Nyagwara — Full-Stack & Cloud Security Engineer, Nairobi
Core Skills	Python · Node.js · TypeScript · React Native · FastAPI · PostgreSQL · Docker · AWS · Azure · GCP · Blockchain
Security Background	DevSecOps · Penetration Testing · Cloud Architecture · Vulnerability Assessment
Current Roles	Security Software Engineer @ Milago HR · Software Consultant @ Smart Mavuno
Email	roysamson494@gmail.com
Portfolio	roysamson.vercel.app
GitHub	github.com/RoySamson-stack


DHAMINI — Guaranteed Repayments. Trusted Credit. Connected Institutions.
© 2025 Samson Roy Nyagwara · All Rights Reserved · CONFIDENTIAL