import uuid
from fastapi import APIRouter, Depends, BackgroundTasks, Query
from sqlalchemy.orm import Session
from db.database import get_db
from db import models

router = APIRouter(prefix="/api/scrape", tags=["scraper"])


def _scrape_and_store(category: str):
    """Background task: scrape ads for a category and store products."""
    from db.database import SessionLocal
    from scraper.ad_scraper import scrape_ads
    from nlp.expectation import extract_expectations

    db = SessionLocal()
    try:
        result = scrape_ads(category)
        if not result["raw_text"]:
            return

        product = models.Product(
            id=str(uuid.uuid4()),
            name=f"Scraped {category} Product",
            category=category,
            source_url=", ".join(result["source_urls"]),
            raw_text=result["raw_text"],
        )
        db.add(product)
        db.commit()
        db.refresh(product)

        expectations = extract_expectations(result["raw_text"], category)
        exp_record = models.Expectation(
            id=str(uuid.uuid4()),
            product_id=product.id,
            risk_profile_score=expectations.get("risk_profile_score"),
            claimed_return=expectations.get("claimed_return"),
            annual_fee=expectations.get("annual_fee"),
            lock_in_period=expectations.get("lock_in_period"),
            radar_data=expectations.get("radar_data"),
        )
        db.add(exp_record)
        db.commit()
        print(f"[ScrapeRoute] Stored scraped product: {product.id}")
    finally:
        db.close()


@router.post("/")
async def trigger_scrape(
    background_tasks: BackgroundTasks,
    category: str = Query(..., description="Mutual Fund, Insurance, or FD"),
):
    """Manually trigger a scrape job for a given product category."""
    background_tasks.add_task(_scrape_and_store, category)
    return {"message": f"Scraping triggered for category: {category}"}
