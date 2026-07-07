import { ShoppingBag, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export function StoreFooter() {
  return (
    <footer className="bg-navy text-navy-foreground mt-20">
      <div className="mx-auto max-w-screen-2xl px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-xl bg-primary grid place-items-center">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">ShopSphere</span>
          </div>
          <p className="text-sm text-white/60 max-w-xs">
            Premium multi-branch commerce platform. Quality products, delivered globally.
          </p>
          <div className="flex gap-3 mt-5">
            {[Facebook, Twitter, Instagram, Youtube].map((I, i) => (
              <a
                key={i}
                href="#"
                className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 grid place-items-center"
              >
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {[
          { title: "Company", links: ["About", "Careers", "Press", "Blog"] },
          { title: "Support", links: ["Help Center", "Shipping", "Returns", "Contact"] },
          { title: "Legal", links: ["Privacy", "Terms", "Cookies", "Licenses"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="font-semibold text-sm mb-4">{col.title}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-white">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-screen-2xl px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© 2026 ShopSphere. All rights reserved.</p>
          <p>Crafted with care for global commerce.</p>
        </div>
      </div>
    </footer>
  );
}
