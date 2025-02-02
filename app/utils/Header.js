"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / Brand Name */}
        <Link href="/" className="text-2xl font-bold hover:opacity-80">
          PaiGow<span className="text-yellow-300">Lab</span>
        </Link>

        {/* Nav Links */}
        <nav className="space-x-4">
          <Link href="/" className="hover:text-yellow-300">
            Play Free
          </Link>
          <Link href="/blog" className="hover:text-yellow-300">
            Blog
          </Link>
          <Link href="/blog/beginner-pai-gow" className="hover:text-yellow-300">
            Beginner's Guide
          </Link>
          {/* Add more if needed */}
        </nav>
      </div>
    </header>
  );
}
