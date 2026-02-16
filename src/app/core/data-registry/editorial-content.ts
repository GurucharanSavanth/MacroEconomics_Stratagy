import {
  CountryCaseStudy,
  KeyFact,
  SpilloverTier,
  SpillbackStep,
  RateTimelinePoint,
  CurrencyDepreciationEntry
} from '../models/atlas.model';

export const HERO_STATS = [
  { num: '525bp', label: 'Fed rate hike magnitude (2022-2023)' },
  { num: '25', label: 'Countries in debt distress or high risk' },
  { num: '$83B', label: 'Capital fled emerging markets (2022)' },
  { num: '95%', label: 'Central banks tightened simultaneously' }
];

export const TICKER_CRISIS_DATA = [
  'SRI LANKA RESERVES $1.9B (IMPORT COVER: 1.2 MO)',
  'ARGENTINA POLICY RATE 97% (OCT 2023)',
  'PAKISTAN CPI 38% YOY (MAY 2023)',
  'GHANA CEDI -54% VS USD (2022)',
  'TURKEY LIRA -44% (2021-2022)',
  'EGYPT POUND -50% DEVALUATION (2022-2023)',
  'FED FUNDS 5.25-5.50% (PEAK JUL 2023)',
  'ECB DEPOSIT RATE 4.0% (SEP 2023)',
  'GLOBAL DEBT $307T (IIF 2023)',
  'EM BOND OUTFLOWS -$70B (2022)',
  'ZAMBIA EUROBOND DEFAULT NOV 2020',
  'LEBANON HYPERINFLATION 269% (2023)'
];

export const KEY_FACTS: KeyFact[] = [
  {
    id: 'kf-1',
    number: '525bp',
    text: 'The Federal Reserve raised interest rates by 525 basis points between March 2022 and July 2023 — the fastest tightening cycle in four decades.',
    source: 'Federal Reserve Board, 2023',
    color: '#e84040'
  },
  {
    id: 'kf-2',
    number: '$83B',
    text: 'Net capital outflows from emerging markets reached $83 billion in 2022, driven by rising US yields and dollar strength.',
    source: 'IIF Capital Flows Tracker, 2023',
    color: '#c9a84c'
  },
  {
    id: 'kf-3',
    number: '60%',
    text: 'Approximately 60% of low-income countries are in or at high risk of debt distress as of 2023, up from 30% in 2015.',
    source: 'IMF/World Bank DSA, 2023',
    color: '#e84040'
  },
  {
    id: 'kf-4',
    number: '95%',
    text: 'At the peak of the tightening cycle, 95% of tracked central banks were simultaneously raising rates — unprecedented synchronization.',
    source: 'BIS CBPOL Database, 2023',
    color: '#00c9a7'
  },
  {
    id: 'kf-5',
    number: '$307T',
    text: 'Global debt reached a record $307 trillion in 2023. Developing countries owe $100 trillion, with rising shares denominated in USD.',
    source: 'Institute of International Finance, 2023',
    color: '#4a90e2'
  },
  {
    id: 'kf-6',
    number: '88%',
    text: 'The US dollar is involved in 88% of all foreign exchange transactions, making Fed policy the de facto global monetary policy.',
    source: 'BIS Triennial Survey, 2022',
    color: '#c9a84c'
  },
  {
    id: 'kf-7',
    number: '3.7x',
    text: 'Developing countries pay 3.7 times more in interest than advanced economies relative to revenue, crowding out health and education spending.',
    source: 'UN DESA Financing for Development, 2023',
    color: '#e84040'
  },
  {
    id: 'kf-8',
    number: '14%',
    text: 'Average currency depreciation against the USD for frontier markets was 14% in 2022, amplifying dollar-denominated debt burdens.',
    source: 'IMF World Economic Outlook, 2023',
    color: '#00c9a7'
  }
];

export const CASE_STUDIES: CountryCaseStudy[] = [
  {
    id: 'cs-lka',
    country: 'Sri Lanka',
    flag: 'LK',
    narrative:
      'Sri Lanka became the first Asia-Pacific sovereign default in two decades when it suspended foreign debt payments in April 2022. With foreign reserves falling to just $1.9 billion (barely one month of imports), the country faced a balance-of-payments crisis exacerbated by the Fed tightening cycle. The Sri Lankan rupee depreciated 80% against the dollar, inflation surged past 70%, and the central bank raised rates to 14.5%. IMF approved a $2.9 billion bailout in March 2023.',
    keyFact: 'Foreign reserves fell from $7.5B to $1.9B in 18 months',
    metrics: [
      { label: 'Currency depreciation vs USD', value: 80, max: 100, unit: '%', color: '#e84040' },
      { label: 'Peak inflation rate', value: 70, max: 100, unit: '%', color: '#c9a84c' },
      { label: 'Debt-to-GDP ratio', value: 128, max: 200, unit: '%', color: '#e84040' },
      { label: 'Central bank rate (peak)', value: 14.5, max: 30, unit: '%', color: '#00c9a7' }
    ]
  },
  {
    id: 'cs-gha',
    country: 'Ghana',
    flag: 'GH',
    narrative:
      'Ghana\'s cedi lost 54% of its value against the dollar in 2022, making it one of the worst-performing currencies globally. The country\'s debt-to-GDP ratio exceeded 100%, and it was forced to seek a $3 billion IMF program. Ghana launched a domestic debt exchange program (DDEP) that imposed haircuts on local bondholders — a rare move that shook investor confidence. The central bank raised its policy rate to 30%, the highest in over two decades.',
    keyFact: 'Ghana\'s debt-to-GDP exceeded 100% for the first time',
    metrics: [
      { label: 'Currency depreciation vs USD', value: 54, max: 100, unit: '%', color: '#e84040' },
      { label: 'Debt-to-GDP ratio', value: 105, max: 200, unit: '%', color: '#c9a84c' },
      { label: 'Policy rate (peak)', value: 30, max: 50, unit: '%', color: '#e84040' },
      { label: 'Inflation rate', value: 54, max: 100, unit: '%', color: '#00c9a7' }
    ]
  },
  {
    id: 'cs-pak',
    country: 'Pakistan',
    flag: 'PK',
    narrative:
      'Pakistan teetered on the edge of default through 2022-2023, with reserves falling below $3 billion — barely 3 weeks of import cover. The rupee lost 36% against the dollar, and inflation exceeded 38%. Pakistan secured a last-minute $3 billion IMF Stand-By Arrangement in July 2023 after months of negotiations. The country imposed import restrictions and capital controls, choking economic growth while trying to stabilize the currency.',
    keyFact: 'Reserves fell to $3B — under 3 weeks of import cover',
    metrics: [
      { label: 'Currency depreciation vs USD', value: 36, max: 100, unit: '%', color: '#e84040' },
      { label: 'Peak inflation (CPI YoY)', value: 38, max: 60, unit: '%', color: '#c9a84c' },
      { label: 'Policy rate (peak)', value: 22, max: 50, unit: '%', color: '#e84040' },
      { label: 'External debt / GDP', value: 33, max: 60, unit: '%', color: '#00c9a7' }
    ]
  },
  {
    id: 'cs-arg',
    country: 'Argentina',
    flag: 'AR',
    narrative:
      'Argentina faced its perennial challenge of dollar-denominated debt and capital flight, amplified by the global tightening cycle. The peso lost over 50% of its value in the parallel (blue dollar) market, and the central bank raised its benchmark rate to 97% in October 2023. Annual inflation exceeded 140%, the highest since 1991. The country restructured $65 billion in sovereign bonds and imposed strict capital controls. Argentina\'s country risk premium surged above 2,500 basis points.',
    keyFact: 'Policy rate reached 97% — highest in Argentina\'s modern history',
    metrics: [
      { label: 'Annual inflation rate', value: 140, max: 200, unit: '%', color: '#e84040' },
      { label: 'Policy rate (peak)', value: 97, max: 120, unit: '%', color: '#c9a84c' },
      { label: 'Parallel market premium', value: 100, max: 150, unit: '%', color: '#e84040' },
      { label: 'Debt restructured', value: 65, max: 100, unit: '$B', color: '#4a90e2' }
    ]
  },
  {
    id: 'cs-tur',
    country: 'Turkey',
    flag: 'TR',
    narrative:
      'Turkey pursued an unconventional monetary policy — cutting rates while inflation surged — creating an extreme divergence from the global tightening trend. The lira lost 44% against the dollar in 2021-2022 and inflation peaked at 85%. After elections in mid-2023, Turkey reversed course with aggressive rate hikes from 8.5% to 45%. The heterodox experiment demonstrated that diverging from the global tightening cycle carries severe currency and inflation costs.',
    keyFact: 'Turkey cut rates while inflation hit 85% — then reversed to 45%',
    metrics: [
      { label: 'Peak inflation rate', value: 85, max: 120, unit: '%', color: '#e84040' },
      { label: 'Lira depreciation (2021-22)', value: 44, max: 100, unit: '%', color: '#c9a84c' },
      { label: 'Post-reversal rate', value: 45, max: 60, unit: '%', color: '#00c9a7' },
      { label: 'Pre-reversal rate (low)', value: 8.5, max: 60, unit: '%', color: '#4a90e2' }
    ]
  }
];

export const SPILLOVER_TIERS: SpilloverTier[] = [
  {
    tier: 1,
    label: 'Sovereign Default / Restructuring',
    color: '#e84040',
    description: 'Countries that defaulted on sovereign debt or entered restructuring during the tightening cycle.',
    countries: ['Sri Lanka', 'Zambia', 'Ghana', 'Ethiopia', 'Lebanon'],
    capitalFlow: '-$42B total outflows'
  },
  {
    tier: 2,
    label: 'Emergency IMF Programs',
    color: '#c9a84c',
    description: 'Countries forced to seek emergency IMF financing to avoid default or stabilize reserves.',
    countries: ['Pakistan', 'Egypt', 'Kenya', 'Bangladesh', 'Tunisia'],
    capitalFlow: '-$28B net capital flight'
  },
  {
    tier: 3,
    label: 'Severe Currency / Inflation Crisis',
    color: '#4a90e2',
    description: 'Countries experiencing severe currency depreciation (>25%) or inflation spikes (>30%) without formal default.',
    countries: ['Argentina', 'Turkey', 'Nigeria', 'Malawi', 'Laos'],
    capitalFlow: '-$19B portfolio outflows'
  },
  {
    tier: 4,
    label: 'Absorbed with Stress',
    color: '#00c9a7',
    description: 'Countries that weathered the tightening cycle through reserves, policy adjustment, or commodity buffers.',
    countries: ['Brazil', 'India', 'Mexico', 'South Africa', 'Thailand'],
    capitalFlow: '-$7B (net managed)'
  }
];

export const SPILLBACK_STEPS: SpillbackStep[] = [
  {
    step: 1,
    label: 'Fed Tightens',
    description: 'Federal Reserve raises rates 525bp in 16 months; USD strengthens globally.',
    color: '#e84040'
  },
  {
    step: 2,
    label: 'Dollar Surges',
    description: 'DXY index reaches 20-year high; EM currencies depreciate sharply.',
    color: '#c9a84c'
  },
  {
    step: 3,
    label: 'Capital Flees EMs',
    description: '$83B exits emerging markets; bond spreads widen 200-400bp.',
    color: '#e84040'
  },
  {
    step: 4,
    label: 'EM Central Banks Forced to Hike',
    description: '95% of central banks tighten simultaneously to defend currencies.',
    color: '#c9a84c'
  },
  {
    step: 5,
    label: 'Debt Costs Spike',
    description: 'Dollar-denominated debt service costs surge; 25 countries enter distress.',
    color: '#e84040'
  },
  {
    step: 6,
    label: 'Growth Collapses',
    description: 'Developing country growth falls to 3.3%; investment and trade contract.',
    color: '#4a90e2'
  },
  {
    step: 7,
    label: 'Spillback to Advanced Economies',
    description: 'Reduced EM demand lowers US exports by ~$45B; global supply chains disrupted.',
    color: '#00c9a7'
  }
];

export const RATE_TIMELINE: RateTimelinePoint[] = [
  { date: '2019-Q1', fed: 2.50, ecb: 0.00, boe: 0.75, boj: -0.10 },
  { date: '2019-Q2', fed: 2.50, ecb: 0.00, boe: 0.75, boj: -0.10 },
  { date: '2019-Q3', fed: 2.25, ecb: 0.00, boe: 0.75, boj: -0.10 },
  { date: '2019-Q4', fed: 1.75, ecb: 0.00, boe: 0.75, boj: -0.10 },
  { date: '2020-Q1', fed: 1.75, ecb: 0.00, boe: 0.10, boj: -0.10 },
  { date: '2020-Q2', fed: 0.25, ecb: 0.00, boe: 0.10, boj: -0.10 },
  { date: '2020-Q3', fed: 0.25, ecb: 0.00, boe: 0.10, boj: -0.10 },
  { date: '2020-Q4', fed: 0.25, ecb: 0.00, boe: 0.10, boj: -0.10 },
  { date: '2021-Q1', fed: 0.25, ecb: 0.00, boe: 0.10, boj: -0.10 },
  { date: '2021-Q2', fed: 0.25, ecb: 0.00, boe: 0.10, boj: -0.10 },
  { date: '2021-Q3', fed: 0.25, ecb: 0.00, boe: 0.10, boj: -0.10 },
  { date: '2021-Q4', fed: 0.25, ecb: 0.00, boe: 0.25, boj: -0.10 },
  { date: '2022-Q1', fed: 0.50, ecb: 0.00, boe: 0.75, boj: -0.10 },
  { date: '2022-Q2', fed: 1.75, ecb: 0.00, boe: 1.25, boj: -0.10 },
  { date: '2022-Q3', fed: 3.25, ecb: 0.75, boe: 2.25, boj: -0.10 },
  { date: '2022-Q4', fed: 4.50, ecb: 2.00, boe: 3.50, boj: -0.10 },
  { date: '2023-Q1', fed: 5.00, ecb: 3.00, boe: 4.25, boj: -0.10 },
  { date: '2023-Q2', fed: 5.25, ecb: 3.50, boe: 5.00, boj: -0.10 },
  { date: '2023-Q3', fed: 5.50, ecb: 4.00, boe: 5.25, boj: -0.10 },
  { date: '2023-Q4', fed: 5.50, ecb: 4.00, boe: 5.25, boj: 0.00 },
  { date: '2024-Q1', fed: 5.50, ecb: 4.00, boe: 5.25, boj: 0.00 },
  { date: '2024-Q2', fed: 5.50, ecb: 3.75, boe: 5.25, boj: 0.10 },
  { date: '2024-Q3', fed: 5.00, ecb: 3.50, boe: 5.00, boj: 0.25 },
  { date: '2024-Q4', fed: 4.50, ecb: 3.00, boe: 4.75, boj: 0.25 }
];

export const CURRENCY_DEPRECIATION: CurrencyDepreciationEntry[] = [
  { country: 'Sri Lanka', iso3: 'LKA', depreciation: 80, color: '#e84040' },
  { country: 'Argentina', iso3: 'ARG', depreciation: 50, color: '#e84040' },
  { country: 'Ghana', iso3: 'GHA', depreciation: 54, color: '#e84040' },
  { country: 'Egypt', iso3: 'EGY', depreciation: 50, color: '#c9a84c' },
  { country: 'Turkey', iso3: 'TUR', depreciation: 44, color: '#c9a84c' },
  { country: 'Pakistan', iso3: 'PAK', depreciation: 36, color: '#c9a84c' },
  { country: 'Nigeria', iso3: 'NGA', depreciation: 30, color: '#4a90e2' },
  { country: 'Kenya', iso3: 'KEN', depreciation: 22, color: '#4a90e2' },
  { country: 'Bangladesh', iso3: 'BGD', depreciation: 18, color: '#00c9a7' },
  { country: 'India', iso3: 'IND', depreciation: 10, color: '#00c9a7' }
];

export const CAPITAL_FLOW_DONUT = [
  { name: 'Portfolio equity outflows', value: 28, color: '#e84040' },
  { name: 'Bond market outflows', value: 35, color: '#c9a84c' },
  { name: 'Banking sector retrenchment', value: 20, color: '#4a90e2' },
  { name: 'Retained/redirected', value: 17, color: '#00c9a7' }
];

export const EXPLAINER_MECHANISMS = [
  {
    step: 1,
    title: 'Interest Rate Channel',
    description:
      'When the Fed raises rates, USD-denominated assets become more attractive. Capital flows out of developing countries toward US treasuries, creating a "gravitational pull" on global liquidity.'
  },
  {
    step: 2,
    title: 'Exchange Rate Channel',
    description:
      'Dollar strengthening forces EM currencies to depreciate. For countries with dollar-denominated debt, each 10% depreciation effectively increases debt burden by 10% in local currency terms.'
  },
  {
    step: 3,
    title: 'Trade Pricing Channel',
    description:
      'Under the Dominant Currency Paradigm, ~40% of global trade is invoiced in USD. A stronger dollar raises import costs for developing countries even when trading with non-US partners.'
  },
  {
    step: 4,
    title: 'Confidence & Contagion Channel',
    description:
      'Rising US rates trigger risk-off sentiment. Credit spreads widen, sovereign ratings are downgraded, and market access closes — creating a self-reinforcing cycle of financial stress.'
  }
];

export const RICH_SOURCES = [
  {
    id: 'imf-weo',
    title: 'World Economic Outlook',
    publisher: 'International Monetary Fund',
    year: '2023',
    url: 'https://www.imf.org/en/Publications/WEO'
  },
  {
    id: 'bis-cbpol',
    title: 'Central Bank Policy Rates (CBPOL)',
    publisher: 'Bank for International Settlements',
    year: '2024',
    url: 'https://www.bis.org/statistics/cbpol.htm'
  },
  {
    id: 'bis-gli',
    title: 'Global Liquidity Indicators',
    publisher: 'Bank for International Settlements',
    year: '2024',
    url: 'https://www.bis.org/statistics/gli.htm'
  },
  {
    id: 'wb-ids',
    title: 'International Debt Statistics',
    publisher: 'World Bank',
    year: '2023',
    url: 'https://www.worldbank.org/en/programs/debt-statistics/ids'
  },
  {
    id: 'iif-tracker',
    title: 'Capital Flows Tracker',
    publisher: 'Institute of International Finance',
    year: '2023',
    url: 'https://www.iif.com/Research/Capital-Flows-and-Debt'
  },
  {
    id: 'imf-cofer',
    title: 'Currency Composition of Official Foreign Exchange Reserves (COFER)',
    publisher: 'International Monetary Fund',
    year: '2024',
    url: 'https://data.imf.org/?sk=E6A5F467-C14B-4AA8-9F6D-5A09EC4E62A4'
  },
  {
    id: 'un-ffd',
    title: 'Financing for Sustainable Development Report',
    publisher: 'United Nations DESA',
    year: '2023',
    url: 'https://financing.desa.un.org/fsdr/2023'
  },
  {
    id: 'piie-spillovers',
    title: 'US Monetary Tightening: Spillovers to Emerging Markets',
    publisher: 'Peterson Institute for International Economics',
    year: '2022',
    url: 'https://www.piie.com'
  }
];
