# Plan 06H satellite-label follow-up

Status: partial implementation, uncommitted. Stopped after two implementation attempts under the requested two-strikes rule.

The original regression reproduced 0 labeled satellites at 9x. Satellite DOM labels now use measured name/brand footprints in a second contention pass after primary promotion, gated by applied grouping level 10. Dots remain at their established atlas coordinates. Stacked satellites retain their badge behavior and existing interaction handlers are unchanged.

The first attempt inherited the hover tooltip position and labeled 3 satellites. The second evaluates short adjacent DOM label positions without moving dots or drawing canvas labels. The dense 1440x900 dark putter-band capture has 13 satellites: 11 unstacked and 2 stacked. Nine unstacked satellites have automatic labels; Bluebonnet and Scarab remain unlabeled. There are zero measured label overlaps, zero leaders, and zero marker displacement. All 1,037 rated discs remain represented.

The diagnostic placement probe finds a fitting label placement for Bluebonnet, but the implementation rejects its existing dot because it intersects a primary's reserved footprint. Scarab has no available adjacent placement in the probe. The remaining work is to resolve the overly restrictive satellite marker veto while preserving label contention, then complete hysteresis and interaction verification. No third implementation attempt was made.

Validation: 12 grouping unit tests pass. The updated grouping-zoom Playwright regression fails at the maximum-view assertion (9 labels versus 10 expected fitting singles), so later maximum interaction and hysteresis checks have not completed. Earlier 5x dark/light band, keyboard reveal, satellite tap, and suppression checks passed before that assertion. Git diff whitespace check passes.

Review screenshot: [9x putter band](../outputs/grouping-zoom/putter-9x-satellite-labels.png).
