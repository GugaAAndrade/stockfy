"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Space_Mono, Sora } from "next/font/google";

const display = Sora({ subsets: ["latin"], weight: ["500", "600", "700"] });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"] });

const highlights = [
  {
    title: "Operacao sem ruído",
    body: "Movimentacoes, alertas e auditoria em um painel simples para equipes pequenas ou grandes.",
  },
  {
    title: "SKU sem bagunça",
    body: "Variacoes padronizadas com consistencia de catalogo e historico completo por item.",
  },
  {
    title: "Decisao rapida",
    body: "Dashboards enxutos que mostram o que importa: giro, alertas e valor do estoque.",
  },
];

const steps = [
  { title: "Escolha o plano", body: "Precos claros e upgrade quando sua operacao crescer." },
  { title: "Crie a empresa", body: "ID unico da empresa e acesso imediato ao painel." },
  { title: "Ative o estoque", body: "Cadastre produtos e acompanhe entradas/saidas ao vivo." },
];

export default function HomePage() {
  return (
    <div className={`${display.className} min-h-screen bg-[#0b0d10] text-white`}>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.35),transparent_70%)] blur-3xl" />
        <div className="pointer-events-none absolute right-[-10%] top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(244,114,182,0.28),transparent_70%)] blur-3xl" />

        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-[#22d3ee]" />
            <span className="text-sm uppercase tracking-[0.3em] text-white/60">Stockfy</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
            <a href="#recursos" className="hover:text-white">Recursos</a>
            <a href="#processo" className="hover:text-white">Processo</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/entrar"
              className="hidden rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70 transition hover:border-white/60 hover:text-white md:inline-flex"
            >
              Entrar
            </Link>
            <Link
              href="/planos"
              className="rounded-full bg-white px-5 py-2 text-xs uppercase tracking-[0.2em] text-[#0b0d10] transition hover:bg-white/90"
            >
              Comecar
            </Link>
          </div>
        </header>

        <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-20 pt-10 lg:flex-row lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            <p className={`${mono.className} text-xs uppercase tracking-[0.4em] text-[#22d3ee]`}>
              Saas de estoque
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Controle total do estoque, do zero ao crescimento.
            </h1>
            <p className="mt-6 max-w-xl text-base text-white/70">
              O Stockfy centraliza SKUs, movimentacoes e alertas em um painel direto. Menos planilhas,
              mais previsibilidade para equipes que precisam operar sem erro.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/planos"
                className="rounded-full bg-[#22d3ee] px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#04121c] transition hover:bg-[#67e8f9]"
              >
                Ver planos
              </Link>
              <Link
                href="/entrar"
                className="rounded-full border border-white/25 px-6 py-3 text-xs uppercase tracking-[0.25em] text-white/70 transition hover:border-white/60 hover:text-white"
              >
                Tenho empresa
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/60">
              <span className="rounded-full border border-white/15 px-3 py-1">Sem fidelidade</span>
              <span className="rounded-full border border-white/15 px-3 py-1">Setup em minutos</span>
              <span className="rounded-full border border-white/15 px-3 py-1">Suporte humano</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1"
          >
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className={`${mono.className} text-[0.65rem] uppercase tracking-[0.3em] text-white/60`}>
                  Painel ao vivo
                </span>
                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs text-emerald-200">
                  Atualizado agora
                </span>
              </div>
              <div className="mt-6 grid gap-4">
                {["Rotacao 30 dias", "Itens criticos", "Valor do estoque"].map((label, index) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-[#0f172a] p-4">
                    <p className="text-xs text-white/60">{label}</p>
                    <p className="mt-2 text-2xl font-semibold">
                      {index === 0 ? "18%" : index === 1 ? "27" : "R$ 248k"}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-br from-[#22d3ee]/20 to-[#f472b6]/20 p-4">
                <p className="text-xs text-white/70">Alertas inteligentes</p>
                <p className="mt-2 text-sm text-white">
                  12 SKUs com estoque abaixo do minimo foram detectados hoje.
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      <section id="recursos" className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={`${mono.className} text-xs uppercase tracking-[0.4em] text-white/50`}>
              Recursos essenciais
            </p>
            <h2 className="mt-4 text-3xl font-semibold">Feito para operacoes que crescem rapido.</h2>
          </div>
          <Link href="/planos" className="text-xs uppercase tracking-[0.3em] text-white/70 hover:text-white">
            Comparar planos
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className={`${mono.className} text-[0.7rem] uppercase tracking-[0.3em] text-[#22d3ee]`}>
                {item.title}
              </p>
              <p className="mt-4 text-base text-white/80">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="processo" className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className={`${mono.className} text-xs uppercase tracking-[0.4em] text-white/50`}>
                Fluxo simples
              </p>
              <h3 className="mt-4 text-3xl font-semibold">Assine e opere em minutos.</h3>
            </div>
            <Link
              href="/planos"
              className="rounded-full border border-white/30 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white/70 hover:border-white/60 hover:text-white"
            >
              Ver precos
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-3xl border border-white/10 bg-[#0b0f14] p-6">
                <p className={`${mono.className} text-xs uppercase tracking-[0.3em] text-white/40`}>
                  Etapa {index + 1}
                </p>
                <h4 className="mt-3 text-xl font-semibold">{step.title}</h4>
                <p className="mt-3 text-sm text-white/70">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className={`${mono.className} text-xs uppercase tracking-[0.4em] text-white/50`}>
              Perguntas frequentes
            </p>
            <h3 className="mt-4 text-3xl font-semibold">Tudo que voce precisa antes de assinar.</h3>
            <p className="mt-4 text-sm text-white/70">
              O fluxo e simples: escolha um plano, cadastre sua empresa e finalize o pagamento.
              O acesso ao painel acontece imediatamente apos a confirmacao do Stripe.
            </p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Preciso de dominio para usar?",
                a: "Nao. O acesso e feito pelo ID da empresa e login. Dominio proprio e opcional.",
              },
              {
                q: "Posso trocar de plano?",
                a: "Sim. O Stripe permite upgrade e downgrade, e o plano e atualizado no tenant.",
              },
              {
                q: "E se eu cancelar?",
                a: "Voce pode cancelar a qualquer momento. Seus dados ficam seguros e exportaveis.",
              },
            ].map((item) => (
              <div key={item.q} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold">{item.q}</p>
                <p className="mt-2 text-sm text-white/70">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-[2.5rem] border border-white/10 bg-[#111827] p-10 text-center">
          <p className={`${mono.className} text-xs uppercase tracking-[0.4em] text-white/50`}>
            Pronto para escalar
          </p>
          <h3 className="mt-4 text-3xl font-semibold">Comece agora com o plano ideal.</h3>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/planos"
              className="rounded-full bg-white px-6 py-3 text-xs uppercase tracking-[0.3em] text-[#0b0d10] transition hover:bg-white/90"
            >
              Escolher plano
            </Link>
            <Link
              href="/entrar"
              className="rounded-full border border-white/30 px-6 py-3 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:border-white/60 hover:text-white"
            >
              Ja sou cliente
            </Link>
          </div>
        </div>
      </section>

      <footer className={`${mono.className} mx-auto max-w-6xl px-6 pb-10 text-xs uppercase tracking-[0.3em] text-white/40`}>
        Stockfy • Controle de estoque com clareza.
      </footer>
    </div>
  );
}
