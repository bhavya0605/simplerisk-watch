"""
Chat engine — provides conversational Q&A about financial products.
Uses Gemini API when available, otherwise uses a smart rule-based fallback.
"""
import os
import json
import re
from typing import Dict, List, Optional
from dotenv import load_dotenv

def _get_gemini_response(messages: List[Dict], context: str) -> Optional[str]:
    """Try to get a response from Gemini API."""
    load_dotenv(override=True)
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-flash-latest")

        system_prompt = f"""You are a financial product analysis assistant for the SimpleRisk Watch platform.
You help users understand financial products, their risks, and potential mis-selling indicators.

CONTEXT about the current product/news being analyzed:
{context}

Guidelines:
- Be clear, specific, and informative
- Use simple language that non-financial experts can understand
- Always mention risks alongside returns
- If you detect potential mis-selling patterns, flag them clearly
- Provide actionable advice when possible
- Keep responses concise but thorough (2-4 paragraphs)
- Use bullet points for key takeaways
"""

        chat_history = []
        for msg in messages[:-1]:
            role = "user" if msg["role"] == "user" else "model"
            chat_history.append({"role": role, "parts": [msg["content"]]})

        chat = model.start_chat(history=chat_history)
        latest_msg = messages[-1]["content"]

        response = chat.send_message(f"{system_prompt}\n\nUser question: {latest_msg}")
        return response.text

    except Exception as e:
        print(f"[Chat] Gemini error: {e}")
        return None


def _rule_based_response(question: str, context: Dict) -> str:
    """Smart rule-based fallback when no LLM is available."""
    q = question.lower().strip()
    product = context.get("product_name", "this product")
    category = context.get("category", "financial product")
    headline = context.get("headline", "")
    summary = context.get("summary", "")
    risk_score = context.get("risk_score", None)
    sentiment = context.get("sentiment_score", None)

    # ── Risk-related questions ──
    if any(w in q for w in ["risk", "risky", "safe", "dangerous", "secure"]):
        if risk_score is not None:
            if risk_score > 66:
                return (
                    f"## ⚠️ High Risk Assessment\n\n"
                    f"Based on our analysis, **{product}** has a concerning risk score of **{risk_score}/100**.\n\n"
                    f"### Key Risk Factors:\n"
                    f"- **Customer feedback** indicates significant dissatisfaction\n"
                    f"- **Gap between promises and reality** is substantial\n"
                    f"- **Complaint patterns** suggest systemic issues\n\n"
                    f"### What You Should Do:\n"
                    f"1. Exercise extreme caution before investing\n"
                    f"2. Read all fine print carefully, especially fee disclosures\n"
                    f"3. Compare with alternatives in the same category\n"
                    f"4. Consider consulting a SEBI-registered financial advisor"
                )
            elif risk_score > 33:
                return (
                    f"## ⚡ Moderate Risk\n\n"
                    f"**{product}** shows a moderate risk score of **{risk_score}/100**.\n\n"
                    f"This means there are some gaps between what's promised and what customers actually experience, "
                    f"but it's not critically alarming.\n\n"
                    f"### Suggestions:\n"
                    f"- Monitor the product's performance regularly\n"
                    f"- Check recent customer reviews on independent platforms\n"
                    f"- Ensure you understand all fee structures before investing"
                )
            else:
                return (
                    f"## ✅ Low Risk\n\n"
                    f"**{product}** has a low risk score of **{risk_score}/100**, which is reassuring.\n\n"
                    f"Customer feedback generally aligns with the product's marketed claims. "
                    f"However, always remember:\n\n"
                    f"- Past performance doesn't guarantee future returns\n"
                    f"- Read the offer document before investing\n"
                    f"- Review your investment periodically"
                )
        return (
            f"Risk assessment for **{product}** requires detailed analysis. "
            f"Upload the product document on the Product Upload page for a comprehensive risk evaluation."
        )

    # ── Returns/performance questions ──
    if any(w in q for w in ["return", "performance", "yield", "profit", "earning", "money"]):
        return (
            f"## 📈 Returns Analysis\n\n"
            f"When evaluating returns for **{product}** ({category}), consider:\n\n"
            f"### Key Checks:\n"
            f"- **Claimed vs Actual**: Compare the advertised returns against real performance data on AMFI or Value Research\n"
            f"- **Time Period**: Returns over 1 year can be misleading — always check 3-year and 5-year CAGR\n"
            f"- **Benchmark**: Compare against the relevant benchmark index (e.g., Nifty 50 for large-cap funds)\n"
            f"- **Risk-Adjusted**: High returns with high volatility may not be suitable for all investors\n\n"
            f"### ⚠️ Watch For:\n"
            f"- Funds showing returns from a specific favorable date range\n"
            f"- Omission of expense ratio impact on net returns\n"
            f"- 'Guaranteed return' claims (illegal for mutual funds in India)"
        )

    # ── Mis-selling questions ──
    if any(w in q for w in ["mis-sell", "missell", "fraud", "scam", "cheat", "mislead", "fake"]):
        return (
            f"## 🚨 Mis-Selling Detection\n\n"
            f"Common mis-selling patterns to watch for in **{category}** products:\n\n"
            f"### Red Flags:\n"
            f"1. **Guaranteed Returns**: No market-linked product can guarantee returns\n"
            f"2. **Hidden Fees**: Charges not disclosed upfront (exit loads, transaction fees)\n"
            f"3. **Unsuitable Risk**: Selling high-risk products to conservative investors\n"
            f"4. **Incomplete Information**: Not explaining lock-in periods or penalties\n"
            f"5. **Pressure Tactics**: Urgency-based selling (\"offer expires today\")\n\n"
            f"### Your Rights:\n"
            f"- File a complaint with SEBI (for securities) or IRDAI (for insurance)\n"
            f"- Contact the fund house's grievance cell\n"
            f"- Approach the Consumer Forum for dispute resolution"
        )

    # ── Fee/charges questions ──
    if any(w in q for w in ["fee", "charge", "cost", "expense", "ter", "load"]):
        return (
            f"## 💰 Fee Structure Analysis\n\n"
            f"Understanding fees is crucial for evaluating **{product}**:\n\n"
            f"### Common Fee Components ({category}):\n"
            f"- **Expense Ratio (TER)**: Annual fee deducted from your investment (typically 0.5-2.5%)\n"
            f"- **Exit Load**: Penalty for early redemption (e.g., 1% if redeemed within 1 year)\n"
            f"- **Transaction Charges**: One-time charges on investments above ₹10,000\n"
            f"- **Hidden Fees**: Sometimes embedded in product structure\n\n"
            f"### 💡 Tip:\n"
            f"Always check the \"Total Expense Ratio\" in the factsheet. A difference of even 0.5% "
            f"compounds significantly over 10-20 years."
        )

    # ── How to invest / what should I do ──
    if any(w in q for w in ["invest", "buy", "should i", "recommend", "suggest", "what to do"]):
        return (
            f"## 🎯 Investment Guidance\n\n"
            f"Before investing in **{product}** ({category}), consider:\n\n"
            f"### Self-Assessment:\n"
            f"1. **Risk Tolerance**: Can you handle 20-30% drops in market-linked products?\n"
            f"2. **Time Horizon**: How long can you stay invested? (min 5+ years for equity)\n"
            f"3. **Goal**: Is this for retirement, child education, or short-term needs?\n"
            f"4. **Existing Portfolio**: Does this complement or duplicate your current investments?\n\n"
            f"### Due Diligence Steps:\n"
            f"- Check the fund/product rating on ValueResearch or Morningstar\n"
            f"- Read the scheme information document (SID)\n"
            f"- Compare with at least 3 alternatives in the same category\n"
            f"- Start with SIP rather than lump sum for equity products\n\n"
            f"*Note: This is educational information, not personalized financial advice.*"
        )

    # ── News/context questions ──
    if headline and any(w in q for w in ["news", "article", "headline", "about", "what", "explain", "tell", "mean"]):
        return (
            f"## 📰 About This News\n\n"
            f"**{headline}**\n\n"
            f"{summary}\n\n"
            f"### Why This Matters:\n"
            f"This news is relevant because it impacts how **{category}** products are sold and regulated. "
            f"Staying informed about regulatory changes and product performance helps you make better investment decisions "
            f"and spot potential mis-selling before it affects your finances.\n\n"
            f"### What You Can Do:\n"
            f"- If you hold a similar product, review your investment documents\n"
            f"- Check if any of the mentioned issues apply to your investments\n"
            f"- Consider using our analysis tools to evaluate your specific products"
        )

    # ── Default/general ──
    return (
        f"## 💡 Product Analysis\n\n"
        f"I can help you understand **{product}** ({category}) better. Here are some things you can ask me:\n\n"
        f"- **\"What are the risks?\"** — Get a risk assessment\n"
        f"- **\"Are the returns genuine?\"** — Verify return claims\n"
        f"- **\"What are the hidden fees?\"** — Understand the fee structure\n"
        f"- **\"Is this mis-selling?\"** — Check for red flags\n"
        f"- **\"Should I invest?\"** — Get guidance before investing\n"
        f"- **\"Explain this news\"** — Understand the context\n\n"
        f"Feel free to ask anything about financial products, and I'll provide clear, "
        f"jargon-free analysis."
    )


def get_chat_response(messages: List[Dict], context: Dict) -> str:
    """Get a chat response — tries Gemini first, falls back to rule-based."""
    context_str = json.dumps(context, indent=2, default=str)

    # Try Gemini
    gemini_response = _get_gemini_response(messages, context_str)
    if gemini_response:
        return gemini_response

    # Fallback
    latest_question = messages[-1]["content"] if messages else ""
    return _rule_based_response(latest_question, context)
