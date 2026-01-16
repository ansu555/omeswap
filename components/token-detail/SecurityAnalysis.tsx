"use client";

import { CheckCircle, AlertCircle, Shield, Server } from "lucide-react";

interface SecurityItem {
  label: string;
  status: "ok" | "warning";
}

interface SecurityInfo {
  label: string;
  value: string;
  status: "neutral" | "success";
}

interface SecurityAnalysisProps {
  grade?: string;
  dnsItems?: SecurityItem[];
  emailItems?: SecurityItem[];
  exposedPorts?: string[];
  securityInfo?: SecurityInfo[];
  securityHeaders?: { label: string; status: "warning" }[];
  infrastructureScore?: number;
}

const defaultDnsItems: SecurityItem[] = [
  { label: "Name Servers Version Exposed", status: "warning" },
  { label: "Allow Recursive Queries", status: "ok" },
  { label: "Cname In NS Records", status: "ok" },
  { label: "Mx Records Private IPs", status: "ok" },
  { label: "Mx Records Invalid Chars", status: "ok" },
];

const defaultEmailItems: SecurityItem[] = [
  { label: "Missing SPF", status: "ok" },
  { label: "Ineffective SPF", status: "ok" },
  { label: "Missing DMARC", status: "ok" },
  { label: "Weak DMARC Policy", status: "ok" },
  { label: "Spf Softfail Without DMARC", status: "ok" },
  { label: "Missing DKIM", status: "ok" },
];

const defaultExposedPorts = [
  "HTTP 80",
  "HTTPS 443",
  "Proxies / Tomcat / Jenkins 8080",
  "cPanel (SSL) 2083",
  "WHM (no SSL) 2086",
  "WHM (SSL) 2087",
  "Plesk (SSL) 8443",
  "Plesk (HTTP) 8880",
  "DNS over TLS / cPanel 2053",
  "cPanel (no SSL) 2082",
  "Webmail (SSL) 2096",
];

const defaultSecurityInfo: SecurityInfo[] = [
  { label: "Domain", value: "www.bitcoin.org", status: "neutral" },
  { label: "Ip Address", value: "Protected", status: "success" },
  { label: "Server", value: "Protected", status: "success" },
  { label: "Stack", value: "Protected", status: "success" },
  { label: "WAF protected", value: "Yes", status: "success" },
  { label: "Last scan", value: "1/13/26", status: "neutral" },
];

const defaultSecurityHeaders = [
  { label: "X-Frame-Options", status: "warning" as const },
  { label: "X-Content-Type-Options", status: "warning" as const },
  { label: "Referrer-Policy", status: "warning" as const },
];

export function SecurityAnalysis({
  grade = "D",
  dnsItems = defaultDnsItems,
  emailItems = defaultEmailItems,
  exposedPorts = defaultExposedPorts,
  securityInfo = defaultSecurityInfo,
  securityHeaders = defaultSecurityHeaders,
  infrastructureScore = 80,
}: SecurityAnalysisProps) {
  const gradeColor = grade === "A" || grade === "B" ? "text-success" : grade === "C" ? "text-warning" : "text-warning";

  return (
    <div className="space-y-4">
      <div className="dashboard-card-header">
        <h2 className="dashboard-card-title">Cyber Security</h2>
        <button className="badge-status badge-neutral flex items-center gap-2">
          Tell me more
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="dashboard-card border-2 border-warning/30">
          <h3 className="text-sm text-muted-foreground text-center mb-4">Website Security Grade</h3>
          <div className={`text-6xl font-bold ${gradeColor} text-center`}>{grade}</div>
        </div>

        <div className="dashboard-card space-y-2">
          {securityInfo.map((item) => (
            <div key={item.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className={item.status === "success" ? "text-success" : "text-foreground"}>
                {item.value}
              </span>
            </div>
          ))}
          <div className="flex flex-wrap gap-2 pt-2">
            {securityHeaders.map((header) => (
              <span key={header.label} className="badge-status badge-warning text-xs">
                {header.label}
                <AlertCircle className="w-3 h-3" />
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="dashboard-card">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            DNS Security
          </h3>
          <div className="space-y-2">
            {dnsItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                {item.status === "ok" ? (
                  <CheckCircle className="w-4 h-4 text-success" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-warning" />
                )}
                <span className="text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <Server className="w-4 h-4" />
            Email Security
          </h3>
          <div className="space-y-2">
            {emailItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="dashboard-card">
          <h3 className="text-sm text-muted-foreground text-center mb-3">Infrastructure Security</h3>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Poor</span>
            <span>Good</span>
          </div>
          <div className="relative h-1.5 rounded-full overflow-hidden">
            <div className="absolute inset-0 gradient-bar" />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-foreground rounded-full border-2 border-background shadow-lg"
              style={{ left: `calc(${infrastructureScore}% - 8px)` }}
            />
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-sm font-medium text-foreground mb-3">Exposed ports</h3>
          <div className="flex flex-wrap gap-2">
            {exposedPorts.map((port) => (
              <span key={port} className="badge-status badge-neutral text-xs">
                {port}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
