const SITE_URL = "https://principles.studio";

const organization = {
  "@type": "Organization" as const,
  name: "First Principles",
  legalName: "First Principles Studio Ltd",
  url: SITE_URL,
  logo: `${SITE_URL}/fp-logo.png`,
  description:
    "Independent product and software studio based in Nottingham, working with clients across the UK. User-centred design and development.",
  founder: {
    "@type": "Person" as const,
    name: "Joseph Coulam",
  },
  address: {
    "@type": "PostalAddress" as const,
    addressLocality: "Nottingham",
    addressCountry: "GB",
  },
  // Add social links here when available:
  // sameAs: ["https://github.com/...", "https://linkedin.com/in/..."],
};

/** Shortened author block for use inside product schemas */
const author = {
  "@type": "Organization" as const,
  name: organization.legalName,
  url: organization.url,
};

/**
 * Build a JSON-LD SoftwareApplication + optional FAQPage schema.
 */
export function useProductSchema(options: {
  name: string;
  description: string;
  applicationCategory: string;
  operatingSystem: string;
  price?: string;
  priceCurrency?: string;
  availability?: string;
  faqs?: { question: string; answer: string }[];
}) {
  const app: Record<string, unknown> = {
    "@type": "SoftwareApplication",
    name: options.name,
    description: options.description,
    applicationCategory: options.applicationCategory,
    operatingSystem: options.operatingSystem,
    offers: {
      "@type": "Offer",
      price: options.price ?? "0",
      priceCurrency: options.priceCurrency ?? "GBP",
      ...(options.availability && { availability: options.availability }),
    },
    author,
  };

  const graph: Record<string, unknown>[] = [app];

  if (options.faqs?.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: options.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  return {
    type: "application/ld+json" as const,
    innerHTML: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
  };
}

/** The global Organization schema (used in nuxt.config or layouts). */
export function useOrganizationSchema() {
  return {
    type: "application/ld+json" as const,
    innerHTML: JSON.stringify({
      "@context": "https://schema.org",
      ...organization,
    }),
  };
}
