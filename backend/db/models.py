import uuid
from sqlalchemy import Column, String, Float, Integer, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # Mutual Fund, Insurance, FD
    document_url = Column(String, nullable=True)
    source_url = Column(String, nullable=True)  # URL scraped from
    raw_text = Column(Text, nullable=True)       # Extracted text from PDF or scrape
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    expectation = relationship("Expectation", back_populates="product", uselist=False, cascade="all, delete-orphan")
    reality = relationship("Reality", back_populates="product", uselist=False, cascade="all, delete-orphan")
    risk_evaluation = relationship("RiskEvaluation", back_populates="product", uselist=False, cascade="all, delete-orphan")
    deep_analysis = relationship("DeepAnalysis", back_populates="product", uselist=False, cascade="all, delete-orphan")


class Expectation(Base):
    __tablename__ = "expectations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, ForeignKey("products.id"), unique=True, nullable=False)
    product = relationship("Product", back_populates="expectation")

    risk_profile_score = Column(Integer, nullable=True)   # 0-100
    claimed_return = Column(Float, nullable=True)         # % per annum
    annual_fee = Column(Float, nullable=True)             # % (expense ratio)
    lock_in_period = Column(Integer, nullable=True)       # months

    # JSON: [{dimension: str, value: int, fullMark: int}]
    radar_data = Column(JSON, nullable=True)


class Reality(Base):
    __tablename__ = "reality"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, ForeignKey("products.id"), unique=True, nullable=False)
    product = relationship("Product", back_populates="reality")

    average_sentiment = Column(Float, nullable=True)        # 0-100
    dissatisfaction_index = Column(Float, nullable=True)    # % of negative reviews

    # JSON: [{name: str, value: int}] — pie chart data
    complaint_data = Column(JSON, nullable=True)

    # JSON: [{range: str, count: int}] — histogram data
    sentiment_distribution = Column(JSON, nullable=True)

    # JSON: [str] — top complaint topics
    top_topics = Column(JSON, nullable=True)
    
    # JSON: deep feedback analysis from LLM
    deep_feedback_analysis = Column(JSON, nullable=True)


class RiskEvaluation(Base):
    __tablename__ = "risk_evaluations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, ForeignKey("products.id"), unique=True, nullable=False)
    product = relationship("Product", back_populates="risk_evaluation")

    # JSON: [{metric: str, promised: int, actual: int, gap: str}]
    comparison_data = Column(JSON, nullable=True)

    gap_analysis_summary = Column(Text, nullable=True)
    overall_risk_score = Column(Integer, nullable=True)     # 0-100


class DeepAnalysis(Base):
    """Stores comprehensive AI-powered deep analysis results."""
    __tablename__ = "deep_analyses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, ForeignKey("products.id"), unique=True, nullable=False)
    product = relationship("Product", back_populates="deep_analysis")

    # Full deep analysis JSON from Gemini
    document_analysis = Column(JSON, nullable=True)
    
    # Regulatory compliance scan results
    compliance_scan = Column(JSON, nullable=True)
    
    # LLM-generated report narrative
    report_narrative = Column(JSON, nullable=True)
    
    # Compliance score 0-100
    compliance_score = Column(Integer, nullable=True)
    
    # Risk heatmap data JSON
    risk_heatmap = Column(JSON, nullable=True)
    
    # Claims analysis JSON
    claims_analysis = Column(JSON, nullable=True)
    
    # Consumer advisory JSON
    consumer_advisory = Column(JSON, nullable=True)
    
    # SEBI compliance checklist JSON
    sebi_checklist = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
