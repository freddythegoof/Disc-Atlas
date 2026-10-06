// The unified dropdown indicator (Stitch "Unified Dropdown Indicator", Oct 2026): one chevron in
// three sizes, sm for chips, md for form selects, lg for panel headers. Its trigger sets its state
// (hover, open, disabled) through CSS; see dropdown-indicator.css. The same markup is written by
// hand in the static pages, so keep the glyphs in step with them.
(()=>{
 const GLYPHS={sm:['0 0 8 5','M1 1.25L4 3.75L7 1.25'],md:['0 0 10 6','M1 1.5L5 4.5L9 1.5'],lg:['0 0 12 7','M1.5 1.5L6 5.5L10.5 1.5']};
 const indicator=(size='md')=>{const [box,d]=GLYPHS[size];return `<span class="dd-indicator dd-${size}" aria-hidden="true"><svg viewBox="${box}" focusable="false"><path d="${d}"/></svg></span>`;};
 // A native select (its markup) with the indicator in place of the browser's own arrow.
 const select=(markup,size='md')=>`<span class="dd-select dd-select-${size}">${markup}${indicator(size)}</span>`;
 window.DropdownIndicator={indicator,select};
})();
