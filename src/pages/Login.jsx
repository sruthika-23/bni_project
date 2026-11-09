import { useState } from "react";
import { login, resetDemo } from "../store";
const DEMO = [
  ["Super Admin", "admin"],
  ["Team Head", "head"],
  ["Member", "member"],
];
export default function Login() {
  const [e, Se] = useState(""),
    [p, Sp] = useState(""),
    [err, Serr] = useState(""),
    [show, Sshow] = useState(false);
  const go = (ev) => {
    ev.preventDefault();
    if (!login(e, p)) Serr("Email or password is incorrect. Please try again.");
  };
  return (
    <div className="login-page">
      <section className="login-visual">
        <div className="login-brand">
          BNI<span>.</span>
        </div>
        <div className="login-visual-content">
          <div className="login-kicker">MEMBERS ASSOCIATION PORTAL</div>
          <h1>
            Changing the Way
            <br />
            the World Does Business<span>®</span>
          </h1>
          <p>
            Stronger connections. Better referrals. Greater business growth.
          </p>
          <div className="login-feature-row">
            <div>
              <b>12</b>
              <small>Power Teams</small>
            </div>
            <i />
            <div>
              <b>∞</b>
              <small>Opportunities</small>
            </div>
            <i />
            <div>
              <b>1</b>
              <small>Community</small>
            </div>
          </div>
        </div>
        <div className="login-visual-footer">
          BUILDING TRUST THROUGH MEANINGFUL BUSINESS RELATIONSHIPS
        </div>
      </section>
      <section className="login-panel">
        <form className="login-form" onSubmit={go}>
          <div className="login-mobile-brand">
            BNI<span>.</span>
          </div>
          <div className="eyebrow">WELCOME BACK</div>
          <h2>Sign in to your account</h2>
          <p className="login-subtitle">
            Access your Power Team workspace and member network.
          </p>
          <label className="lbl" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            className="inp login-input"
            type="email"
            placeholder="you@company.com"
            value={e}
            onChange={(x) => Se(x.target.value)}
            required
          />
          <div className="password-label">
            <label className="lbl" htmlFor="password">
              Password
            </label>
            <button type="button" onClick={() => Sshow(!show)}>
              {show ? "Hide" : "Show"}
            </button>
          </div>
          <input
            id="password"
            className="inp login-input"
            type={show ? "text" : "password"}
            placeholder="Enter your password"
            value={p}
            onChange={(x) => Sp(x.target.value)}
            required
          />
          {err && <div className="login-error">{err}</div>}
          <button className="btn login-submit">
            Sign In <span>→</span>
          </button>
          <div className="login-security">
            Your account is managed by your association administrator.
          </div>
          <div className="demo-access">
            <div className="demo-heading">
              DEMO ACCESS{" "}
              <button type="button" onClick={resetDemo}>
                Reset demo data
              </button>
            </div>
            <div className="demo-buttons">
              {DEMO.map(([l, k]) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => {
                    Se(`${k}@bni.demo`);
                    Sp("demo123");
                    Serr("");
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
            <small>Demo password: demo123</small>
          </div>
        </form>
        <footer className="login-footer">
          <span>© BNI Members Hub · All rights reserved</span>
          <span>
            Designed and developed by{" "}
            <a
              href="https://digiworldsoftwaresolutions.com/"
              target="_blank"
              rel="noreferrer"
            >
              Digiworld
            </a>
          </span>
        </footer>
      </section>
    </div>
  );
}
