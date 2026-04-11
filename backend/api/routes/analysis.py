from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from api.schemas import ExpectationOut, RealityOut, RiskEvaluationOut

router = APIRouter(prefix="/api/products", tags=["analysis"])


@router.get("/{product_id}/expectation", response_model=ExpectationOut)
def get_expectation(product_id: str, db: Session = Depends(get_db)):
    record = (
        db.query(models.Expectation)
        .filter(models.Expectation.product_id == product_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Expectation data not ready yet. Analysis may still be running.")
    return record


@router.get("/{product_id}/reality", response_model=RealityOut)
def get_reality(product_id: str, db: Session = Depends(get_db)):
    record = (
        db.query(models.Reality)
        .filter(models.Reality.product_id == product_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Reality data not ready yet. Analysis may still be running.")
    return record


@router.get("/{product_id}/comparison", response_model=RiskEvaluationOut)
def get_comparison(product_id: str, db: Session = Depends(get_db)):
    record = (
        db.query(models.RiskEvaluation)
        .filter(models.RiskEvaluation.product_id == product_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Risk evaluation not ready yet. Analysis may still be running.")
    return record


@router.get("/{product_id}/deep-analysis")
def get_deep_analysis(product_id: str, db: Session = Depends(get_db)):
    """Return the comprehensive deep analysis for a product."""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    deep = db.query(models.DeepAnalysis).filter(models.DeepAnalysis.product_id == product_id).first()
    if not deep:
        raise HTTPException(status_code=404, detail="Deep analysis not ready yet. Analysis may still be running.")
    
    reality = db.query(models.Reality).filter(models.Reality.product_id == product_id).first()
    
    return {
        "product_id": product_id,
        "product_name": product.name,
        "category": product.category,
        "document_analysis": deep.document_analysis,
        "compliance_scan": deep.compliance_scan,
        "report_narrative": deep.report_narrative,
        "compliance_score": deep.compliance_score,
        "risk_heatmap": deep.risk_heatmap,
        "claims_analysis": deep.claims_analysis,
        "consumer_advisory": deep.consumer_advisory,
        "sebi_checklist": deep.sebi_checklist,
        "deep_feedback": reality.deep_feedback_analysis if reality else None,
    }


@router.get("/{product_id}/insights")
def get_insights(product_id: str, db: Session = Depends(get_db)):
    """Return comprehensive AI-generated insights for a product."""
    from nlp.insights import (
        generate_metric_insight,
        generate_gap_analysis,
        generate_ai_summary,
        generate_chart_annotations,
    )

    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    expectation = db.query(models.Expectation).filter(models.Expectation.product_id == product_id).first()
    reality = db.query(models.Reality).filter(models.Reality.product_id == product_id).first()
    risk = db.query(models.RiskEvaluation).filter(models.RiskEvaluation.product_id == product_id).first()
    deep = db.query(models.DeepAnalysis).filter(models.DeepAnalysis.product_id == product_id).first()

    # Convert ORM objects to dicts
    exp_dict = {}
    if expectation:
        exp_dict = {
            "risk_profile_score": expectation.risk_profile_score,
            "claimed_return": expectation.claimed_return,
            "annual_fee": expectation.annual_fee,
            "lock_in_period": expectation.lock_in_period,
            "radar_data": expectation.radar_data or [],
        }

    reality_dict = {}
    if reality:
        reality_dict = {
            "average_sentiment": reality.average_sentiment,
            "dissatisfaction_index": reality.dissatisfaction_index,
            "complaint_data": reality.complaint_data or [],
            "sentiment_distribution": reality.sentiment_distribution or [],
            "top_topics": reality.top_topics or [],
        }

    risk_dict = {}
    if risk:
        risk_dict = {
            "comparison_data": risk.comparison_data or [],
            "gap_analysis_summary": risk.gap_analysis_summary,
            "overall_risk_score": risk.overall_risk_score,
        }

    # Generate all insight blocks
    sentiment_insight = generate_metric_insight(
        "sentiment",
        reality_dict.get("average_sentiment", 50) or 50,
        reality_dict,
    )

    dissatisfaction_insight = generate_metric_insight(
        "dissatisfaction",
        reality_dict.get("dissatisfaction_index", 0) or 0,
        reality_dict,
    )

    from nlp.insights import _compute_risk_weights
    risk_insight = generate_metric_insight(
        "risk_score",
        risk_dict.get("overall_risk_score", 0) or 0,
        {"weight_breakdown": _compute_risk_weights(exp_dict, reality_dict)},
    )

    gap_analysis = generate_gap_analysis(
        risk_dict.get("comparison_data", []),
        exp_dict,
        reality_dict,
    )

    ai_summary = generate_ai_summary(
        product.name,
        product.category,
        exp_dict,
        reality_dict,
        risk_dict,
    )

    # Chart annotations
    chart_annotations = {
        "complaint_pie": generate_chart_annotations("complaint_pie", reality_dict.get("complaint_data", [])),
        "sentiment_histogram": generate_chart_annotations("sentiment_histogram", reality_dict.get("sentiment_distribution", [])),
        "comparison_bar": generate_chart_annotations("comparison_bar", risk_dict.get("comparison_data", [])),
        "radar": generate_chart_annotations("radar", exp_dict.get("radar_data", [])),
    }
    
    # Enrich with deep analysis data
    deep_data = {}
    if deep:
        deep_data = {
            "compliance_score": deep.compliance_score,
            "compliance_scan": deep.compliance_scan,
            "report_narrative": deep.report_narrative,
            "document_analysis": deep.document_analysis,
            "risk_heatmap": deep.risk_heatmap,
            "claims_analysis": deep.claims_analysis,
            "consumer_advisory": deep.consumer_advisory,
            "sebi_checklist": deep.sebi_checklist,
        }

    return {
        "product_id": product_id,
        "product_name": product.name,
        "category": product.category,
        "sentiment_insight": sentiment_insight,
        "dissatisfaction_insight": dissatisfaction_insight,
        "risk_insight": risk_insight,
        "gap_analysis": gap_analysis,
        "ai_summary": ai_summary,
        "chart_annotations": chart_annotations,
        "deep_analysis": deep_data,
    }


@router.get("/{product_id}/report")
def get_report(product_id: str, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    expectation = db.query(models.Expectation).filter(models.Expectation.product_id == product_id).first()
    reality = db.query(models.Reality).filter(models.Reality.product_id == product_id).first()
    risk = db.query(models.RiskEvaluation).filter(models.RiskEvaluation.product_id == product_id).first()
    deep = db.query(models.DeepAnalysis).filter(models.DeepAnalysis.product_id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return {
        "product": product,
        "expectation": expectation,
        "reality": reality,
        "risk_evaluation": risk,
        "deep_analysis": deep,
    }
