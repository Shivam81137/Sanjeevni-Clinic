"""
Run this script ONCE to save the clinic photos to assets/photos/
Usage:  python save_images.py
"""
import urllib.request, os, sys

PHOTOS_DIR = os.path.join(os.path.dirname(__file__), "assets", "photos")
os.makedirs(PHOTOS_DIR, exist_ok=True)

IMAGES = [
    {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AHVAweoDhQaE3JfhxoL4-q51LE11ipjhvEZEtGVzEBAMAZvVbTATE71yphbkQMMrOc4yqk-5laYiY-78NtEu4egVAFZnEG_W0E8aU2-gYWVz2rzFMh3Fub34ac7c8SpbUVgYan8pwFi8=w800-h1422-k-no",
        "file": "clinic-real-1.jpg",
        "desc": "Clinic exterior – portrait (hero)",
    },
    {
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AHVAweqfc3FfCfRSujvveYvENOlMYaS2_4MwPyHs8-mn-mLm7u1sAXZqcoLzIsTiz9yqgIOggm5eBs40gyqt2skfxA80UHzyZNtUnVuV5Eu9erfINANxNOYADNJB8PBXtMy6Hs7cHteKsw=w600-h338-k-no",
        "file": "clinic-real-2.jpg",
        "desc": "Street view – landscape",
    },
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0 Safari/537.36",
    "Referer": "https://www.google.com/",
}

for item in IMAGES:
    dest = os.path.join(PHOTOS_DIR, item["file"])
    print(f"Downloading {item['desc']} → {item['file']} ...", end=" ", flush=True)
    try:
        req = urllib.request.Request(item["url"], headers=HEADERS)
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = resp.read()
        with open(dest, "wb") as f:
            f.write(data)
        print(f"OK  ({len(data):,} bytes)")
    except Exception as e:
        print(f"FAILED: {e}")

print("\nDone! Refresh index.html in your browser.")

