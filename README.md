# Knights Power Team Hub

A React + Vite prototype for the Knights Power Team Hub. It includes a dedicated sign-in screen and modules for Dashboard, Members Directory, Friday Updates, Member Profile, Power Teams, Member Goals, Opportunities (meeting updates: clients, pipeline and specific asks), Activity Tracker (1-to-1s, thank-you notes, joint calls, specific connects and referrals), Attendance, Minutes of Meeting, Business Generated, Top Clients (Super Admin only), Performance, Reports and Settings. Tracker categories are accessed from Activity Tracker rather than separate sidebar links; relevant entry and detail actions remain available there.

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
| Super Admin | Team Head Coordinators | All teams and everyone, including Top Clients | Everything |
| Team Head Coordinator | Members of own team | Own team only | Own team's records and meeting schedule |
| Member | – | Own team only | Own Friday updates and Specific Connects; referrals and joint calls |

Fonts: Inter.

## Premium UI layer
`src/premium.css` (loaded after `index.css`) holds the executive design system: refined tokens, dark sidebar, glass top bar, custom-styled dropdowns, form cards with headers and action bars, premium tables, pills, tiles and the redesigned sign-in. Edit the variables at the top of that file to retheme.
