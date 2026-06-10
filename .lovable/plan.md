## Issue

The "Download as PDF" button on the `/grants` Report Draft sheet (line 427 of `src/pages/GrantsPage.tsx`) only shows a success toast — it does not generate or download any file. That's why nothing appears in your Downloads folder. The "Copy Draft" button next to it has the same fake behavior.

## Fix Plan

Generate a real PDF client-side using `jspdf` (already listed in `package.json`) and trigger a browser download.

### Changes — `src/pages/GrantsPage.tsx`

1. Add `import { jsPDF } from "jspdf";` at the top.
2. Replace the inline `onClick` on the Download as PDF button with a handler that:
   - Builds a `jsPDF` doc (A4, portrait).
   - Adds the report content: title (`Report Draft — {grant name}`), funder, award amount, period, program officer, fund utilization summary + budget breakdown, completed deliverables, pending deliverables, and deadline note when ≤14 days.
   - Uses `doc.text` with simple line wrapping (`doc.splitTextToSize`) and page-break handling.
   - Calls `doc.save(\`grant-report-${slug(reportGrant.name)}.pdf\`)`.
   - Shows `toast.success("PDF downloaded")` after save; `toast.error(...)` on failure.
3. Fix the "Copy Draft" button (line 424) to actually copy a plain-text version of the same report content via `navigator.clipboard.writeText(...)`, since it's the same kind of dead stub.

### Technical Notes

- Keep it lightweight — pure `jspdf` text rendering, no `html2canvas`, since the sheet content is straightforward text/numbers.
- No backend or schema changes.
- No new dependencies (jspdf already present).

### Verification

- Open `/grants`, click "Draft Report" on any grant card, click "Download as PDF" → a `.pdf` file appears in Downloads and opens with the expected content.
- Click "Copy Draft" → paste into a text editor shows the formatted draft.
