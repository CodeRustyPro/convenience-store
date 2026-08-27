# Playtest logging

Every choice and every finished playthrough is appended to a Google Sheet you
own. Three tabs:

- **plays** — the one to read first. One row per playthrough, one column per
  decision scene holding the option that player picked, then the coins and
  dignity they ended on. A blank scene cell means that scene never came up —
  an empty `membership_2`, for instance, means they joined the Savers Club at
  the very first ask. Single-option "Continue" beats aren't decisions and get
  no column.

- **events** — one row per click: which scene, which option, how long they
  hesitated, and the wallet / time / dignity state before and after. Filter
  `is_decision = 1` to drop the single-option "Continue" pacing clicks (on
  those, `deliberation_ms` is read time rather than decision time).
- **runs** — one row per playthrough: final stats, what ended up in the basket,
  and the full path they took. `run_abandon` rows mark people who closed the
  tab mid-run — `last_scene` is where they dropped off, and the wallet / time /
  dignity / basket columns describe the state they were in when they left, so a
  drop-off is as analysable as a finished run.

Download it as Excel any time with **File → Download → Microsoft Excel (.xlsx)**.

## Setup (about 5 minutes)

1. Create a new Google Sheet. Name it whatever you like — the tabs are created
   for you on the first write.
2. **Extensions → Apps Script**. Delete the placeholder code and paste in
   [`apps-script/Code.gs`](apps-script/Code.gs).
3. Change `var TOKEN = 'CHANGE_ME';` to any random string. Keep it handy.
4. **Deploy → New deployment → Web app**:
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**  ← required; the game posts anonymously
   - Deploy, approve the permission prompt, and copy the **/exec** URL.
5. In the project root create `.env.local`:

   ```
   VITE_ANALYTICS_URL=https://script.google.com/macros/s/AKfy.../exec
   VITE_ANALYTICS_TOKEN=the-token-you-chose
   ```

6. Add those same two variables in **Vercel → Project → Settings →
   Environment Variables**, then redeploy.

Open the `/exec` URL in a browser — `{"ok":true,...}` means the deployment is
live.

> Re-deploying the script: use **Deploy → Manage deployments → edit → New
> version**, which keeps the same URL. A brand-new deployment gets a new URL and
> you'd have to update the env vars.

## Local check

`npm run dev` with `.env.local` in place, play a few scenes, and rows should
show up in the sheet within a few seconds. If nothing arrives, open the
console:

```js
CSAnalytics.rows()        // everything captured in this browser
CSAnalytics.downloadCsv() // save it as CSV — works even with no endpoint set
CSAnalytics.flush()       // force a send now
```

The browser mirror is a real fallback: if the endpoint is unset, misconfigured
or blocked, the data still accumulates locally and rows that failed to send are
retried on the next visit.

## Privacy

No names, no emails, no IPs collected by the game. Each run gets a random id
and each browser gets a random id (so repeat plays can be grouped) — both live
in that browser's localStorage and mean nothing outside this sheet. User agent,
language, viewport and referrer are logged for device/traffic breakdowns.

Add `?notrack=1` to the URL to switch logging off in a browser — useful when
you're testing and don't want your own runs in the data. `CSAnalytics.optOut(false)`
turns it back on.

## Reading the data

A few pivots worth building in Excel/Sheets:

| Question | How |
| --- | --- |
| What did each person pick, at a glance? | **plays**: read across the row |
| Which option does each scene pull toward? | plays: select a scene column → the status bar shows the split; or events: filter `is_decision = 1`, pivot `scene` × `choice_label` |
| Do cavers cave everywhere? | plays: sort by `final_dignity`, read the scene columns top vs bottom |
| Where do people bail? | runs: filter `event = run_abandon`, count by `last_scene` |
| Do they bail because they're broke? | runs: `final_coins` on `run_abandon` rows vs `run_end` rows |
| Does hesitation predict caving? | events: average `deliberation_ms` by `choice_label` |
| How much does the store extract? | runs: average of `500 - final_coins` |
| Does the club nag work? | runs: `joined_club` rate, split by `nags_refused` |
| Do repeat players get more resistant? | runs: `final_dignity` by `browser_id`, ordered by `ts` |

## Caveats

The site is static, so the endpoint URL and token ship inside the public JS
bundle — the token stops drive-by junk, not a determined person. If the sheet
ever gets polluted, roll the token (Apps Script + env vars) and delete the bad
rows. For a playtest dataset that's the right trade; if this ever needs to be
tamper-proof, move the write behind a Vercel serverless function with a
server-side secret.
