import type { NextConfig } from "next";

const DEFAULT_AUTH_API_BASE_URL = "http://192.168.1.64:8081";
const DEFAULT_PATIENTS_API_BASE_URL = "http://192.168.1.60:8181";
const DEFAULT_RECEPTION_API_BASE_URL = "http://192.168.1.55:8283";
const DEFAULT_BILLING_API_BASE_URL = "http://192.168.1.68:8081";


const resolveBaseUrl = (envValue: string | undefined, fallback: string) => {
  const value = (envValue ?? "").trim();
  return value || fallback;
};

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.1.64",
    "192.168.1.64:3001",
  ],
  async rewrites() {
    const patientsApiBase = resolveBaseUrl(
      process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL,
      DEFAULT_PATIENTS_API_BASE_URL
    );
    const receptionApiBase = resolveBaseUrl(
      process.env.NEXT_PUBLIC_RECEPTION_API_BASE_URL,
      DEFAULT_RECEPTION_API_BASE_URL
    );
    const authApiBase = resolveBaseUrl(
      process.env.NEXT_PUBLIC_AUTH_API_BASE_URL,
      DEFAULT_AUTH_API_BASE_URL
    );
    const billingApiBase = resolveBaseUrl(
      process.env.NEXT_PUBLIC_BILLING_API_BASE_URL,
      DEFAULT_BILLING_API_BASE_URL
    );

    return [
      {
        source: "/api/patients/:path*",
        destination: `${patientsApiBase}/api/patients/:path*`,
      },
      {
        source: "/api/menus/:path*",
        destination: `${patientsApiBase}/api/menus/:path*`,
      },
      {
        source: "/api/codes/:path*",
        destination: `${patientsApiBase}/api/codes/:path*`,
      },
      {
        source: "/api/consent-types/:path*",
        destination: `${patientsApiBase}/api/consent-types/:path*`,
      },
      {
        source: "/api/insurances/:path*",
        destination: `${patientsApiBase}/api/insurances/:path*`,
      },
      {
        source: "/api/flags/:path*",
        destination: `${patientsApiBase}/api/flags/:path*`,
      },
      {
        source: "/api/memos/:path*",
        destination: `${patientsApiBase}/api/memos/:path*`,
      },
      {
        source: "/api/restrictions/:path*",
        destination: `${patientsApiBase}/api/restrictions/:path*`,
      },
      {
        source: "/api/status-history/:path*",
        destination: `${patientsApiBase}/api/status-history/:path*`,
      },
      {
        source: "/api/patients/:patientId/consents/:path*",
        destination: `${patientsApiBase}/api/patients/:patientId/consents/:path*`,
      },
      {
        source: "/api/auth/:path*",
        destination: `${authApiBase}/api/auth/:path*`,
      },
      {
        source: "/api/billing/:path*",
        destination: `${billingApiBase}/api/billing/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${receptionApiBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
