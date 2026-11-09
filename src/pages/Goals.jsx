import {
  useDB,
  me,
  scope,
  goalOf,
  fm,
  setGoal,
  setTurn,
  canManage,
} from "../store";
import { PageHead, Tiles, Table } from "../ui";

const Edit = ({ v, ro, onSave }) =>
  ro ? (
    fm(v)
  ) : (
    <input
      key={v}
      className="inp !w-36"
      type="number"
      min="0"
      defaultValue={v}
      onBlur={(e) => +e.target.value !== v && onSave(e.target.value)}
    />
  );

export default function Goals() {
  const db = useDB(),
    u = me(),
    people = scope(u);
  const sum = (f) => people.reduce((a, x) => a + f(x), 0);
  return (
    <>
      <PageHead
        eyebrow="TARGETS"
        title="Member Goals"
        sub="6-month turnover goal, BNI business goal and Power Team goal for each member."
      />
      <Tiles
        items={[
          ["6-month turnover goal", fm(sum((x) => x.turn || 0))],
          ["BNI business goal", fm(sum((x) => x.bni))],
          ["Power Team goal (67%)", fm(sum(goalOf))],
          ["Members", people.length],
        ]}
      />
      <p className="text-xs text-gray-500 my-3">
        Target period: 1 Oct 2026 – 31 Mar 2027. Power Team goal = 67% of each
        member’s BNI business goal. The remaining 33% outside the Power Team and
        non-BNI business are not tracked.
        {u.role !== "mb" && " Edit a goal and click outside the box to save."}
      </p>
      <Table
        head={[
          "Member",
          "Category",
          "6-month turnover goal",
          "BNI business goal",
          "Power Team goal (67%)",
        ]}
        rows={[
          ...people.map((x) => {
            const ro = !canManage(u, x);
            return (
              <tr key={x.id}>
                <td className="td font-semibold">{x.name}</td>
                <td className="td">{x.cat}</td>
                <td className="td">
                  <Edit
                    v={x.turn || 0}
                    ro={ro}
                    onSave={(v) => setTurn(x.id, v)}
                  />
                </td>
                <td className="td">
                  <Edit v={x.bni} ro={ro} onSave={(v) => setGoal(x.id, v)} />
                </td>
                <td className="td font-semibold">{fm(goalOf(x))}</td>
              </tr>
            );
          }),
          people.length > 0 && (
            <tr key="t" className="bg-gray-50 font-bold">
              <td className="td">TOTAL TEAM GOAL</td>
              <td className="td"></td>
              <td className="td">{fm(sum((x) => x.turn || 0))}</td>
              <td className="td">{fm(sum((x) => x.bni))}</td>
              <td className="td">{fm(sum(goalOf))}</td>
            </tr>
          ),
        ]}
      />
    </>
  );
}
