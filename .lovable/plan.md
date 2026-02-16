

## Overview

Replace all placeholder "chart area" boxes across Dashboard, Reality Analysis, Expectation Analysis, Comparison, and Reports pages with real data visualizations using Recharts (already installed). The UI will shift from wireframe placeholders to a professional, data-driven fintech dashboard while keeping the Architects Daughter font and black-and-white aesthetic.

## Pages to Update

### 1. Dashboard (`src/pages/Dashboard.tsx`)
- **Summary Cards**: Show clear numeric values (already present, will refine formatting)
- **Sentiment Bar Chart**: Replace placeholder with a Recharts BarChart showing Positive (28%), Neutral (30%), Negative (42%)
- **Sentiment Trend Line Chart**: Add a LineChart showing sentiment scores over 6 months
- **Expectation vs Reality Bar Chart**: Side-by-side grouped BarChart comparing Promised vs Actual risk, with gap percentage labels
- **Gap Score**: Display a calculated numeric gap score
- **Risk Gauge**: Semi-circle gauge using a custom PieChart (180-degree arc) with numeric score (0-100) and color-coded indicator (green/yellow/red -- the only color exception)

### 2. Reality Analysis (`src/pages/RealityAnalysis.tsx`)
- **Numeric scores**: Keep Average Sentiment Score and Dissatisfaction Index as bold numbers
- **Pie Chart**: Complaint Categories breakdown (Fees, Service, Hidden Charges, Others) using Recharts PieChart
- **Histogram**: Distribution of sentiment scores using BarChart with score ranges on X-axis

### 3. Expectation Analysis (`src/pages/ExpectationAnalysis.tsx`)
- **Risk Profile Score**: Numeric 0-100 display
- **Claimed Return Score**: 0-100 benchmark comparison bar
- **Radar Chart**: Recharts RadarChart comparing Risk, Return, Fees, Lock-in Period dimensions

### 4. Comparison (`src/pages/Comparison.tsx`)
- **Expectation vs Reality Chart**: Grouped BarChart with labeled axes and gap percentages
- **Risk Gauge**: Semi-circle gauge with numeric score and color indicator
- Keep Gap Analysis Summary list with real numbers

### 5. Reports (`src/pages/Reports.tsx`)
- **Line Chart**: Risk Score Over Time (6-month trend)
- **Bar Chart**: Product Comparison Risk Scores (5 products)
- **Data Table**: Structured table with columns for Product, Sentiment Score, Risk Score, Gap Percentage using the existing Table UI component

## Technical Approach

- Use the existing `ChartContainer`, `ChartTooltip`, `ChartTooltipContent` from `src/components/ui/chart.tsx`
- All charts use Recharts components (BarChart, LineChart, PieChart, RadarChart, ResponsiveContainer)
- Mock data arrays defined at the top of each page file
- Chart colors will use monochrome palette (black, dark gray, medium gray, light gray) to stay consistent with the wireframe aesthetic, with the exception of the risk gauge which uses green/yellow/red
- Axes will have clear titles and units
- Values displayed as labels on/above bars and data points
- The existing `WireBox` wrapper will still be used for section containers

## Files Modified

1. `src/pages/Dashboard.tsx` -- Full rewrite with 4 chart sections + summary cards
2. `src/pages/RealityAnalysis.tsx` -- Add PieChart + histogram BarChart
3. `src/pages/ExpectationAnalysis.tsx` -- Add RadarChart + score displays
4. `src/pages/Comparison.tsx` -- Add grouped BarChart + risk gauge
5. `src/pages/Reports.tsx` -- Add LineChart, BarChart, and data Table
