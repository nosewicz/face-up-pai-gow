import BlogIndex from "../utils/BlogIndex";

export const metadata = {
  title: "Free Pai Gow Poker, DJ Wild, and Ultimate X Guides | PaiGowLab",
  description:
    "Learn Pai Gow Poker, Face-Up Pai Gow, DJ Wild, and Ultimate X with free online guides and practice games at PaiGowLab.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPosts() {
  return (
    <main className="min-h-screen bg-[#10100d] px-4 py-10">
      <BlogIndex />
    </main>
  );
}
