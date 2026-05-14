"use client";

import Link from "next/link";
import { blogPosts } from "./blogPosts";

export default function BlogIndex({ compact = false }) {
  const groupedPosts = blogPosts.reduce((groups, post) => {
    groups[post.category] = groups[post.category] || [];
    groups[post.category].push(post);
    return groups;
  }, {});

  if (compact) {
    const featuredPosts = blogPosts.slice(0, 6);

    return (
      <section className="rounded-lg bg-white p-4 text-slate-950">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-emerald-700">Guides</p>
            <h2 className="text-xl font-black tracking-tight">Learn the Games</h2>
          </div>
          <Link href="/blog" className="shrink-0 text-xs font-black uppercase tracking-[0.12em] text-blue-700 hover:underline">
            View All
          </Link>
        </div>

        <ul className="mt-4 divide-y divide-slate-200">
          {featuredPosts.map((post) => (
            <li key={post.href} className="py-3 first:pt-0 last:pb-0">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-500">{post.category}</p>
              <Link href={post.href} className="mt-1 block text-sm font-black leading-5 text-slate-950 hover:text-blue-700">
                {post.title}
              </Link>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{post.description}</p>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl rounded-lg bg-white p-5 text-slate-950 shadow-xl md:p-8">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">PaiGowLab Guides</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Learn Casino Poker Games for Free</h1>
      <p className="mt-3 max-w-3xl leading-7 text-slate-700">
        Rules, strategy notes, and free practice guides for Face-Up Pai Gow Poker, DJ Wild Stud Poker, and
        Ultimate X video poker.
      </p>

      <div className="mt-7 grid gap-5 md:grid-cols-3">
        {Object.entries(groupedPosts).map(([category, posts]) => (
          <div key={category} className="rounded-md border border-slate-200 p-4">
            <h2 className="text-lg font-black text-slate-950">{category}</h2>
            <ul className="mt-3 space-y-3">
              {posts.map((post) => (
                <li key={post.href}>
                  <Link href={post.href} className="font-bold text-blue-700 hover:underline">
                    {post.title}
                  </Link>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{post.description}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
