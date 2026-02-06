"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Space_Grotesk, Archivo_Black } from "next/font/google";
import { useEffect, useState } from "react";

const display = Archivo_Black({ subsets: ["latin"], weight: "400" });
const body = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "700"] });

const defaultPlans = [
  {
    key: "starter",
    name: "Starter",
    price: "R$ 79",
    cadence: "/mes",
    items: [
      "ate 2.000 SKUs",
      "2 usuarios",
      "importacao e exportacao CSV",
      "alertas de estoque baixo",
      "suporte por email",
    ],
  },
  {
    key: "growth",
    name: "Growth",
    price: "R$ 189",
    cadence: "/mes",
    items: [
      "ate 15.000 SKUs",
      "8 usuarios",
      "alertas inteligentes",
      "relatorios avancados",
      "suporte prioritario",
    ],
    highlighted: true,
  },
  {
    key: "scale",
    name: "Scale",
    price: "Sob consulta",
    cadence: "",
    items: [
      "SKUs ilimitados",
      "usuarios ilimitados",
      "auditoria completa",
      "portal dedicado",
      "suporte VIP",
    ],
  },
];

export default function PlanosPage() {
  const [plans, setPlans] = useState(defaultPlans);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/billing/plans");
      const payload = await response.json().catch(() => null);
      if (payload?.ok) {
        const merged = defaultPlans.map((plan) => {
          const remote = payload.data.find((item: { key: string }) => item.key === plan.key);
          return {
            ...plan,
            price: remote?.price ?? plan.price,
            cadence: remote?.cadence ?? plan.cadence,
          };
        });
        setPlans(merged);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className={`${body.className} min-h-screen bg-[#f7f4ef] text-[#1f1f1f]`}>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#fde68a] via-[#a7f3d0] to-[#93c5fd] blur-3xl opacity-60" />
        <div className="mx-auto max-w-6xl px-6 py-16">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-[#0f172a]/70">planos</p>
            <h1 className={`${display.className} mt-4 text-4xl sm:text-5xl`}>
              Precos claros para cada fase do seu estoque
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[#0f172a]/70">
              Sem taxas escondidas. Cancele quando quiser. Evolua o plano conforme a operacao cresce.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={`relative rounded-3xl border ${
                  plan.highlighted
                    ? "border-[#0f172a] bg-[#0f172a] text-white shadow-[0_30px_80px_rgba(15,23,42,0.3)]"
                    : "border-[#e2e8f0] bg-white"
                } p-8`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-4 left-6 rounded-full bg-[#fef08a] px-4 py-1 text-xs font-semibold text-[#0f172a]">
                    MAIS POPULAR
                  </span>
                )}
                <h2 className={`${display.className} text-2xl`}>{plan.name}</h2>
                <p className="mt-4 text-3xl font-semibold">
                  {loading ? "..." : plan.price}{" "}
                  <span className="text-base font-medium">{plan.cadence}</span>
                </p>
                <p className={`mt-1 text-xs ${plan.highlighted ? "text-white/70" : "text-[#0f172a]/70"}`}>
                  Cobrado mensalmente. Sem fidelidade.
                </p>
                <ul className="mt-6 space-y-3 text-sm">
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/cadastro?plan=${plan.key}`}
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    plan.highlighted
                      ? "bg-white text-[#0f172a] hover:bg-[#f8fafc]"
                      : "bg-[#0f172a] text-white hover:bg-[#111827]"
                  }`}
                >
                  Comecar agora
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center gap-2 text-sm text-[#0f172a]/70">
            <span>Ja tem uma empresa criada?</span>
            <Link className="font-semibold text-[#0f172a] hover:underline" href="/entrar">
              Entrar na empresa
            </Link>
          </div>

          <div className="mt-10 grid gap-4 rounded-3xl border border-[#e2e8f0] bg-white p-6 text-sm text-[#0f172a]/70 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#0f172a]/60">Garantia</p>
              <p className="mt-2 text-sm">7 dias para testar. Se nao fizer sentido, cancele.</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#0f172a]/60">Migracao</p>
              <p className="mt-2 text-sm">Importacao simples por CSV e suporte para onboarding.</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#0f172a]/60">Seguranca</p>
              <p className="mt-2 text-sm">Isolamento por tenant e auditoria completa.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
