from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


# ---- Product Schemas ----

class ProductCreate(BaseModel):
    name: str
    category: str
    source_url: Optional[str] = None


class ProductOut(BaseModel):
    id: str
    name: str
    category: str
    document_url: Optional[str]
    source_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Expectation Schemas ----

class RadarDataPoint(BaseModel):
    dimension: str
    value: int
    fullMark: int


class ExpectationOut(BaseModel):
    id: str
    product_id: str
    risk_profile_score: Optional[int]
    claimed_return: Optional[float]
    annual_fee: Optional[float]
    lock_in_period: Optional[int]
    radar_data: Optional[List[RadarDataPoint]]

    class Config:
        from_attributes = True


# ---- Reality Schemas ----

class ComplaintCategory(BaseModel):
    name: str
    value: int


class SentimentBucket(BaseModel):
    range: str
    count: int


class RealityOut(BaseModel):
    id: str
    product_id: str
    average_sentiment: Optional[float]
    dissatisfaction_index: Optional[float]
    complaint_data: Optional[List[ComplaintCategory]]
    sentiment_distribution: Optional[List[SentimentBucket]]
    top_topics: Optional[List[str]]
    deep_feedback_analysis: Optional[Any] = None

    class Config:
        from_attributes = True


# ---- Risk Evaluation Schemas ----

class ComparisonMetric(BaseModel):
    metric: str
    promised: float
    actual: float
    gap: str


class RiskEvaluationOut(BaseModel):
    id: str
    product_id: str
    comparison_data: Optional[List[ComparisonMetric]]
    gap_analysis_summary: Optional[str]
    overall_risk_score: Optional[int]

    class Config:
        from_attributes = True

# ---- Auth Schemas ----

class UserCreate(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
