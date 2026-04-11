from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import atexit

scheduler = BackgroundScheduler()


def schedule_scraping():
    """Set up periodic scraping jobs for all product categories."""
    from scraper.ad_scraper import scrape_ads
    from nlp.expectation import extract_expectations
    import uuid
    from db.database import SessionLocal
    from db import models

    categories = ["Mutual Fund", "Insurance", "FD"]

    def _job():
        db = SessionLocal()
        try:
            for category in categories:
                result = scrape_ads(category)
                if not result["raw_text"]:
                    continue
                product = models.Product(
                    id=str(uuid.uuid4()),
                    name=f"Scheduled {category} Scrape",
                    category=category,
                    source_url=", ".join(result["source_urls"]),
                    raw_text=result["raw_text"],
                )
                db.add(product)
                db.commit()
                expectations = extract_expectations(result["raw_text"], category)
                exp = models.Expectation(
                    id=str(uuid.uuid4()),
                    product_id=product.id,
                    **{k: expectations.get(k) for k in ["risk_profile_score", "claimed_return", "annual_fee", "lock_in_period", "radar_data"]},
                )
                db.add(exp)
                db.commit()
                print(f"[Scheduler] Stored scheduled scrape for {category}: {product.id}")
        finally:
            db.close()

    # Run every 12 hours
    scheduler.add_job(
        func=_job,
        trigger=IntervalTrigger(hours=12),
        id="scrape_job",
        name="Periodic Financial Product Scrape",
        replace_existing=True,
    )
    scheduler.start()
    atexit.register(lambda: scheduler.shutdown())
    print("[Scheduler] Scraping scheduler started — runs every 12 hours.")
