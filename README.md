# CPF Complaint Management Readers

This static GitHub Pages site keeps both documents available:

- `index.html`: the original 13-page portrait flipbook, powered by `page-flip@2.0.7`.
- `new.html`: the new 13-page landscape document, with page controls, thumbnails, fullscreen mode, and a link to the original PDF in `doc/`.
- `new-300969.html`: the separate 26-page landscape edition dated 30 September 2026.

The two readers use relative asset paths so both routes work under the GitHub Pages project URL.

## Run locally

From this repository directory, run `npm run dev` and open
`http://localhost:5173/` for the original reader or
`http://localhost:5173/new.html` for the landscape reader.
Open `http://localhost:5173/new-300969.html` for the 300969 edition.
The development server uses Python's built-in HTTP server, so no `npm install` is needed.

Use one cache version for every HTML, CSS, JavaScript, background, and page-image
asset. When preparing a new deployment, update all references with one command:

```powershell
npm run version-assets -- 20260927-1
```

Replace the example value with the new release version. The public reader URL
remains `https://tanagrit3042.github.io/cpf-complaint-flipbook/new.html`.

The original reader in `index.html` still uses every image in `pages/`, while
`new.html` uses `new-pages/`. On a phone held upright, the new reader places a
compact **อ่านแนวนอน** prompt over a blurred slide. Tapping it requests
landscape reading, with a CSS rotation fallback for LINE's in-app browser.
