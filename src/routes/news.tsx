import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { cmsStore, NewsArticle } from "@/lib/cms-store";
import { Button } from "@/components/ui/button";
import {
  Search,
  SlidersHorizontal,
  BookOpen,
  Clock,
  User,
  ArrowLeft,
  Video,
  Tag,
} from "lucide-react";

const newsSearchSchema = z.object({
  slug: z.string().optional(),
  category: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "Corporate Newsroom & Dispatch — Tindi Holdings Ltd Media Center" },
      {
        name: "description",
        content:
          "Explore certified announcements, press releases, media coverage and research dispatches from Tindi Holdings Ltd.",
      },
    ],
  }),
  validateSearch: (s) => newsSearchSchema.parse(s),
  component: NewsHubPage,
});

function NewsHubPage() {
  const { slug, category, q = "" } = Route.useSearch();
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();

  const [search, setSearch] = useState(q);

  const articles = cmsStore.getNews();

  // If viewing a single detailed article
  const selectedArticle = slug ? articles.find((a) => a.slug === slug) : null;

  const categories = [
    "All",
    "Press Release",
    "Announcement",
    "Media Coverage",
    "Corporate News",
    "Innovation",
  ];

  const filtered = articles.filter((a) => {
    const matchesCat = !category || category === "All" || a.category === category;
    const matchesSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/news",
      search: { slug, category, q: search },
    });
  };

  const handleCategorySelect = (cat: string) => {
    navigate({
      to: "/news",
      search: { slug, category: cat === "All" ? undefined : cat, q: search || undefined },
    });
  };

  // Gallery releases
  const galleryVideos = [
    {
      title: "Tindi Holdings Ltd 2026 Annual General Assembly Highlights",
      length: "12:40",
      date: "2026-06-05",
      thumb:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600",
    },
    {
      title: "Tour Fleet Electric Cruiser Prototype Demo",
      length: "4:15",
      date: "2026-06-01",
      thumb:
        "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=600",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />

      {selectedArticle ? (
        /* SINGLE DETAILED DISPATCH */
        <article className="py-16 mx-auto max-w-4xl px-4 md:px-6 w-full flex-1">
          <button
            onClick={() => navigate({ to: "/news", search: {} })}
            className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80 mb-8"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Newsroom
          </button>

          <div className="space-y-6">
            <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              {selectedArticle.category}
            </span>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground dark:text-white leading-tight">
              {selectedArticle.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground border-y py-4">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <User className="h-4 w-4 text-primary" /> {selectedArticle.author}
              </span>
              <span>
                Published: <strong>{selectedArticle.publishedAt}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {selectedArticle.readTime}
              </span>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Simulated Rich Content Markdown details */}
            <div className="prose dark:prose-invert max-w-none pt-6 leading-relaxed text-sm md:text-base space-y-5">
              <h3 className="text-xl font-bold tracking-tight text-primary mt-4">
                Executive Dispatch Brief
              </h3>
              <p className="italic bg-muted p-5 border-l-4 border-amber-500 rounded-r-2xl font-medium">
                {selectedArticle.summary}
              </p>
              {selectedArticle.content.split("\n\n").map((para, i) => {
                if (para.startsWith("## ")) {
                  return (
                    <h2
                      key={i}
                      className="text-2xl font-extrabold tracking-tight mt-6 text-foreground dark:text-white"
                    >
                      {para.replace("## ", "")}
                    </h2>
                  );
                }
                if (para.startsWith("* ")) {
                  return (
                    <ul key={i} className="list-disc pl-5 mt-2 space-y-1">
                      {para.split("\n").map((li, idx) => (
                        <li key={idx} className="text-xs md:text-sm">
                          {li.replace("* ", "")}
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (para.startsWith("> ")) {
                  return (
                    <blockquote
                      key={i}
                      className="p-4 bg-primary/5 border-l-4 border-primary rounded-r-xl italic font-serif"
                    >
                      {para.replace("> ", "")}
                    </blockquote>
                  );
                }
                return (
                  <p key={i} className="text-muted-foreground">
                    {para}
                  </p>
                );
              })}
            </div>

            {/* Tags */}
            <div className="pt-8 border-t flex flex-wrap gap-1.5 items-center">
              <Tag className="h-4 w-4 text-muted-foreground mr-1" />
              {selectedArticle.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-muted hover:bg-muted/85 px-3 py-1 font-semibold rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </article>
      ) : (
        /* NEWS DIRECTORY GRID */
        <>
          {/* Header Banner */}
          <section className="bg-muted border-b border-border py-16 text-center">
            <div className="mx-auto max-w-4xl px-6">
              <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 border border-primary/10 px-3.5 py-1.5 rounded-full">
                Media Relations
              </span>
              <h1 className="text-4xl md:text-5xl font-black mt-4 tracking-tighter text-foreground uppercase leading-[0.9]">
                The Corporate Newsroom
              </h1>
              <p className="text-muted-foreground text-xs md:text-sm mt-3 max-w-lg mx-auto leading-relaxed font-medium">
                Receive official press statements, technological discoveries, earnings releases, and
                subsidiary operational milestone reports directly from Tindi Holdings Ltd.
              </p>
            </div>
          </section>

          {/* Directory Content */}
          <section className="py-12 mx-auto max-w-screen-2xl px-4 md:px-6 w-full flex-1">
            <div className="grid lg:grid-cols-12 gap-8">
              {/* Left filter bar */}
              <div className="lg:col-span-3 space-y-6">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    type="text"
                    className="w-full h-10 pl-9 pr-3 rounded-lg bg-white border text-sm"
                    placeholder="Search Press Dispatches"
                  />
                </form>

                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground pl-1.5">
                    Categories
                  </h4>
                  <div className="flex flex-col gap-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategorySelect(cat)}
                        className={`text-left text-xs font-bold px-3 py-2.5 rounded-lg transition-colors ${
                          (cat === "All" && !category) || category === cat
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-foreground/80"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right news grid */}
              <div className="lg:col-span-9 space-y-6">
                {filtered.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    No circular dispatches matched filters.
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {filtered.map((item) => (
                      <div
                        key={item.id}
                        className="group flex flex-col justify-between bg-white border rounded-2xl hover:shadow-lg transition-all overflow-hidden"
                      >
                        <div>
                          <div className="h-44 overflow-hidden relative bg-muted">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-lg">
                              {item.category}
                            </span>
                          </div>
                          <div className="p-6">
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-3 font-semibold font-mono uppercase">
                              <span>{item.publishedAt}</span>
                              <span>•</span>
                              <span>{item.readTime}</span>
                            </div>
                            <h3 className="font-extrabold text-base text-foreground dark:text-white line-clamp-2 hover:text-primary transition-colors">
                              <Link to="/news" search={{ slug: item.slug }}>
                                {item.title}
                              </Link>
                            </h3>
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                              {item.summary}
                            </p>
                          </div>
                        </div>

                        <div className="p-5 pt-0 border-t flex justify-between items-center bg-muted mt-auto">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground font-mono">
                            {item.author}
                          </span>
                          <Link to="/news" search={{ slug: item.slug }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 text-xs font-bold text-primary hover:bg-transparent"
                            >
                              Read Article <Clock className="h-3.5 w-3.5 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Video Media Releases */}
                <div className="pt-12 border-t">
                  <h4 className="text-base font-extrabold uppercase tracking-wider text-foreground dark:text-white mb-6 flex items-center gap-2">
                    <Video className="h-5 w-5 text-amber-500" /> Press Video Rebroadcasts
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {galleryVideos.map((vid, i) => (
                      <div
                        key={i}
                        className="group bg-white border rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col md:flex-row"
                      >
                        <div className="h-28 w-full md:w-40 relative overflow-hidden shrink-0 bg-muted">
                          <img
                            src={vid.thumb}
                            alt={vid.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 grid place-items-center group-hover:bg-amber-500/20 transition-all cursor-pointer">
                            <Video className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
                          </div>
                        </div>
                        <div className="p-4 flex flex-col justify-between">
                          <h5 className="font-extrabold text-xs text-foreground dark:text-white line-clamp-2 leading-tight">
                            {vid.title}
                          </h5>
                          <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold mt-2">
                            <span>Length: {vid.length}</span>
                            <span>{vid.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <CorporateFooter />
      <CartDrawer open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />
    </div>
  );
}
