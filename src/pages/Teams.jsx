import Icon from "../icons";
import { toastOk } from "../toast";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import {
  useDB,
  me,
  TEAMS,
  headOf,
  teamUsers,
  teamStats,
  teamDetails,
  addTeamDetails,
  fm,
  teamSchedule,
  saveTeamSchedule,
  dv,
  fmtD,
  toIso,
  isoToday,
} from "../store";
import { PageHead, Table, Tiles, Pill } from "../ui";

const ROLE = { sa: "Super Admin", th: "Power Team Coordinator", mb: "Member" };
const teamInitials = (name) =>
  name
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

function TeamLogo({ team, className = "" }) {
  const details = teamDetails(team);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [details?.logo]);
  return (
    <span className={`team-card-logo ${className}`} aria-hidden="true">
      {details?.logo && !failed ? (
        <img src={details.logo} alt="" onError={() => setFailed(true)} />
      ) : (
        teamInitials(details?.name || TEAMS[team - 1])
      )}
    </span>
  );
}

function TeamCard({ t }) {
  const head = headOf(t),
    s = teamStats(t);
  const details = teamDetails(t);
  const name = details.name;
  return (
    <article className="tcard team-overview-card">
      <div className="team-card-info">
        <span className="team-card-top">
          <TeamLogo team={t} />
          <span
            className={`dot ${head ? "ok" : "wait"}`}
            title={head ? "Coordinator registered" : "Coordinator pending"}
          />
        </span>
        <span className="tcard-title">
          <b>{name}</b>
          <span className="team-card-quote">“{details.quote}”</span>
          <small className="team-card-count">
            {s.members} {s.members === 1 ? "member" : "members"}
          </small>
        </span>
      </div>
      <div className="team-overview-actions">
        <Link className="btn-s" to={`/teams/${t}`}>View Details</Link>
      </div>
      <div className="team-overview-stats">
        <span><b>{s.refs}</b> Referrals</span>
        <span><b>{s.joint}</b> Joint calls</span>
        <span><b>{fm(s.business)}</b> Business</span>
        </div>
    </article>
  );
}

function TeamMeetingSchedule({ team }) {
  const u = me(), saved = teamSchedule(team)
  const [form, setForm] = useState(() => ({
    d: saved ? toIso(saved.d) : '',
    t: saved?.t || '08:30',
    venue: saved?.venue || '',
  }))
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const canSchedule = u.role === 'sa' || (u.role === 'th' && u.team === team)
  const set = key => event => { setForm(current => ({ ...current, [key]: event.target.value })); setOk('') }
  const submit = event => {
    event.preventDefault()
    const result = saveTeamSchedule(team, { ...form, d: fmtD(form.d) })
    if (result) return setErr(result)
    setErr('')
    setOk('Meeting schedule saved.')
    toastOk('Power Team meeting scheduled.')
  }
  return <section className="card team-schedule">
    <div className="team-schedule-heading">
      <div><h2>Team meeting schedule</h2><p>Schedule the next meeting for this Power Team.</p></div>
      {saved && <span className="pill pill-g">Scheduled</span>}
    </div>
    {saved && <div className="team-schedule-summary">
      <b>{saved.d} · {saved.t}</b><span>{saved.venue}</span>
    </div>}
    {canSchedule ? <form onSubmit={submit}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><label className="lbl">Date *</label><input className="inp" type="date" min={isoToday()} value={form.d} onChange={set('d')} required /></div>
        <div><label className="lbl">Time *</label><input className="inp" type="time" value={form.t} onChange={set('t')} required /></div>
        <div><label className="lbl">Venue *</label><input className="inp" value={form.venue} onChange={set('venue')} required /></div>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <button className="btn">{saved ? 'Update schedule' : 'Schedule meeting'}</button>
        {err && <span className="text-sm text-bni" role="alert">{err}</span>}
        {ok && <span className="text-sm text-green-700">{ok}</span>}
      </div>
    </form> : !saved && <p className="text-sm text-gray-500">The Team Head Coordinator has not scheduled a meeting yet.</p>}
  </section>
}

export default function Teams() {
  const { teamId: routeTeamId } = useParams();
  const detailTeam = routeTeamId ? Number(routeTeamId) : null;
  const db = useDB(), [searchParams] = useSearchParams();
  const u = me(),
    isSA = u.role === "sa";
  const metricKey = isSA ? searchParams.get("metric") : null;
  const metricLabels = {
    business: "Overall business",
    ones: "1-to-1 meetings",
    referrals: "Referrals passed",
    joint: "Joint calls",
  };
  const metricLabel = metricLabels[metricKey];
  const metricRows = metricLabel ? TEAMS.map((name, index) => {
    const team = index + 1, ids = teamUsers(team).map(person => person.id);
    const records = metricKey === "business"
      ? db.notes.filter(note => note.st === 2 && ids.includes(note.g))
      : metricKey === "ones"
        ? db.ones.filter(record => ids.includes(record.f))
        : metricKey === "joint"
          ? db.acts.filter(record => record.t === "Joint call" && ids.includes(record.f))
          : db.refs.filter(record => ids.includes(record.f));
    const value = metricKey === "business"
      ? records.reduce((total, record) => total + record.v, 0)
      : records.length;
    const latest = records.map(record => record.d).sort((a, b) => dv(b) - dv(a))[0] || "—";
    return <tr key={team}>
      <td className="td"><Link to={`/teams/${team}`}>{name}</Link></td>
      <td className="td">{metricKey === "business" ? fm(value) : value}</td>
      <td className="td">{records.length}</td>
      <td className="td">{latest}</td>
    </tr>;
  }) : [];
  const [formOpen, setFormOpen] = useState(false),
    [teamForm, setTeamForm] = useState({ name: "", logo: "", quote: "" }),
    [err, setErr] = useState("");
  const set = (k) => (e) => {
    setTeamForm((current) => ({ ...current, [k]: e.target.value }));
    setErr("");
  };
  const reset = () => {
    setTeamForm({ name: "", logo: "", quote: "" });
    setErr("");
  };
  const submit = (e) => {
    e.preventDefault();
    const result = addTeamDetails(teamForm);
    setErr(result);
    if (result) return;
    toastOk(`${teamForm.name.trim()} added successfully.`);
    reset();
    setFormOpen(false);
  };
  const pending = TEAMS.filter((_, i) => !headOf(i + 1)).length;
  const people = teamUsers(u.team).sort(
      (a, b) =>
        a.team - b.team ||
        (a.role === "th" ? -1 : 1) - (b.role === "th" ? -1 : 1) ||
        a.name.localeCompare(b.name)
    );
  const s = !isSA && teamStats(u.team);

  if (routeTeamId && (!TEAMS[detailTeam - 1] || (!isSA && u.team !== detailTeam))) {
    return <Navigate to="/teams" replace />;
  }

  if (detailTeam) {
    const details = teamDetails(detailTeam);
    const name = details.name;
    const members = teamUsers(detailTeam).sort(
      (a, b) => (a.role === "th" ? -1 : 1) - (b.role === "th" ? -1 : 1) || a.name.localeCompare(b.name)
    );

    return (
      <>
        <PageHead
          eyebrow="POWER TEAM"
          title={name}
          sub="Members and activity in this Power Team."
          action={
            <div className="team-detail-actions">
              <Link className="btn-s" to="/teams">← All teams</Link>
            </div>
          }
        />
        <section className="card team-detail-banner">
          <TeamLogo team={detailTeam} className="team-detail-logo" />
          <div><span className="eyebrow">TEAM MOTTO</span><p>“{details.quote}”</p></div>
        </section>
        <TeamMeetingSchedule key={detailTeam} team={detailTeam} />
        <div className="section-bar">
          <h2>Team members</h2>
          <span className="filter-count">{members.length} {members.length === 1 ? "member" : "members"}</span>
        </div>
        {members.length ? (
          <div className="member-directory-grid team-member-grid">
            {members.map((person) => (
              <article className="member-card" key={person.id}>
                <div className="member-card-top">
                  <div className="member-avatar">{teamInitials(person.name)}</div>
                  <Pill c={person.role === "th" ? "g" : "n"}>{ROLE[person.role]}</Pill>
                </div>
                <h3>{person.name}</h3>
                <p className="member-company">{person.business || "Business name not provided"}</p>
                <p className="member-category">{person.cat || "Business category not provided"}</p>
                <div className="member-meta"><span>✉ {person.email}</span></div>
              </article>
            ))}
          </div>
        ) : (
          <div className="card team-empty">
            <b>No members have been added to this team yet</b>
            <span>Team members will appear here when they are registered.</span>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <PageHead
        eyebrow="TEAM STRUCTURE"
        title="Power Teams"
        sub={
          isSA
            ? `${TEAMS.length - pending} of ${TEAMS.length} teams have a coordinator. Explore each team's members and activity.`
            : `Explore the members and activity of ${TEAMS[u.team - 1]}.`
        }
        action={
          isSA ? (
            <button
              type="button"
              className="btn"
              aria-expanded={formOpen}
              onClick={() => {
                setFormOpen((o) => !o);
                setErr("");
              }}
            >
              {formOpen ? (
                <>
                  <Icon name="minus" size={15} stroke={2.6} /> Close form
                </>
              ) : (
                <>
                  <Icon name="plus" size={15} stroke={2.6} /> Add Team
                </>
              )}
            </button>
          ) : (
            <Link className="btn" to={`/teams/${u.team}`}>View My Team</Link>
          )
        }
      />

      {isSA && (
        <div className="collapse reg-collapse" data-open={formOpen}>
          <div className="collapse-inner">
            <form onSubmit={submit} className="card reg-form" autoComplete="off">
              <div className="form-head">
                <span className="form-head-icon">✦</span>
                <div>
                  <h3>New Power Team</h3>
                  <p>Add a Power Team with its name, logo, and quote.</p>
                </div>
                <span className="form-step">Team details</span>
              </div>
              <div className="reg-grid">
                <div>
                  <label className="lbl" htmlFor="team-name">Team name *</label>
                  <input id="team-name" className="inp" value={teamForm.name} onChange={set("name")} placeholder="Power Team name" required />
                </div>
                <div>
                  <label className="lbl" htmlFor="team-logo">Logo URL</label>
                  <input id="team-logo" className="inp" type="url" value={teamForm.logo || ""} onChange={set("logo")} placeholder="https://example.com/logo.png" />
                </div>
                <div className="team-quote-field">
                  <label className="lbl" htmlFor="team-quote">Team quote *</label>
                  <textarea id="team-quote" className="inp" value={teamForm.quote} onChange={set("quote")} placeholder="Add a short quote for this team" required />
                </div>
              </div>
              <div className="reg-actions">
                <span className="reg-msg">
                  {err && <span className="text-bni">⚠ {err}</span>}
                </span>
                <button type="button" className="btn-s" onClick={reset}>
                  Reset
                </button>
                <button type="submit" className="btn">Add Team</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSA ? (
        <>
          {metricLabel && <section className="card team-metric-overview">
            <div className="team-metric-heading">
              <div><h2>{metricLabel} by Power Team</h2><p>Team totals, record counts and latest activity.</p></div>
              <Link className="btn-s" to="/teams">All Power Teams</Link>
            </div>
            <Table head={["Power Team", metricLabel, "Records", "Latest activity"]} rows={metricRows} />
          </section>}
          <div className="section-bar">
            <h2>Teams overview</h2>
            <span className="legend-inline">
              <i className="dot ok" /> Coordinator registered{" "}
              <i className="dot wait" /> Coordinator pending
            </span>
          </div>
          <div className="tcard-grid">
            {TEAMS.map((_, i) => (
              <TeamCard
                key={i}
                t={i + 1}
              />
            ))}
          </div>
        </>
      ) : (
        <Tiles
  items={[
    ["Team members", s.members, "users"],
    ["Referrals", s.refs, "network"],
    ["Joint calls", s.joint, "activity"],
    ["Business", fm(s.business), "trend"],
  ]}
/>
      )}

      {!isSA && (
        <>
          <div className="section-bar">
            <h2>Team members</h2>
          </div>
          <Table
            head={["Name", "Role", "Category", "Email"]}
            rows={people.map((x) => (
              <tr key={x.id}>
                <td className="td font-semibold">{x.name}</td>
                <td className="td">
                  <Pill c={x.role === "th" ? "g" : "n"}>{ROLE[x.role]}</Pill>
                </td>
                <td className="td">{x.cat}</td>
                <td className="td">{x.email}</td>
              </tr>
            ))}
          />
        </>
      )}
    </>
  );
}
