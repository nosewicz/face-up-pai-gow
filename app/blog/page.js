"use client";

import Head from "next/head";
import Link from "next/link";
import BlogIndex from "../utils/BlogIndex";

export default function BlogPosts() {
  return (
    <>
      <Head>
        <title>Blog Posts | PaiGowLab.com</title>
        <meta
          name="description"
          content="Learn Pai Gow Poker with our free online trainer. Discover the rules, find tips, and start playing Face-Up Pai Gow for free."
        />
      </Head>

      <BlogIndex />
    </>
  );
}