# Brand and assets

Palette: ivory #f8f6ef, deep olive #303b2c, dark olive #222d21, sage #e9ece2, copper #9b623e. The geometric rosette is code-native SVG in `src/components.tsx`, with a matching `public/favicon.svg`. This is a new provisional identity, not a claim to be an official Tariqa emblem.

Typography is self-hosted DM Sans (400/500/600/700) and Libre Caslon Display (400), from the Google Fonts repository. Their SIL Open Font License notices are included under `public/fonts/`. React, React Router, Vite, TypeScript and lucide-react retain their respective upstream package licenses; `package-lock.json` pins the actual dependency versions.

## Current community imagery

The current homepage and default public pages use `public/images/gathering.webp`, `public/images/relaxing.webp` and `public/images/volunteers.webp`. They show fictional people gathering over tea, relaxing in a garden and preparing food parcels. All were created with the built-in image-generation tool and converted to WebP. Exact generation prompts appear in `IMAGE-PROMPTS.md`. The earlier image files below are retained only for compatibility with older local exports.

## Earlier illustrative generated photographs

All three are temporary AI-generated illustrations, not documentary images of this organisation, its premises or its participants. The public preview and media metadata disclose this. No identifiable person is represented as an actual member. Replace with approved photographs before production if authenticity is required.

| Asset path | Subject | Intended placement |
| --- | --- | --- |
| public/images/garden.webp | Quiet stone arch, garden foliage and warm light | Homepage hero and reflection |
| public/images/tea.webp | Tea and adult hands at a London window | Welcome and community |
| public/images/hands.webp | Adult volunteers preparing food parcels | Practical support and programmes |

Generation direction for garden: editorial architectural photograph of a tranquil British courtyard garden, warm limestone arch, olive foliage, soft natural light, calm atmosphere, dark clear space on the left for a heading, no people, no text or logos; landscape 1536×1024.

Generation direction for tea: warm documentary-style still life of ceramic tea and adult hands around a wooden table beside a London window, natural light, welcoming and quiet, no identifiable faces, no text or logos; landscape 1536×1024.

Generation direction for hands: editorial close-up of adult volunteer hands preparing simple food parcels on a wooden table, soft natural light, practical care, no identifiable faces, no branding or text; landscape 1536×1024.

The supplied PNG outputs were converted to WebP for distribution. The website uses the WebP paths above. To replace using source, keep the same filenames or edit `src/data.ts`, then rebuild. To preview replacements without code, use the studio and export the content JSON for the backend handover.
