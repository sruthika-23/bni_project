# BNI Power Team Hub – Redesigned

A React + Vite prototype using the BNI red, white and grey visual identity. The redesign includes a dedicated sign-in screen and separate modules for Dashboard, Members Directory, Member Profile, Power Teams, Member Goals, Opportunities (meeting updates: clients, pipeline and specific asks), Specific Connects, Referrals (date, contact person, phone, email, requirement), 1-to-1 Meetings, Activity Tracker, Attendance, Minutes of Meeting, Business Generated, Performance, Reports, Settings and Thank-you Notes.

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
| Team Head | head@bni.demo | demo123 |
| Member | member@bni.demo | demo123 |

Use **Reset demo data** on the login screen to restore sample data.

## Prototype limitations

This prototype stores demo records in browser localStorage and the current login state in sessionStorage. It is not production authentication and does not use a shared server database. Before production use, connect secure server-side authentication, authorization, validation, audit logs and a database. Sample records are illustrative; verify all association data before relying on reports.

## Access rules

| Role | Registers | Sees | Can change |
|---|---|---|---|
| Super Admin | Team Heads | All 12 teams and everyone | Everything |
| Team Head | Members of own team | Own team only | Own team's records |
| Member | – | Same pages as the Team Head, own team only, read-only | Only Referrals and Joint Calls (their own entries) |

Fonts: Inter.

## Premium UI layer
`src/premium.css` (loaded after `index.css`) holds the executive design system: refined tokens, dark sidebar, glass top bar, custom-styled dropdowns, form cards with headers and action bars, premium tables, pills, tiles and the redesigned sign-in. Edit the variables at the top of that file to retheme.
