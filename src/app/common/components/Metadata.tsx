import { appConfig } from '@/configs/app';

export const metadataTitle = {
  default: appConfig.title,
  template: `%s | ${appConfig.title}`,
} as const;

export interface MetadataData {
  /** Page title. Omit it to use the site's default title, for example on the home page. */
  title?: string;
  description: string;
  /** Absolute public URL, without tracking parameters. */
  canonicalUrl?: string;
  /** Absolute public URL of the social preview image. */
  imageUrl?: string;
  noIndex?: boolean;
}

export interface MetadataProps {
  metadata: MetadataData;
}

/** Render one instance per active page; React 19 hoists these tags into <head>. */
export function Metadata({ metadata }: MetadataProps) {
  const { title, description, canonicalUrl, imageUrl, noIndex = false } = metadata;
  const pageTitle = title ? metadataTitle.template.replace('%s', title) : metadataTitle.default;
  const pageCanonicalUrl = canonicalUrl ?? (title ? undefined : appConfig.url);

  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta
        name="robots"
        content={noIndex || appConfig.env !== 'production' ? 'noindex, nofollow' : 'index, follow'}
      />
      {pageCanonicalUrl && <link rel="canonical" href={pageCanonicalUrl} />}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      {pageCanonicalUrl && <meta property="og:url" content={pageCanonicalUrl} />}
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      <meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
    </>
  );
}
