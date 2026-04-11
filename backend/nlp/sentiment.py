from typing import List, Dict, Any
from collections import Counter
import re


# Complaint topic keyword groups
COMPLAINT_TOPICS = {
    "Mis-selling": ["mis-sell", "missell", "lied", "cheated", "deceived", "false claim", "mislead"],
    "Hidden Fees": ["hidden fee", "extra charge", "undisclosed", "surprise charge", "unexpected fee"],
    "Low Returns": ["low return", "bad return", "no profit", "loss", "underperform", "worse than expected"],
    "Poor Service": ["poor service", "bad support", "rude", "unresponsive", "no help", "ignored"],
    "Liquidity Issues": ["can't withdraw", "locked", "redemption problem", "fund frozen", "no liquidity"],
}

POSITIVE_KEYWORDS = ["good", "great", "excellent", "happy", "satisfied", "recommend", "best", "profit", "nice", "helpful"]
NEGATIVE_KEYWORDS = ["bad", "worst", "terrible", "cheat", "scam", "fraud", "loss", "poor", "disappoint", "useless", "avoid"]


def _simple_sentiment_score(text: str) -> float:
    """Returns a 0–100 sentiment score using keyword matching (0=negative, 100=positive)."""
    text_lower = text.lower()
    pos = sum(1 for kw in POSITIVE_KEYWORDS if kw in text_lower)
    neg = sum(1 for kw in NEGATIVE_KEYWORDS if kw in text_lower)
    total = pos + neg
    if total == 0:
        return 50.0
    return round((pos / total) * 100, 1)


def _classify_complaint(text: str) -> str:
    """Returns the primary complaint category for a piece of text."""
    text_lower = text.lower()
    best_match = "Other"
    best_count = 0
    for category, keywords in COMPLAINT_TOPICS.items():
        count = sum(1 for kw in keywords if kw in text_lower)
        if count > best_count:
            best_count = count
            best_match = category
    return best_match


def _build_sentiment_distribution(scores: List[float]) -> List[Dict]:
    """Bucket sentiment scores into histogram ranges."""
    buckets = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
    for score in scores:
        if score <= 20:
            buckets["0-20"] += 1
        elif score <= 40:
            buckets["21-40"] += 1
        elif score <= 60:
            buckets["41-60"] += 1
        elif score <= 80:
            buckets["61-80"] += 1
        else:
            buckets["81-100"] += 1
    return [{"range": r, "count": c} for r, c in buckets.items()]


def analyze_sentiment(feedback_texts: List[str]) -> Dict[str, Any]:
    """
    Analyze a list of customer feedback strings.
    Returns reality metrics: average sentiment, dissatisfaction index,
    complaint categories, score distribution, and top topics.
    """
    if not feedback_texts:
        return {
            "average_sentiment": None,
            "dissatisfaction_index": None,
            "complaint_data": [],
            "sentiment_distribution": [],
            "top_topics": [],
        }

    scores = [_simple_sentiment_score(text) for text in feedback_texts]
    categories = [_classify_complaint(text) for text in feedback_texts]

    avg_sentiment = round(sum(scores) / len(scores), 1)
    negative_count = sum(1 for s in scores if s < 40)
    dissatisfaction_index = round((negative_count / len(scores)) * 100, 1)

    # Complaint category breakdown (pie chart)
    category_counter = Counter(categories)
    total_complaints = sum(category_counter.values())
    complaint_data = [
        {"name": cat, "value": round((count / total_complaints) * 100)}
        for cat, count in category_counter.most_common()
    ]

    # Sentiment distribution (histogram)
    sentiment_distribution = _build_sentiment_distribution(scores)

    # Top topics: all unique categories that appeared
    top_topics = [item["name"] for item in complaint_data[:5]]

    return {
        "average_sentiment": avg_sentiment,
        "dissatisfaction_index": dissatisfaction_index,
        "complaint_data": complaint_data,
        "sentiment_distribution": sentiment_distribution,
        "top_topics": top_topics,
    }
