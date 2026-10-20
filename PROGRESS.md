# PROGRESS — صدا نویس (Urdu audio transcription PWA)

## Phase 1 (2026-10-20): UI + Whisper in-browser + editor + TXT/SRT/VTT
Only checks done: JS syntax check. The build sandbox has no network, so the model could not be downloaded, and nothing was rendered or run on a phone.

| Feature | Status | Note |
|---|---|---|
| Static PWA shell, Urdu RTL / English LTR UI | Not verified | Written to the colour spec; never rendered |
| Whisper transcription (Transformers.js, WASM, q8) | Not verified | Needs first run online to download the model |
| File decoding (AudioContext, 16 kHz mono) | Not verified | Format support depends on the phone's Chrome |
| Long audio (30 s chunks, 5 s overlap) | Not verified | Memory limit on OnePlus 7 Pro unknown |
| Progress | Not verified | Real values only: model download %, chunk n of about N. No fake percentage |
| Cancel | Not verified | Stops the worker; the model reloads from cache |
| Editor, find, copy, TXT, autosave, delete | Not verified | Autosave is in this browser only |
| SRT / VTT | Not verified | Timestamps are Whisper's segment times, not word level; built from the original segments, not from edits |
| PWA install / offline | Not verified | The model and the library load from the internet at least once |

Not started: DOCX, PDF, summary, translation, speaker labels, microphone recording.

## Known issues / unknowns
- Urdu accuracy of Tiny/Base/Small is unmeasured. Small is likely better and also slower and heavier.
- Switching the view (flowing / by segment) rebuilds the text and discards manual edits.
- The library version (@huggingface/transformers 3.5.1 from jsDelivr) is pinned but not tested.

## Next
1. Deploy (see README), then test on OnePlus 7 Pro: Tiny, Base, Small with a 1 minute Urdu clip. Record time, RAM trouble, quality.
2. Fix what breaks. Then test mixed Urdu/English, MP3/M4A/WEBM/MP4, empty file, offline.
3. Then optional features, one at a time.

## Phase 2 (2026-10-20): DOCX, PDF, microphone, translation, safer editing
Checks done: JS syntax; DOCX writer tested in Node. Nothing else was run (still no network in the build sandbox, no phone test).

| Feature | Status | Note |
|---|---|---|
| DOCX export (own ZIP writer, no library) | Partial | Opened by python-docx; paragraphs match the input, including Urdu and & < >. LibreOffice also opened and converted it to PDF. Not tried in MS Word or on the phone |
| PDF export | Not verified | Uses the browser's Print dialog (Save as PDF), so Urdu shaping is done by the browser. No PDF library |
| Microphone recording, then transcribe | Not verified | Records first, transcribes after Stop. It is NOT live streaming transcription |
| Translate to English (Whisper task) | Not verified | Whisper translates only into English; quality of small models is unmeasured |
| Edit protection when switching view | Not verified | Asks before discarding manual edits |

Still not started: summary, speaker labels (need extra models; kept for later), live streaming transcription.
Phase 1 items are unchanged: all Not verified until tested on the phone.
