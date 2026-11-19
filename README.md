# Knights Power Team Hub

A React + Vite prototype for the Knights Power Team Hub. It includes a dedicated sign-in screen and modules for Dashboard, Members Directory, Friday Updates, Business Network, Member Profile, Power Teams, Member Goals, Opportunities (meeting updates: clients, pipeline and specific asks), Activity Tracker (1-to-1s, thank-you notes, joint calls, specific connects and referrals), Attendance, Minutes of Meeting, Business Generated, Top Clients (Super Admin only), Performance, Reports and Settings. Tracker categories are accessed from Activity Tracker rather than separate sidebar links; relevant entry and detail actions remain available there.

The Excel tracker's sheets map to pages: Member Goals → Goals, Meeting Updates → Opportunities, Specific Connect Tracker → Specific Connects, Power Team Activity → Activity Tracker, Performance Dashboard → Performance, Attendance → Attendance, MOM → Minutes of Meeting.

## Run locally

```bash
npm install
npm run dev
```

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@bni.demo | demo123 |
| Team Head Coordinator | head@bni.demo | demo123 |
| Member | member@bni.demo | demo123 |

Use **Reset demo data** on the login screen to restore sample data.

## Prototype limitations

This prototype stores demo records in browser localStorage and the current login state in sessionStorage. It is not production authentication and does not use a shared server database. Before production use, connect secure server-side authentication, authorization, validation, audit logs and a database. Sample records are illustrative; verify all association data before relying on reports.

## Access rules

| Role | Registers | Sees | Can change |
|---|---|---|---|
| Super Admin | Super Admins, Team Head Coordinators and Members | All teams and everyone, including Top Clients | Everything |
| Team Head Coordinator | Members of own team | Own team only | Own team's records and meeting schedule |
| Member | – | Own team only | Own Friday updates, Specific Connects and pending TYFCB slips; referrals and joint calls |

Fonts: Inter.

Super Admins can add and edit Business Network rows (SNO, date, name, specific ask and specific give), schedule and view upcoming team meetings, and edit or advance thank-you notes.

Only Super Admins can register Power Teams, and registration includes creating the Team Head Coordinator account. The Super Admin dashboard lists each team's upcoming meeting. The TYFCB page has Given and Received reports and defaults to the trailing six months.

Demo data includes a Power Team meeting on **28-Nov-2026 at 08:30** at **IControl Automation Office**.

## Premium UI layer
`src/premium.css` (loaded after `index.css`) holds the executive design system: refined tokens, dark sidebar, glass top bar, custom-styled dropdowns, form cards with headers and action bars, premium tables, pills, tiles and the redesigned sign-in. Edit the variables at the top of that file to retheme.
