import Link from "next/link";

export default function BlogArticle({ title, intro, children }) {
  return (
    <main className="min-h-screen bg-[#10100d] px-4 py-10 text-slate-950">
      <article className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-5 shadow-xl md:p-8">
        <Link href="/blog" className="text-sm font-bold uppercase tracking-[0.14em] text-emerald-700 hover:text-emerald-900">
          Blog
        </Link>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{title}</h1>
        {intro && <p className="mt-4 text-lg leading-8 text-slate-700">{intro}</p>}
        <div className="mt-7 space-y-5 text-base leading-8 text-slate-800 [&_a]:font-semibold [&_a]:text-blue-700 [&_a:hover]:underline [&_h2]:pt-4 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:tracking-tight [&_h2]:text-slate-950 [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc">
          {children}
        </div>
      </article>
    </main>
  );
}
