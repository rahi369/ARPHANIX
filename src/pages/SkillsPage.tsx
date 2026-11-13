import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

export function SkillsPage() {
  const { skills } = useApp();

  const grouped = useMemo(() => {
    const map = new Map<string, typeof skills>();
    for (const sk of skills) {
      const cat = sk.category || 'General';
      const arr = map.get(cat) || [];
      arr.push(sk);
      map.set(cat, arr);
    }
    return Array.from(map.entries());
  }, [skills]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 animate-editorial-enter">
      <div className="space-y-2 pb-8 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="font-mono-tabular text-xs" style={{ color: 'var(--accent-secondary)' }}>
          Disciplines &amp; Stack
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Skills &amp; Capabilities</h1>
        <p className="text-sm sm:text-base max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Core strategic, design, and engineering disciplines maintained across client engagements.
        </p>
      </div>

      {grouped.length === 0 ? (
        <div
          className="my-12 p-12 rounded-2xl border text-center text-sm"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
        >
          No skills published yet.
        </div>
      ) : (
        <div className="pt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grouped.map(([category, items]) => (
            <section
              key={category}
              className="p-6 rounded-2xl border space-y-4"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
              }}
            >
              <h2 className="font-display text-xl font-semibold tracking-tight pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                {category}
              </h2>
              <ul className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {items.map((sk) => (
                  <li
                    key={sk.id}
                    className="py-2.5 flex items-baseline justify-between gap-3 text-sm"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <span className="font-medium">{sk.name}</span>
                    {sk.proficiency && (
                      <span className="font-mono-tabular text-xs shrink-0" style={{ color: 'var(--accent-secondary)' }}>
                        {sk.proficiency}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
