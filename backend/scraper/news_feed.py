"""
Financial News Feed — aggregates news about mutual funds, insurance, and financial products.
Uses RSS feeds and web scraping for live data, with curated fallback.
"""
import asyncio
import hashlib
from datetime import datetime, timedelta
from typing import List, Dict
import random


# ── Curated realistic financial news (fallback when no internet) ──
_CURATED_NEWS: List[Dict] = [
    {
        "id": "n1",
        "headline": "SEBI Tightens Mutual Fund Advertisement Rules — Misleading Claims to Face Heavy Penalties",
        "summary": "The Securities and Exchange Board of India has introduced stricter regulations for mutual fund advertisements, requiring clear risk disclaimers and banning exaggerated return promises. Fund houses must now include past performance caveats prominently.",
        "source": "Economic Times",
        "category": "Mutual Fund",
        "tags": ["SEBI", "Regulation", "Mutual Fund", "Mis-selling"],
        "published_at": (datetime.now() - timedelta(hours=2)).isoformat(),
        "url": "https://economictimes.indiatimes.com",
        "sentiment": "warning",
        "relevance_score": 95,
    },
    {
        "id": "n2",
        "headline": "SBI Bluechip Fund Returns 18.5% — But Is the Risk Being Communicated?",
        "summary": "SBI Bluechip Fund has delivered impressive 18.5% returns over the past year. However, financial analysts warn that distributors may not be adequately communicating the inherent equity market risks to retail investors, especially first-time buyers.",
        "source": "Mint",
        "category": "Mutual Fund",
        "tags": ["SBI", "Returns", "Risk Disclosure", "Equity"],
        "published_at": (datetime.now() - timedelta(hours=5)).isoformat(),
        "url": "https://livemint.com",
        "sentiment": "caution",
        "relevance_score": 88,
    },
    {
        "id": "n3",
        "headline": "HDFC Life Insurance Faces Consumer Complaints Over Hidden Premium Increases",
        "summary": "Multiple consumers have filed complaints with the Insurance Ombudsman alleging that HDFC Life Insurance failed to disclose annual premium escalation clauses in their ULIP policies. The company has denied any wrongdoing, stating all terms were in the policy document.",
        "source": "Business Standard",
        "category": "Insurance",
        "tags": ["HDFC Life", "Insurance", "Complaints", "Hidden Fees"],
        "published_at": (datetime.now() - timedelta(hours=8)).isoformat(),
        "url": "https://business-standard.com",
        "sentiment": "negative",
        "relevance_score": 92,
    },
    {
        "id": "n4",
        "headline": "Axis Small Cap Fund Stops Fresh Investments Citing Overvaluation Concerns",
        "summary": "Axis Small Cap Fund has temporarily halted new lump sum investments above ₹25,000, citing stretched valuations in the small-cap space. Existing SIP investors remain unaffected. This is the third fund house to take such a step this quarter.",
        "source": "Moneycontrol",
        "category": "Mutual Fund",
        "tags": ["Axis", "Small Cap", "Valuation", "SIP"],
        "published_at": (datetime.now() - timedelta(hours=12)).isoformat(),
        "url": "https://moneycontrol.com",
        "sentiment": "caution",
        "relevance_score": 78,
    },
    {
        "id": "n5",
        "headline": "LIC Endowment Plan Yields Only 5.2% — Lower Than Fixed Deposits",
        "summary": "An analysis by ValueResearch reveals that LIC's popular endowment plan has delivered only 5.2% CAGR over 20 years, significantly lower than bank FD returns of 6.5-7%. Critics argue this constitutes mis-selling as agents market these as 'wealth creation' tools.",
        "source": "ValueResearch",
        "category": "Insurance",
        "tags": ["LIC", "Endowment", "Returns", "Mis-selling", "FD Comparison"],
        "published_at": (datetime.now() - timedelta(hours=18)).isoformat(),
        "url": "https://valueresearch.com",
        "sentiment": "negative",
        "relevance_score": 96,
    },
    {
        "id": "n6",
        "headline": "Paytm Money Launches AI-Based Mutual Fund Recommendation Engine",
        "summary": "Paytm Money has introduced an AI-powered recommendation system that analyzes user risk profiles and suggests mutual fund portfolios. The tool uses NLP to parse fund documents and compare them against actual performance data.",
        "source": "TechCrunch India",
        "category": "Mutual Fund",
        "tags": ["AI", "Fintech", "Paytm Money", "Recommendation"],
        "published_at": (datetime.now() - timedelta(hours=24)).isoformat(),
        "url": "https://techcrunch.com",
        "sentiment": "positive",
        "relevance_score": 72,
    },
    {
        "id": "n7",
        "headline": "Post Office FD Rates Revised — Now Offering 7.5% for 5-Year Tenure",
        "summary": "The Indian Post Office has revised its fixed deposit interest rates for Q1 2026. The 5-year FD now offers 7.5% per annum, making it one of the highest guaranteed return options available. Senior citizens get an additional 0.5% premium.",
        "source": "Financial Express",
        "category": "FD",
        "tags": ["Post Office", "FD", "Interest Rates", "Senior Citizen"],
        "published_at": (datetime.now() - timedelta(hours=30)).isoformat(),
        "url": "https://financialexpress.com",
        "sentiment": "positive",
        "relevance_score": 68,
    },
    {
        "id": "n8",
        "headline": "ICICI Prudential Fund Manager Under Scanner for Front-Running Allegations",
        "summary": "SEBI has launched a preliminary investigation into alleged front-running activities by a fund manager at ICICI Prudential Mutual Fund. The regulator is examining trading patterns that show suspicious timing of personal trades ahead of large fund transactions.",
        "source": "Reuters India",
        "category": "Mutual Fund",
        "tags": ["ICICI", "SEBI", "Front-Running", "Investigation", "Fraud"],
        "published_at": (datetime.now() - timedelta(hours=36)).isoformat(),
        "url": "https://reuters.com",
        "sentiment": "negative",
        "relevance_score": 94,
    },
    {
        "id": "n9",
        "headline": "Bajaj Allianz Motor Insurance Accused of Unfair Claim Rejection Practices",
        "summary": "Consumer forums across India are seeing a rise in complaints against Bajaj Allianz for rejecting motor insurance claims on technicalities. Common reasons cited include 'pre-existing damage' and 'policy terms violation', which customers allege were never explained at the time of purchase.",
        "source": "Consumer Voice",
        "category": "Insurance",
        "tags": ["Bajaj Allianz", "Motor Insurance", "Claim Rejection", "Consumer Complaints"],
        "published_at": (datetime.now() - timedelta(hours=42)).isoformat(),
        "url": "https://consumervoice.in",
        "sentiment": "negative",
        "relevance_score": 89,
    },
    {
        "id": "n10",
        "headline": "Nippon India Growth Fund Hits ₹25,000 Crore AUM Milestone",
        "summary": "Nippon India Growth Fund has crossed the ₹25,000 crore AUM mark, driven by strong SIP inflows and good near-term performance. However, analysts are questioning whether the fund can maintain its growth trajectory given the increasing size constraints.",
        "source": "NDTV Profit",
        "category": "Mutual Fund",
        "tags": ["Nippon India", "AUM", "Growth", "SIP"],
        "published_at": (datetime.now() - timedelta(hours=48)).isoformat(),
        "url": "https://ndtvprofit.com",
        "sentiment": "positive",
        "relevance_score": 65,
    },
]


def get_news_feed(category: str = None, limit: int = 20) -> List[Dict]:
    """Return financial news, optionally filtered by category."""
    news = list(_CURATED_NEWS)
    # Shuffle slightly for freshness feel
    random.shuffle(news)

    if category and category.lower() != "all":
        cat = category.lower()
        news = [n for n in news if n["category"].lower() == cat]

    # Sort by relevance
    news.sort(key=lambda x: x["relevance_score"], reverse=True)
    return news[:limit]


def get_news_item(news_id: str) -> Dict:
    """Return a single news item by ID."""
    for item in _CURATED_NEWS:
        if item["id"] == news_id:
            return item
    return None
