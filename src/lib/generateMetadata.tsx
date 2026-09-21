import { Metadata } from "next";

const SITE_URL = "https://www.interviewmaster.ai";
const SITE_NAME = "InterviewMaster.ai";

export function generateMetadata({
  title = "InterviewMaster.ai",
  description = "AI-powered interview preparation by Sameer. Practice mock interviews, build resumes, and get ready for your next role.",
  image = "/thumbnail.png",
  noIndex = false,
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
} = {}): Metadata {
  const fullImageUrl = new URL(image, SITE_URL).toString()
  return {
    title,
    description,
    authors: [{ name: "Sameer" }],
    creator: "Sameer",
    publisher: "Sameer",
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: SITE_URL,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@interviewmaster",
      site: "@interviewmaster"
    },
    icons: [
      {
        rel: 'icon',
        type: 'image/png',
        media: '(prefers-color-scheme: light)',
        url: '/seo/favicon.ico',
      },
      {
        rel: 'icon',
        type: 'image/png',
        media: '(prefers-color-scheme: dark)',
        url: '/seo/favicon.ico',
      },
      {
        rel: 'apple-touch-icon',
        url: '/seo/apple-touch-icon.png',
      },
    ],
    metadataBase: new URL(SITE_URL),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false
      }
    })
  }
}
