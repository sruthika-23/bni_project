import Icon from "../icons";
import { toastOk } from "../toast";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
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
} from "../store";
import { PageHead, Table, Tiles, Pill } from "../ui";

const ROLE = { sa: "Super Admin", th: "Team Head", mb: "Member" };
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
            title={head ? "Head registered" : "Head pending"}
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

export default function Teams() {
  const { teamId: routeTeamId } = useParams();
  const detailTeam = routeTeamId ? Number(routeTeamId) : null;
  useDB();
  const u = me(),
    isSA = u.role === "sa";
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
            ? `${TEAMS.length - pending} of ${TEAMS.length} teams have a head. Explore each team's members and activity.`
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
          <div className="section-bar">
            <h2>Teams overview</h2>
            <span className="legend-inline">
              <i className="dot ok" /> Head registered{" "}
              <i className="dot wait" /> Head pending
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
            ["Team members", s.members],
            ["Referrals", s.refs],
            ["Joint calls", s.joint],
            ["Business", fm(s.business)],
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
