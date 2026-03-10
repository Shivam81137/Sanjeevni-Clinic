# Sanjeevni Clinic Website

Simple responsive clinic website built with plain HTML, CSS, and a small JavaScript file for scroll reveal effects.

## Files

- `index.html` - page structure and content
- `styles.css` - responsive styling and transitions
- `script.js` - reveal-on-scroll animation and footer year update

## Quick Start

Open `index.html` directly in a browser, or run a local server.

### PowerShell local server (optional)

```powershell
cd C:\Users\HP-PC\Desktop\sanjeevni
python -m http.server 5500
```

Then visit `http://localhost:5500`.

## Customization

- Replace doctor placeholder text `[Doctor Name]` in `index.html`.
- Replace image placeholders with real clinic and doctor images.
- Replace the map placeholder with a real Google Maps iframe URL.

## Adding Clinic Photos (Compliant)

Use only photos you own or are licensed to publish. Avoid copying/scraping photos directly from Google Maps listings.

1. Create folder: `assets/photos`
2. Add your authorized images as:
   - `assets/photos/clinic-1.svg`
   - `assets/photos/clinic-2.svg`
   - `assets/photos/clinic-3.svg`
3. Refresh the page; the `Clinic Photos` section will display them automatically.

You can also switch to `.jpg` or `.png` files by updating the `src` values in `index.html`.
