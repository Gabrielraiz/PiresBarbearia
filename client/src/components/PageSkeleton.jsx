import React from 'react';

export default function PageSkeleton({ cards = 6, minHeight = 'min-h-[180px]' }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className={`rounded-3xl border border-[var(--border)] bg-[var(--bg-card)]/70 p-6 animate-pulse ${minHeight}`}>
          <div className="h-6 w-1/3 rounded bg-[var(--bg-main)] mb-5" />
          <div className="h-4 w-2/3 rounded bg-[var(--bg-main)] mb-3" />
          <div className="h-4 w-1/2 rounded bg-[var(--bg-main)] mb-8" />
          <div className="h-10 w-full rounded-xl bg-[var(--bg-main)]" />
        </div>
      ))}
    </div>
  );
}
