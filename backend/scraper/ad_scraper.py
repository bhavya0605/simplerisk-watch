import time
from typing import Dict, Any
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    )
}

# Category-specific scraping targets
AD_SOURCES = {
    "Mutual Fund": [
        "https://www.amfiindia.com/research-information/other-data/scheme-performance",
        "https://www.hdfcfund.com/our-products/equity",
    ],
    "Insurance": [
        "https://www.licindia.in/Products/Insurance-Plan",
        "https://www.policybazaar.com/life-insurance/",
    ],
    "FD": [
        "https://www.bankbazaar.com/fixed-deposit.html",
        "https://www.sbi.co.in/web/personal-banking/investments-deposits/deposits/fixed-deposit",
    ],
}


def _extract_ad_text(url: str) -> str:
    """Fetch a product advertisement page and extract visible text."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=12)
        soup = BeautifulSoup(resp.text, "lxml")
        # Remove nav, script, style tags
        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()
        return soup.get_text(separator=" ", strip=True)[:8000]  # cap at 8k chars
    except Exception as e:
        print(f"[AdScraper] Could not fetch {url}: {e}")
        return ""


def scrape_ads(category: str) -> Dict[str, Any]:
    """
    Scrape advertisement/product pages for a given category.
    Returns a dict with: raw_text (combined), source_urls (list).
    """
    urls = AD_SOURCES.get(category, [])
    all_text_parts = []
    successful_urls = []

    for url in urls:
        print(f"[AdScraper] Fetching {url}")
        text = _extract_ad_text(url)
        if text:
            all_text_parts.append(text)
            successful_urls.append(url)
        time.sleep(1.5)  # polite delay

    return {
        "raw_text": "\n\n".join(all_text_parts),
        "source_urls": successful_urls,
    }
