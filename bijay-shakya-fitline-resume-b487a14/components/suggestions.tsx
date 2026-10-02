import type { SuggestionGroup } from "@/lib/suggest";

export function Suggestions({
  groups,
  covered,
}: {
  groups: SuggestionGroup[];
  covered: boolean;
}) {
  return (
    <section className="min-w-0" aria-labelledby="suggested-bullets">
      <h2 id="suggested-bullets" className="font-heading text-2xl font-semibold">
        Suggested bullets
      </h2>
      {covered ? <p className="mt-1 text-sm text-muted-foreground">Already covered.</p> : null}
      {!covered && groups.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">No roles to attach.</p>
      ) : null}
      {covered || groups.length === 0 ? null : (
        <ul className="mt-4 flex flex-col gap-3">
          {groups.map((group) => (
            <li
              key={group.roleId}
              className="min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-6"
            >
              <h3 className="text-base font-medium break-words">
                {group.title}
                {group.organization ? (
                  <span className="font-normal text-muted-foreground"> — {group.organization}</span>
                ) : null}
              </h3>
              <ul className="mt-3 flex flex-col gap-3">
                {group.bullets.map((item) => (
                  <li key={item.id} className="min-w-0 border-l-2 border-primary/30 pl-3">
                    <p className="text-sm leading-relaxed break-words">{item.bullet}</p>
                    {item.fit === "weak" ? (
                      <p className="mt-1 text-sm break-words text-muted-foreground">{item.fitNote}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
