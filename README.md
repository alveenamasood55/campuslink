# CampusLink

A student-to-student academic support website. Students post help requests (C++ Programming, Discrete Structures, Mathematics, Artificial Intelligence, ICT). An AI study helper writes an instant answer, and other students can add answers, tips and links to their notes.

## Files
- `public/` - the website (`index.html`, `style.css`, `script.js`)
- `src/worker.js` - the backend: saves data, asks the AI, answers `/api/*`
- `wrangler.jsonc` - Cloudflare settings (project name, AI, and the D1 database ID)

## Built with
Cloudflare Workers, Workers AI (free daily allowance) and Cloudflare D1 (database).
