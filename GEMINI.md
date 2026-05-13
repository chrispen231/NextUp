# NextUp Project Architecture & Vision

NextUp is a comprehensive platform designed to elevate Liberian football talent, facilitate discovery, and ensure the safety of athletes through professional recruitment and anti-trafficking measures.

## Core Vision
To act as the primary bridge connecting Liberian football talent with domestic and international opportunities while maintaining the integrity and safety of the ecosystem.

## User Roles & Permissions
1.  **Player:** Uploads video clips, manages digital scouting profile, applies to trials.
2.  **Club Representative:** Scours talent, hosts trials, recruits players.
3.  **Agent (Local/International):** Discovers talent, manages rosters, facilitates career transitions.
4.  **Scout:** Identifies hidden talent, provides professional assessments.
5.  **Admin (LFA/Anti-Trafficking):** Monitors platform integrity, verifies agents, investigates scams.

## Core Application Modules
- **Feed (`/`):** Discovery hub for video clips and highlight reels.
- **LFA Center (`/lfa`):** Portal for league standings, fixtures, and statistics.
- **Inbox (`/inbox`):** Secure messaging between players, agents, scouts, and clubs.
- **Profile (`/profile`):** Role-based digital CV and organization showcase.
- **Upload (`/upload`):** Video clip management and tagging.
- **Trials (`/trials`):** Recruitment management dashboard.
- **Audit/Admin (`/admin`):** Monitoring dashboard for anti-trafficking and verification.
- **WhatsApp Bridge (`/wa-bridge`):** Integration for easy clip sharing.

## Development Mandates
- **Safety First:** All third-party agents and recruitment practices must be verifiable through the Admin/Audit dashboard.
- **Data Efficiency:** Maintain ultra-lightweight media loading for 3G and data-limited environments.
- **Role-Based Access:** Enforce strict permission boundaries as defined in the user roles above.
