import { buildUrl } from "@/utils/buildUrl";
import Head from "next/head";

export const Meta = () => {
  const title = "ChatVRM - by Franniel Medina";
  const description =
    "¡Chatea con personajes 3D basado en IA! Interactúa con avatares VRM usando inteligencia artificial, síntesis de voz y modelos de lenguaje avanzados.";
  const imageUrl = "https://chat-vrm-window.vercel.app/ogp.png";
  
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Head>
  );
};
