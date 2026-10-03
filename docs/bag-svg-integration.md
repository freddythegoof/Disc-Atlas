# Premium disc golf bag

The revised SVG uses the **large front panel as the movable access flap**. The smaller upper putter pocket stays fixed. The preview shows closed (left) and tucked open (right).

The SVG contains exactly three top-level groups, a `0 0 800 1000` viewBox, and no discs, raster images, text elements, or background.

## Layer order

Inline the SVG and retain its shared definitions and stylesheet:

1. `bag-back`: straps, side pockets, cavity walls, floor, and tucked flap.
2. Your app's disc elements.
3. `bag-front`: fixed body, opening frame, retaining lip, upper putter pocket, utility pocket, and fixed zipper track.
4. `bag-lid`: large front flap in the closed pose, including its zipper pulls.

The front layer has a transparent cutout across the large opening, approximately x=233–567 and y=488–814. Start disc placement within x=270–530 and y=545–790, then adjust to your artwork. The lower lip hides the disc bottoms; the opening narrows toward its rounded lower corners.

## Open and closed states

The SVG defaults to `data-state="closed"`. Set this attribute on the inline SVG:

```js
svg.dataset.state = 'open';   // hides bag-lid; shows tucked-front-flap
svg.dataset.state = 'closed';
```

`tucked-front-flap` is inside `bag-back`, so your discs cover it naturally. Its inner face and Velcro tab are visible when the bag is empty. The closed flap and its pulls disappear in the open pose. Both poses preserve the three top-level groups.

These hooks switch final poses; the SVG does not run its own animation.

## Flap motion

The zipper runs along both sides and the rounded bottom. The flap remains attached at its upper edge: **(244,488) → (556,488)**. The midpoint is **(400,488)**; the `bag-lid` group includes `data-hinge-*` attributes.

For a simple stylized transition, animate `s` from `1` to approximately `0.05`, shrinking the flap toward its upper attachment:

```js
lid.setAttribute('transform', `translate(0 488) scale(1 ${s}) translate(0 -488)`);
```

At the inward-fold handoff, set `data-state="open"` to show the tucked representation behind the discs, then clear the transient transform. Reverse the handoff for closing. A realistic fabric-fold animation requires a path morph or perspective treatment; a rigid rotation alone cannot depict the full tuck.

## Color

Override the semantic palette variables on the inline SVG:

```css
.your-bag-svg {
  --bag-primary: #436752;
  --bag-secondary: #243c31;
  --bag-accent: #a0b39b;
}
```

Fabric uses `.bag-primary`, `.bag-secondary`, and `.bag-accent`. Variables also recolor stroked seams and the vector weave. Default charcoal colors are confined to CSS. Fixed visible colors belong only to zipper hardware; white mask stops control opacity without painting the fabric.

Inline the SVG for recoloring and disc insertion. External page CSS cannot reach its internals when loaded through an image element.
