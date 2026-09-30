alter table public.pfh_bug_hunts
  add column if not exists preview_css text not null default ''
  check (length(preview_css) <= 16000);

comment on column public.pfh_bug_hunts.preview_css is
  'Trusted hunt preview CSS. It is injected into the sandbox preview and is not part of the player-editable project.';

update public.pfh_bug_hunts
set preview_css = $css$body {
  padding: 28px 34px 70px;
}

#app > div {
  max-width: 680px;
  margin: 0 auto;
}

#app h1 {
  margin: 0 0 24px;
  color: var(--terminal-amber);
}

#app section[aria-label="Products"] {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 26px;
}

#app section[aria-label="Products"] button {
  min-height: 52px;
}

#app section[aria-label="Cart"] {
  border: 1px solid var(--terminal-border);
  background: var(--terminal-panel);
  padding: 18px;
}

#app section[aria-label="Cart"] ul {
  display: grid;
  gap: 12px;
  list-style: none;
  margin: 0;
  padding: 0;
}

#app section[aria-label="Cart"] li {
  display: grid;
  grid-template-columns: 1fr auto auto auto auto;
  gap: 8px;
  align-items: center;
  border-bottom: 1px solid var(--terminal-border);
  padding-bottom: 12px;
}

#app section[aria-label="Cart"] li span:first-child {
  color: var(--terminal-text);
}

#app section[aria-label="Cart"] li span:nth-child(2) {
  min-width: 2ch;
  text-align: center;
  color: var(--terminal-amber);
}

#app section[aria-label="Cart"] button {
  padding: 5px 9px;
}

#app [data-testid="total"] {
  margin: 18px 0 0;
  color: var(--terminal-amber);
  font-weight: 700;
}

@media (max-width: 560px) {
  #app section[aria-label="Products"] {
    grid-template-columns: 1fr;
  }

  #app section[aria-label="Cart"] li {
    grid-template-columns: 1fr auto auto;
  }

  #app section[aria-label="Cart"] li button:last-child {
    grid-column: 1 / -1;
  }
}$css$
where slug = 'the-copy-counter';
