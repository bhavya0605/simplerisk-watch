import time
import re
from typing import List
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    )
}


def _scrape_jagoinvestor(product_name: str) -> List[str]:
    """Scrape forum threads from jagoinvestor.com matching the product name."""
    results = []
    try:
        query = product_name.replace(" ", "+")
        url = f"https://www.jagoinvestor.com/?s={query}"
        resp = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(resp.text, "lxml")
        for tag in soup.select("article p"):
            text = tag.get_text(strip=True)
            if len(text) > 40:
                results.append(text)
        time.sleep(1)
    except Exception as e:
        print(f"[FeedbackScraper/jagoinvestor] Error: {e}")
    return results


def _scrape_reddit(product_name: str) -> List[str]:
    """
    Use Reddit's old JSON API to search r/IndiaInvestments for mentions of the product.
    No auth required for public posts.
    """
    results = []
    try:
        query = product_name.replace(" ", "+")
        url = f"https://www.reddit.com/r/IndiaInvestments/search.json?q={query}&restrict_sr=1&sort=relevance&limit=20"
        resp = requests.get(url, headers=HEADERS, timeout=10)
        data = resp.json()
        for post in data.get("data", {}).get("children", []):
            body = post["data"].get("selftext", "")
            title = post["data"].get("title", "")
            if len(body) > 30:
                results.append(body)
            elif len(title) > 20:
                results.append(title)
        time.sleep(1)
    except Exception as e:
        print(f"[FeedbackScraper/reddit] Error: {e}")
    return results


def _scrape_moneycontrol_reviews(product_name: str, category: str) -> List[str]:
    """Scrape Moneycontrol fund/insurance review pages for user comments."""
    results = []
    try:
        query = product_name.replace(" ", "%20")
        # Moneycontrol fund search (public)
        url = f"https://www.moneycontrol.com/mutual-funds/performance-tracker/returns/large-cap-fund.html"
        resp = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(resp.text, "lxml")
        for tag in soup.select(".user-comment, .review-text, p"):
            text = tag.get_text(strip=True)
            if len(text) > 40 and product_name.lower() in text.lower():
                results.append(text)
        time.sleep(1)
    except Exception as e:
        print(f"[FeedbackScraper/moneycontrol] Error: {e}")
    return results


def scrape_feedback(product_name: str, category: str) -> List[str]:
    """
    Aggregate feedback from multiple sources for a given product.
    Returns a list of user-generated text strings for NLP analysis.
    """
    print(f"[FeedbackScraper] Scraping feedback for: {product_name} ({category})")
    all_feedback: List[str] = []

    all_feedback.extend(_scrape_jagoinvestor(product_name))
    all_feedback.extend(_scrape_reddit(product_name))
    all_feedback.extend(_scrape_moneycontrol_reviews(product_name, category))

    # Remove very short/noisy entries
    filtered = [t.strip() for t in all_feedback if len(t.strip()) > 30]
    print(f"[FeedbackScraper] Collected {len(filtered)} feedback snippets.")
    return filtered
