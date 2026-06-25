"use client";

type ReportHandler = (metric: { name: string; value: number; id: string }) => void;

export function reportWebVitals(onReport?: ReportHandler) {
  if (typeof window === "undefined") return;

  void import("web-vitals").then(({ onCLS, onINP, onLCP }) => {
    const report: ReportHandler = (metric) => {
      if (process.env.NODE_ENV === "development") {
        console.info(`[web-vital] ${metric.name}`, Math.round(metric.value));
      }
      onReport?.(metric);
    };

    onCLS(report);
    onINP(report);
    onLCP(report);
  });
}
