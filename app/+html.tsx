import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

const socialTitle = "Onzait — Run your sites without the paperwork.";
const socialDescription =
  "Projects, tasks, crew and daily reports for small construction teams.";
const socialImage = "https://www.onzait.com/images/onzait-og.png";
const socialImageAlt =
  "Onzait: Run your sites without the paperwork. Project progress, tasks and daily reports.";

export default function WebDocumentRoute({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ScrollViewStyleReset />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="onzait" />
        <meta property="og:title" content={socialTitle} />
        <meta property="og:description" content={socialDescription} />
        <meta property="og:image" content={socialImage} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={socialImageAlt} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={socialTitle} />
        <meta name="twitter:description" content={socialDescription} />
        <meta name="twitter:image" content={socialImage} />
        <meta name="twitter:image:alt" content={socialImageAlt} />
      </head>
      <body>{children}</body>
    </html>
  );
}
