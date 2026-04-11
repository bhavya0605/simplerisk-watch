import os
import shutil
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from api.schemas import ProductOut
from db.config import settings

router = APIRouter(prefix="/api/products", tags=["products"])


def _run_analysis_pipeline(product_id: str):
    """Background task: runs PDF parsing + NLP + risk scoring + deep analysis for a product."""
    from db.database import SessionLocal
    from parser.pdf_extractor import extract_text_from_pdf
    from nlp.expectation import extract_expectations
    from nlp.sentiment import analyze_sentiment
    from nlp.risk_score import compute_risk_score
    from nlp.regulatory_engine import scan_for_violations
    from nlp.deep_analysis import deep_analyze_document, generate_llm_report_narrative, generate_feedback_deep_analysis

    db = SessionLocal()
    try:
        product = db.query(models.Product).filter(models.Product.id == product_id).first()
        if not product:
            return

        # Step 1: Parse PDF
        raw_text = ""
        if product.document_url and os.path.exists(product.document_url):
            raw_text = extract_text_from_pdf(product.document_url)
            product.raw_text = raw_text
            db.commit()

        # Step 2: Regulatory compliance scan (FIRST — feeds into everything)
        compliance = scan_for_violations(raw_text, product.category)
        
        # Step 3: Extract expectations from document text
        expectations = extract_expectations(raw_text, product.category)
        # If extraction found nothing, generate sensible defaults so charts aren't empty
        if not expectations or expectations.get("risk_profile_score") is None:
            cat = product.category.lower()
            defaults = {
                "mutual fund": {"risk_profile_score": 60, "claimed_return": 12.0, "annual_fee": 1.5, "lock_in_period": 36},
                "insurance": {"risk_profile_score": 40, "claimed_return": 6.0, "annual_fee": 2.5, "lock_in_period": 60},
                "fd": {"risk_profile_score": 15, "claimed_return": 7.0, "annual_fee": 0.0, "lock_in_period": 12},
            }
            d = defaults.get(cat, defaults["mutual fund"])
            expectations = {
                **d,
                "radar_data": [
                    {"dimension": "Returns", "value": 70, "fullMark": 100},
                    {"dimension": "Safety", "value": 50, "fullMark": 100},
                    {"dimension": "Liquidity", "value": 40, "fullMark": 100},
                    {"dimension": "Tax Benefit", "value": 60, "fullMark": 100},
                    {"dimension": "Transparency", "value": 55, "fullMark": 100},
                ],
            }
        
        # CRITICAL: Boost risk_profile_score based on compliance violations
        # This ensures consistency between violation count and risk assessment
        if compliance:
            critical = compliance.get("critical_violations", 0)
            high = compliance.get("high_violations", 0)
            total_violations = compliance.get("total_violations", 0)
            violation_boost = critical * 20 + high * 12 + max(0, total_violations - critical - high) * 5
            
            # If NON-COMPLIANT, risk profile CANNOT be below 70
            verdict = compliance.get("compliance_verdict", "")
            if verdict == "NON-COMPLIANT":
                expectations["risk_profile_score"] = max(expectations.get("risk_profile_score", 50), 70)
            
            if violation_boost > 0:
                original_rps = expectations.get("risk_profile_score", 50)
                boosted_rps = min(100, original_rps + violation_boost)
                expectations["risk_profile_score"] = boosted_rps
                print(f"[Pipeline] Risk profile boosted {original_rps} -> {boosted_rps} (+{violation_boost}) due to {total_violations} violations")
        
        exp_record = models.Expectation(
            id=str(uuid.uuid4()),
            product_id=product_id,
            risk_profile_score=expectations.get("risk_profile_score"),
            claimed_return=expectations.get("claimed_return"),
            annual_fee=expectations.get("annual_fee"),
            lock_in_period=expectations.get("lock_in_period"),
            radar_data=expectations.get("radar_data"),
        )
        db.merge(exp_record)
        db.commit()

        # Step 4: Fetch feedback from scraper and analyze sentiment
        from scraper.feedback_scraper import scrape_feedback
        feedback_texts = scrape_feedback(product.name, product.category)
        reality = analyze_sentiment(feedback_texts)
        
        # Step 4b: Deep feedback analysis using LLM
        deep_feedback = None
        if feedback_texts:
            deep_feedback = generate_feedback_deep_analysis(
                feedback_texts, product.name, product.category
            )
            if deep_feedback:
                # Override sentiment with LLM analysis for better accuracy
                if deep_feedback.get("overall_sentiment_score") is not None:
                    reality["average_sentiment"] = deep_feedback["overall_sentiment_score"]
                if deep_feedback.get("dissatisfaction_percentage") is not None:
                    reality["dissatisfaction_index"] = deep_feedback["dissatisfaction_percentage"]
                # Enrich complaint data
                if deep_feedback.get("complaint_categories"):
                    reality["complaint_data"] = [
                        {"name": c["category"], "value": c["percentage"]}
                        for c in deep_feedback["complaint_categories"]
                    ]
                    reality["top_topics"] = [
                        c["category"] for c in deep_feedback["complaint_categories"][:5]
                    ]
        
        reality_record = models.Reality(
            id=str(uuid.uuid4()),
            product_id=product_id,
            average_sentiment=reality.get("average_sentiment"),
            dissatisfaction_index=reality.get("dissatisfaction_index"),
            complaint_data=reality.get("complaint_data"),
            sentiment_distribution=reality.get("sentiment_distribution"),
            top_topics=reality.get("top_topics"),
            deep_feedback_analysis=deep_feedback,
        )
        db.merge(reality_record)
        db.commit()

        # Step 5: Compute risk score WITH compliance data
        risk = compute_risk_score(expectations, reality, compliance)
        risk_record = models.RiskEvaluation(
            id=str(uuid.uuid4()),
            product_id=product_id,
            comparison_data=risk.get("comparison_data"),
            gap_analysis_summary=risk.get("gap_analysis_summary"),
            overall_risk_score=risk.get("overall_risk_score"),
        )
        db.merge(risk_record)
        db.commit()


        # Step 6: Deep AI document analysis
        doc_analysis = deep_analyze_document(raw_text, product.name, product.category)
        
        # Step 7: Generate LLM report narrative
        report_narrative = generate_llm_report_narrative(
            product.name, product.category,
            doc_analysis, expectations, reality, risk, compliance
        )
        
        # Store deep analysis
        deep_record = models.DeepAnalysis(
            id=str(uuid.uuid4()),
            product_id=product_id,
            document_analysis=doc_analysis,
            compliance_scan=compliance,
            report_narrative=report_narrative,
            compliance_score=compliance.get("compliance_score"),
            risk_heatmap=doc_analysis.get("risk_heatmap_data") if doc_analysis else None,
            claims_analysis=doc_analysis.get("claims_analysis") if doc_analysis else None,
            consumer_advisory=doc_analysis.get("consumer_advisory") if doc_analysis else None,
            sebi_checklist=doc_analysis.get("sebi_compliance_checklist") if doc_analysis else None,
        )
        db.merge(deep_record)
        db.commit()
        
        print(f"[Pipeline] Full analysis complete for {product.name} (ID: {product_id})")

    except Exception as e:
        print(f"[Pipeline] Error in analysis: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


@router.post("/upload", response_model=ProductOut, status_code=201)
async def upload_product(
    background_tasks: BackgroundTasks,
    name: str = Form(...),
    category: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a financial product PDF and trigger the analysis pipeline."""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_id = str(uuid.uuid4())
    file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}_{file.filename}")
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    product = models.Product(
        id=str(uuid.uuid4()),
        name=name,
        category=category,
        document_url=file_path,
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    background_tasks.add_task(_run_analysis_pipeline, product.id)
    return product


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db)):
    return db.query(models.Product).order_by(models.Product.created_at.desc()).all()
