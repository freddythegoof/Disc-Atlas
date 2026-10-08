# Directory Featured ranking

Featured is the default Directory sort. `public/featured.js` is the curated,
ordered data file: move entries to change priority, or add a mold using its exact
ID from `public/data.json`. Brand/name labels make edits readable; only IDs control
matching. These are recognizable editorial picks across disc types and brands,
not measured market shares or a claim about today's best sellers.

Filters still apply first. Ranked matches come first, then every unranked match
alphabetically (brand and ID break name ties). The main Flight Atlas uses the same
order to choose which discs show: see [atlas-organic.md](atlas-organic.md). Clicking Featured again does not
reverse it. Other sorts retain their existing directions. Reload starts with
Featured; changing filters keeps the chosen sort. A missing ranking asset leaves
the complete catalog available alphabetically rather than preventing startup.

## API investigation — September 30, 2026

- [Google Trends API](https://developers.google.com/search/apis/trends) is still
  a limited-access alpha requiring an application, with daily or coarser intervals.
- [Google Ads historical metrics](https://developers.google.com/google-ads/api/docs/keyword-planning/generate-historical-metrics)
  provides approximate monthly keyword volume and a 12-month average, not live
  mold popularity.
- [DataForSEO Keyword Data API](https://dataforseo.com/apis/keyword-data-api)
  is a paid, pay-as-you-go service; its Google Ads data follows monthly updates.
  A "live" endpoint executes a request immediately; it does not make underlying
  monthly search counts real-time.

No clean, openly available real-time mold-ranking feed was found. Generic mold
names also need brand-qualified queries and reviewed keyword-to-mold mapping.
The authorized curated alternative fits this static app without a paid account,
credentials, or a new backend. The local data script loads once per document and
the rank map is reused for filtering; no popularity API calls or API cache are
needed. A future authenticated data source should refresh a server-side snapshot
on a schedule and retain this curated list on failure, never expose credentials
or call the provider from each visitor's browser.
