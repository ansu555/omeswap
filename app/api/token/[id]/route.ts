import { NextResponse } from "next/server";
import type { KryllAuditData, KryllAuditResponse } from "../../crypto/types";

// Token Detail Response Type
export interface TokenDetailResponse {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string;
  description: string;
  price: number;
  priceChange24h: number;
  rank: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  totalSupply: number | null;
  maxSupply: number | null;
  auditScores: {
    financial: number;
    fundamental: number;
    social: number;
    security: number;
    overall: number;
  };
  historicalData: Array<{
    timestamp: number;
    price: number;
  }>;
  volumeBreakdown: {
    cex: number;
    dex: number;
  };
  liquidityRatio: number;
  tags: string[];
  dateAdded: string;
  lastUpdated: string;
  // Rich data from Kryll audit
  fundamental: {
    website: string;
    whitepaper: string;
    country: string;
    maturityMonths: number;
    globalHype: number;
    narratives: Record<string, { perf: number }>;
    git: {
      name: string;
      url: string;
      description: string;
      forks: number;
      watchers: number;
      subscribers: number;
    } | null;
    news: Array<{
      time: string;
      title: string;
      score: number;
      sentiment: "bullish" | "bearish";
      link: string;
      source: string;
    }>;
    cexListings: Array<{
      name: string;
      logo: string;
      link: string;
      trustScore: number;
    }>;
  };
  social: {
    sentiment: number;
    platforms: Array<{
      name: string;
      icon: string;
      status: string;
      url: string;
      posts?: string;
      postsChange?: string;
      users?: string;
      usersChange?: string;
      usersLabel?: string;
      activeUsers?: string;
      subscribers?: string;
    }>;
  };
  security: {
    grade: string;
    infrastructureScore: number;
    securityInfo: Array<{
      label: string;
      value: string;
      status: "neutral" | "success";
    }>;
    dnsItems: Array<{ label: string; status: "ok" | "warning" }>;
    emailItems: Array<{ label: string; status: "ok" | "warning" }>;
    exposedPorts: string[];
  };
}

const KRYLL_HEADERS = {
  Accept: "*/*",
  Origin: "https://app.kryll.io",
  Referer: "https://app.kryll.io/",
};

// Fetch token audit data from Kryll
async function fetchTokenAudit(
  tokenId: string,
): Promise<KryllAuditData | null> {
  const response = await fetch(
    `https://dapi.kryll.io/xray/audit/${encodeURIComponent(tokenId)}`,
    {
      method: "GET",
      headers: KRYLL_HEADERS,
      next: { revalidate: 300 },
    },
  );

  if (!response.ok) {
    return null;
  }

  const json: KryllAuditResponse = await response.json();
  return json.data || null;
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function formatChange(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${formatNumber(n)}`;
}

// Map social platform icon
function platformIcon(name: string): string {
  switch (name) {
    case "twitter":
      return "𝕏";
    case "coingecko":
      return "🦎";
    case "telegram":
      return "✈️";
    case "reddit":
      return "👽";
    default:
      return "🔗";
  }
}

// Build social platforms from audit data
function buildSocialPlatforms(social: KryllAuditData["social"]) {
  const platforms: TokenDetailResponse["social"]["platforms"] = [];
  const sm = social.social_media;

  if (sm.twitter) {
    platforms.push({
      name: "twitter",
      icon: platformIcon("twitter"),
      status: sm.twitter.rate?.toUpperCase() || "N/A",
      url: sm.twitter.link || "",
      posts: formatNumber(sm.twitter.posts || 0),
      postsChange: formatChange(sm.twitter.posts_evolution_24h || 0),
      users: formatNumber(sm.twitter.followers || 0),
      usersChange: formatChange(sm.twitter.followers_evolution_24h || 0),
    });
  }

  if (sm.coingecko) {
    platforms.push({
      name: "coingecko",
      icon: platformIcon("coingecko"),
      status: sm.coingecko.rate?.toUpperCase() || "N/A",
      url: sm.coingecko.link || "",
      users: formatNumber(sm.coingecko.followers || 0),
      usersChange: formatChange(sm.coingecko.followers_evolution_24h || 0),
      usersLabel: "Users watching this token",
    });
  }

  if (sm.telegram) {
    platforms.push({
      name: "telegram",
      icon: platformIcon("telegram"),
      status: sm.telegram.rate?.toUpperCase() || "N/A",
      url: sm.telegram.link || "",
      users: formatNumber(sm.telegram.members || 0),
      usersChange: formatChange(sm.telegram.members_evolution_24h || 0),
      usersLabel: "Members",
    });
  }

  if (sm.reddit) {
    platforms.push({
      name: "reddit",
      icon: platformIcon("reddit"),
      status: sm.reddit.rate?.toUpperCase() || "N/A",
      url: sm.reddit.link || "",
      activeUsers: String(sm.reddit.active_users || 0),
      subscribers: formatNumber(sm.reddit.subscribers || 0),
    });
  }

  return platforms;
}

// Build security data from audit
function buildSecurityData(sec: KryllAuditData["security"]) {
  const grade = sec.web?.rate || "N/A";

  const securityInfo: TokenDetailResponse["security"]["securityInfo"] = [
    { label: "Domain", value: sec.web?.hostname || "N/A", status: "neutral" },
    {
      label: "IP Address",
      value: sec.network?.ip || "N/A",
      status: sec.network?.ip === "protected" ? "success" : "neutral",
    },
    {
      label: "WAF Protected",
      value: sec.web?.waf ? `Yes (${sec.web.waf})` : "No",
      status: sec.web?.waf ? "success" : "neutral",
    },
    {
      label: "Last Scan",
      value: sec.last_audit
        ? new Date(sec.last_audit).toLocaleDateString()
        : "N/A",
      status: "neutral",
    },
  ];

  if (sec.web?.exposed) {
    for (const [key, value] of Object.entries(sec.web.exposed)) {
      securityInfo.push({
        label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        value: String(value),
        status: value === "protected" ? "success" : "neutral",
      });
    }
  }

  // DNS items
  const dnsItems: TokenDetailResponse["security"]["dnsItems"] = [];
  if (sec.dns && !("error" in sec.dns)) {
    for (const [label, risk] of Object.entries(sec.dns)) {
      dnsItems.push({
        label,
        status: risk === "safe" ? "ok" : "warning",
      });
    }
  }

  // Email items
  const emailItems: TokenDetailResponse["security"]["emailItems"] = [];
  if (sec.email && !("error" in sec.email)) {
    for (const [label, risk] of Object.entries(sec.email)) {
      emailItems.push({
        label,
        status: risk === "safe" ? "ok" : "warning",
      });
    }
  }

  // Exposed ports
  const exposedPorts: string[] = [];
  if (sec.network?.openPorts) {
    for (const p of sec.network.openPorts) {
      const portLabel = p.port ? `${p.desc} ${p.port}` : p.desc;
      exposedPorts.push(portLabel);
    }
  }

  return {
    grade,
    infrastructureScore: Math.round(sec.network?.score || 0),
    securityInfo,
    dnsItems,
    emailItems,
    exposedPorts,
  };
}

// Build news items from audit
function buildNewsItems(news: KryllAuditData["fundamental"]["news"]) {
  if (!news?.hotest) return [];
  return news.hotest.map((n) => {
    const date = new Date(n.pubDate);
    const time = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return {
      time,
      title: n.title,
      score: (n.rates.sentiment + n.rates.importance) / 20, // normalize to 0-10
      sentiment: (n.rates.sentiment >= 50 ? "bullish" : "bearish") as
        | "bullish"
        | "bearish",
      link: n.link,
      source: n.source,
    };
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: tokenId } = await params;

    const audit = await fetchTokenAudit(tokenId);

    if (!audit) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    const fin = audit.financial;
    const fund = audit.fundamental;
    const soc = audit.social;
    const sec = audit.security;

    // Map monthly history to historicalData (real prices!)
    const historicalData = fin.market.history.monthly.map(([ts, price]) => ({
      timestamp: ts,
      price,
    }));

    // Extract narratives as tags
    const tags = fund.narratives
      ? Object.keys(fund.narratives).slice(0, 10)
      : [];

    const response: TokenDetailResponse = {
      id: audit.id,
      name: audit.name,
      symbol: audit.symbol.toUpperCase(),
      imageUrl: audit.tokenLogo,
      description: audit.description || fund.description || "",
      price: fin.market.price,
      priceChange24h: fin.market.price_evolution_24h,
      rank: 0,
      marketCap: fin.market.marketcap,
      volume24h: fin.market.volume?.total?.volume || 0,
      circulatingSupply:
        fund.supply?.circulating || fin.market.supply?.circulating || 0,
      totalSupply: fund.supply?.total || fin.market.supply?.total || null,
      maxSupply: fund.supply?.max || fin.market.supply?.max || null,
      auditScores: {
        financial: Math.round(fin.score),
        fundamental: Math.round(fund.score),
        social: Math.round(soc.score),
        security: Math.round(sec.score),
        overall: Math.round(audit.global_score * 10) / 10,
      },
      historicalData,
      volumeBreakdown: {
        cex: fin.market.volume?.cex?.volume || 0,
        dex: fin.market.volume?.dex?.volume || 0,
      },
      liquidityRatio: fund.supply?.ratio || 0,
      tags,
      dateAdded: fund.maturity?.inception || "",
      lastUpdated: sec.last_audit || new Date().toISOString(),
      fundamental: {
        website: fund.website || "",
        whitepaper: fund.whitepaper || "",
        country: fund.country_origin?.name || "Unknown",
        maturityMonths: fund.maturity?.age_in_months || 0,
        globalHype: fund.global_hype || 0,
        narratives: fund.narratives || {},
        git: fund.git?.name
          ? {
              name: fund.git.name,
              url: fund.git.html_url,
              description: fund.git.description,
              forks: fund.git.forks,
              watchers: fund.git.watchers,
              subscribers: fund.git.subscribers_count,
            }
          : null,
        news: buildNewsItems(fund.news),
        cexListings:
          fund.cex_listings?.links?.map((l) => ({
            name: l.name,
            logo: l.logo,
            link: l.link,
            trustScore: l.trust_score,
          })) || [],
      },
      social: {
        sentiment: soc.community_sentiment?.score || 0,
        platforms: buildSocialPlatforms(soc),
      },
      security: buildSecurityData(sec),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching token detail:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
