"use client";

import { Check, Zap, Crown, Sparkles } from "lucide-react";
import DecryptedText from "../animations/DecryptedText";
import Link from "next/link";

interface PricingTier {
  name: string;
  price: string;
  priceSubtext: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  plan: "base" | "pro" | "ultra";
  icon: React.ReactNode;
}

const tiers: PricingTier[] = [
  {
    name: "Base",
    price: "$0",
    priceSubtext: "forever free",
    description: "Get started with essential features",
    plan: "base",
    icon: <Zap className="w-6 h-6" />,
    features: [
      "Unlimited tasks & notes",
      "Calendar & scheduling",
      "1 AI prompt per day",
      "Health & fitness tracking",
      "Mobile PWA support",
    ],
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "$4.99",
    priceSubtext: "/month",
    description: "For power users who want more",
    plan: "pro",
    popular: true,
    icon: <Sparkles className="w-6 h-6" />,
    features: [
      "Everything in Base",
      "10 AI prompts per day",
      "Analytics dashboard",
      "Advanced insights",
      "7-day free trial",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Ultra",
    price: "$14.99",
    priceSubtext: "/month",
    description: "Unlimited power for serious users",
    plan: "ultra",
    icon: <Crown className="w-6 h-6" />,
    features: [
      "Everything in Pro",
      "Unlimited AI prompts",
      "Early access to new features",
    ],
    cta: "Get Started",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-background-700 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block p-3 mb-4 bg-primary-500/10 rounded-xl border border-primary-500/20">
            <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-primary-400 text-glow" />
          </div>
          <h2 className="text-3xl sm:text-4xl text-glow font-mono tracking-tight">
            &lt;Pricing_Plans /&gt;
          </h2>
          <p className="text-text-low mt-4 max-w-xl mx-auto text-base sm:text-lg font-mono">
            <DecryptedText
              text="Select access tier. Upgrade anytime. Cancel anytime."
              animateOn="view"
              sequential
              useOriginalCharsOnly
              maxIterations={20}
            />
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, index) => (
            <PricingCard key={tier.name} tier={tier} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({ tier, index }: { tier: PricingTier; index: number }) {
  return (
    <div
      className={`
        relative group
        ${tier.popular ? "md:-mt-4 md:mb-4" : ""}
      `}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {tier.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-primary-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-primary-500/30">
            MOST POPULAR
          </span>
        </div>
      )}

      <div
        className={`
          relative h-full rounded-xl overflow-hidden flex flex-col
          bg-background-600/50 backdrop-blur-sm
          border transition-all duration-300
          ${
            tier.popular
              ? "border-primary-500/50 shadow-lg shadow-primary-500/10"
              : "border-primary-500/20 hover:border-primary-500/40"
          }
          group-hover:shadow-xl group-hover:shadow-primary-500/5
        `}
      >
        <div className="flex items-center gap-2 px-4 py-3 bg-background-700/80 border-b border-primary-500/20">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-xs text-text-low font-mono ml-2">
            plan_{tier.name.toLowerCase()}.config
          </span>
        </div>

        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`
              p-2 rounded-lg
              ${
                tier.popular
                  ? "bg-primary-500/20 text-primary-400"
                  : "bg-background-500 text-text-low"
              }
            `}
            >
              {tier.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-high font-mono">
                {tier.name}
              </h3>
              <p className="text-xs text-text-low">{tier.description}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-primary-400 text-glow">
                {tier.price}
              </span>
              <span className="text-text-low text-sm">{tier.priceSubtext}</span>
            </div>
          </div>

          <ul className="space-y-3 flex-grow">
            {tier.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check
                  className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    tier.popular ? "text-primary-400" : "text-green-500"
                  }`}
                />
                <span className="text-text-low text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <Link
            href={tier.plan === "base" ? "/login" : `/login?plan=${tier.plan}`}
            className={`
              block w-full py-3 px-4 rounded-lg font-semibold text-center
              transition-all duration-200 font-mono text-sm mt-8
              ${
                tier.popular
                  ? "bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40"
                  : "bg-background-500 hover:bg-background-400 text-text-high border border-primary-500/30 hover:border-primary-500/50"
              }
            `}
          >
            [{tier.cta}]
          </Link>
        </div>

        <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden pointer-events-none">
          <div
            className={`
            absolute -top-10 -right-10 w-20 h-20 rotate-45
            ${tier.popular ? "bg-primary-500/10" : "bg-primary-500/5"}
          `}
          ></div>
        </div>
      </div>
    </div>
  );
}
