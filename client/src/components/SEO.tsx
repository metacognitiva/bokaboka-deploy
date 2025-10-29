import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  schema?: object;
}

export default function SEO({
  title = "BokaBoka - Encontre Profissionais Verificados e Confiáveis",
  description = "Busque profissionais verificados sem cadastro. Psicólogos, pintores, eletricistas e mais. Para contratar e ver telefone/WhatsApp, crie sua conta gratuita. Negócios que nascem de pessoa pra pessoa, de confiança pra confiança.",
  keywords = "contratar profissionais, serviços verificados, profissionais confiáveis, psicólogo, pintor, eletricista, encanador, diarista, personal trainer, nutricionista, advogado, contador, encontrar profissionais, serviços brasil, profissionais brasil",
  image = "https://bokaboka-zwyrq4ic.manus.space/logo.png",
  url = "https://bokaboka-zwyrq4ic.manus.space",
  type = "website",
  schema,
}: SEOProps) {
  const fullTitle = title.includes("BokaBoka") ? title : `${title} | BokaBoka`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="BokaBoka" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Portuguese" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="BokaBoka" />
      
      {/* Geo Tags */}
      <meta name="geo.region" content="BR" />
      <meta name="geo.placename" content="Brasil" />
      
      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

