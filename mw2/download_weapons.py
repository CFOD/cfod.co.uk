import requests
import os
import re
import time

BASE = 'https://callofduty.fandom.com'
API = f'{BASE}/api.php'

session = requests.Session()
session.headers.update({'User-Agent': 'MW2Collector/1.0'})
os.makedirs('weapons', exist_ok=True)

# Direct wiki page titles — not search terms, actual page names
weapons = {
    'm4a1.png': 'M4A1',
    'acr.png': 'ACR 6.8',
    'fal.png': 'FAL',
    'scarh.png': 'SCAR-H',
    'ak47.png': 'AK-47',
    'tar21.png': 'TAR-21',
    'famas.png': 'FAMAS',
    'm16a4.png': 'M16A4',
    'ump45.png': 'UMP45',
    'vector.png': 'Vector',
    'p90.png': 'P90',
    'mp5k.png': 'MP5K',
    'miniuzi.png': 'Mini-Uzi',
    'm240.png': 'M240',
    'mg4.png': 'MG4',
    'rpd.png': 'RPD',
    'l86lsw.png': 'L86 LSW',
    'intervention.png': 'Intervention',
    'barrett50cal.png': 'Barrett .50cal',
    'wa2000.png': 'WA2000',
    'm21ebr.png': 'M21 EBR',
    'spas12.png': 'SPAS-12',
    'aa12.png': 'AA-12',
    'striker.png': 'Striker',
    'ranger.png': 'Ranger (weapon)',
    'model1887.png': 'Model 1887',
    'pp2000.png': 'PP2000',
    'g18.png': 'G18',
    'm93raffica.png': 'M93 Raffica',
    'tmp.png': 'TMP',
    'usp45.png': 'USP .45',
    '44magnum.png': '.44 Magnum',
    'm9.png': 'M9',
    'deserteagle.png': 'Desert Eagle',
    'rpg7.png': 'RPG-7',
    'at4hs.png': 'AT4-HS',
    'thumper.png': 'Thumper',
    'stinger.png': 'Stinger',
    'javelin.png': 'Javelin',
    'carlgustav.png': 'Carl Gustav',
    'frag.png': 'Frag Grenade',
    'semtex.png': 'Semtex',
    'throwingknife.png': 'Throwing Knife',
    'tacticalinsertion.png': 'Tactical Insertion',
    'blastshield.png': 'Blast Shield',
    'claymore.png': 'Claymore',
    'c4.png': 'C4',
    'flashgrenade.png': 'Flash Grenade',
    'stungrenade.png': 'Stun Grenade',
    'smokegrenade.png': 'Smoke Grenade',
}

found = 0
failed = []

def clean_url(url):
    """Strip revision suffix to get the original full-res image."""
    if '/revision/' in url:
        return url.split('/revision/')[0]
    return url

def is_bad(img_url):
    """Skip nav icons, signatures, static badges."""
    bad = ['/signature/', '/static/', 'button', 'badge', 'tabber']
    return any(b in img_url.lower() for b in bad)

def get_infobox_image(html):
    """Try to find the image inside the wiki infobox (weapon card)."""
    # Fandom uses <aside class="portable-infobox">
    match = re.search(
        r'<aside[^>]*class="[^"]*portable-infobox[^"]*"[^>]*>(.*?)</aside>',
        html, re.DOTALL | re.IGNORECASE
    )
    if match:
        imgs = re.findall(r'<img[^>]+src="([^"]+)"', match.group(1))
        for img in imgs:
            if not is_bad(img):
                return clean_url(img)
    return None

def get_page_image(html):
    """Fallback: skip the first image (usually logo) and take the second real one."""
    all_imgs = re.findall(r'<img[^>]+src="([^"]+)"', html)
    filtered = [clean_url(i) for i in all_imgs if not is_bad(i)]
    # Skip first — almost always the page logo or header
    if len(filtered) >= 2:
        return filtered[1]
    if filtered:
        return filtered[0]
    return None

def get_files_on_page(title):
    """Use the MediaWiki API to list files used on a page."""
    resp = session.get(API, params={
        'action': 'query',
        'titles': title,
        'prop': 'images',
        'format': 'json'
    }).json()

    pages = resp.get('query', {}).get('pages', {})
    files = []
    for pid, pdata in pages.items():
        for img in pdata.get('images', []):
            files.append(img['title'])  # e.g. "File:MW2 M4A1.png"
    return files

def download_file_url(file_title):
    """Get the direct download URL for a File: page."""
    resp = session.get(API, params={
        'action': 'query',
        'titles': file_title,
        'prop': 'imageinfo',
        'iiprop': 'url|size|mime',
        'format': 'json'
    }).json()

    pages = resp.get('query', {}).get('pages', {})
    for pid, pdata in pages.items():
        info_list = pdata.get('imageinfo', [])
        if info_list:
            info = info_list[0]
            mime = info.get('mime', '')
            # Only want actual images
            if not any(m in mime for m in ['png', 'jpeg', 'jpg', 'svg', 'webp', 'gif']):
                return None, 0
            return info['url'], info.get('size', 0)
    return None, 0

for filename, page_title in weapons.items():
    if os.path.exists(f'weapons/{filename}'):
        print(f'SKIP: {filename}')
        found += 1
        continue

    try:
        img_url = None

        # Strategy 1: Parse page HTML, target the infobox
        resp = session.get(API, params={
            'action': 'parse',
            'page': page_title,
            'prop': 'text',
            'format': 'json'
        }).json()

        html = resp.get('parse', {}).get('text', {}).get('*', '')

        if html:
            img_url = get_infobox_image(html)
            if not img_url:
                img_url = get_page_image(html)

        # Strategy 2: Use file API — list files on the page, pick the best one
        if not img_url:
            files = get_files_on_page(page_title)
            # Prioritise files with "MW2" or "icon" in the name
            mw2_files = [f for f in files if 'mw2' in f.lower() or 'modern warfare 2' in f.lower()]
            icon_files = [f for f in files if 'icon' in f.lower() or 'render' in f.lower() or 'weapon' in f.lower()]
            prioritised = mw2_files + icon_files + files

            for file_title in prioritised:
                url, size = download_file_url(file_title)
                if url and size > 500:
                    img_url = url
                    break

        if not img_url:
            print(f'NO IMAGE: {page_title}')
            failed.append(filename)
            continue

        # Download
        img_resp = session.get(img_url, timeout=10)
        if img_resp.status_code == 200 and len(img_resp.content) > 500:
            with open(f'weapons/{filename}', 'wb') as f:
                f.write(img_resp.content)
            print(f'OK: {filename} ({len(img_resp.content):,} bytes)')
            found += 1
        else:
            print(f'BAD DOWNLOAD: {page_title} ({len(img_resp.content)} bytes)')
            failed.append(filename)

    except Exception as e:
        print(f'ERROR: {filename} -> {e}')
        failed.append(filename)

    time.sleep(0.3)

print(f'\n--- DONE: {found}/{len(weapons)} ---')
if failed:
    print(f'Missed: {", ".join(failed)}')