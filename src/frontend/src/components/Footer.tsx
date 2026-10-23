import { Link } from "@tanstack/react-router";
import { LAYOUT_TEXT } from "../i18n/common/layout";
import { SITE_TEXT } from "../i18n/common/site";
import { useDict } from "../i18n/core";
import { FlatTokenIcon } from "./FlatTokenIcon";

type FooterLabelKey =
  | "navHome"
  | "navWhitePaper"
  | "navGetIcp"
  | "navWallet"
  | "navHistory";

const FOOTER_LINKS: Array<{
  to: string;
  labelKey: FooterLabelKey;
  ocid: string;
}> = [
  { to: "/", labelKey: "navHome", ocid: "footer.home_link" },
  {
    to: "/white-paper",
    labelKey: "navWhitePaper",
    ocid: "footer.white_paper_link",
  },
  { to: "/buy-icp", labelKey: "navGetIcp", ocid: "footer.buy_icp_link" },
  { to: "/wallet", labelKey: "navWallet", ocid: "footer.wallet_link" },
  { to: "/history", labelKey: "navHistory", ocid: "footer.history_link" },
];

const CREST_SRC = "/assets/generated/ttti-emblem.dim_1024x1024.png";

interface CrestLogoProps {
  /** Sizing and layout classes for the circular frame. */
  className?: string;
  /** Accessible name; leave empty for decorative usage. */
  alt?: string;
  loading?: "eager" | "lazy";
}

/**
 * The TTTI emblem (an antique-gold embossed medallion with a stylized face
 * above the TTTI lettering) clipped to its circular badge. The artwork sits on
 * a solid near-black square with the medallion nearly filling the frame, so a
 * light scale inside the rounded-full frame trims the dark corners while
 * keeping the outer gold rim and the TTTI lettering fully visible.
 */
export function CrestLogo({
  className = "",
  alt = "",
  loading,
}: CrestLogoProps) {
  return (
    <span
      className={`relative block shrink-0 overflow-hidden rounded-full ${className}`}
      aria-hidden={alt ? undefined : true}
    >
      <img
        src={CREST_SRC}
        alt={alt}
        width={1024}
        height={1024}
        loading={loading}
        draggable={false}
        className="h-full w-full scale-[1.15] object-cover"
      />
    </span>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const t = useDict(LAYOUT_TEXT);
  const site = useDict(SITE_TEXT);

  return (
    <footer className="mt-auto border-t border-gold bg-card">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-[1.2fr_1fr_1.4fr] md:gap-12">
        <div className="flex flex-col gap-4">
          <Link
            to="/"
            className="flex w-fit items-center gap-3 rounded-md transition-smooth hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-ocid="footer.brand_link"
          >
            <FlatTokenIcon alt={t.tokenAlt} className="h-12 w-12" />
            <span className="text-imperial text-sm leading-tight text-gradient-gold">
              The Ten Thousand
              <br />
              Immortals
            </span>
          </Link>
        </div>

        <nav aria-label={t.footerNav} className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            {t.navigateHeading}
          </p>
          <ul className="flex flex-col gap-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="inline-flex min-h-6 items-center rounded-sm text-sm text-muted-foreground transition-smooth hover:translate-x-0.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  data-ocid={link.ocid}
                >
                  {t[link.labelKey]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-3" data-ocid="footer.disclaimer">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            {t.noticeHeading}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t.legalNotice}
          </p>
          {site.conflictNotice && (
            <p
              className="text-sm leading-relaxed text-muted-foreground"
              data-ocid="footer.conflict_notice"
            >
              {site.conflictNotice}
            </p>
          )}
        </div>
      </div>

      <div className="divider-gold" />
      <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row">
        <p data-ocid="footer.copyright">{t.copyright(year)}</p>
        <img
          src="/assets/badges/on-chain-100-white.svg"
          alt={t.onchainBadgeAlt}
          data-ocid="footer.onchain_badge"
          loading="lazy"
          className="h-12 w-auto object-contain opacity-90"
        />
      </div>
    </footer>
  );
}
