export type Language = "en" | "zh";
export type Category = "all" | "editing" | "3d" | "drawing";

export type Project = {
  id: string;
  title: string;
  type: Record<Language, string>;
  detail: Record<Language, string>;
  category: Category;
  art: "video" | "image";
  href: string;
  thumbnail: string;
  mediaType?: "image" | "video";
  fit?: "cover" | "contain";
  frame?: "landscape" | "portrait";
};

export const projects: Project[] = [
  {
    id: "01",
    title: "Blight",
    type: { en: "Editing / Game visual", zh: "剪輯／遊戲影像" },
    detail: { en: "YouTube", zh: "YouTube" },
    category: "editing",
    art: "video",
    href: "https://youtu.be/GTrQrntgJ-k?si=HJJYSvUyAUpN1mwP",
    thumbnail: "https://i.ytimg.com/vi/GTrQrntgJ-k/maxresdefault.jpg",
  },
  {
    id: "02",
    title: "In my room",
    type: { en: "Editing / 3D visual", zh: "剪輯／3D 影像" },
    detail: { en: "YouTube", zh: "YouTube" },
    category: "editing",
    art: "video",
    href: "https://youtu.be/u5NagxwYeoE?si=MrOpPlLWEP967aC1",
    thumbnail: "https://i.ytimg.com/vi/u5NagxwYeoE/maxresdefault.jpg",
  },
  {
    id: "03",
    title: "14.3 Billion Years",
    type: { en: "Editing / Valorant", zh: "剪輯／無畏契約" },
    detail: { en: "YouTube", zh: "YouTube" },
    category: "editing",
    art: "video",
    href: "https://youtu.be/XXijIJn98B4?si=HJxj_z7j_QlCHOXm",
    thumbnail: "https://i.ytimg.com/vi/XXijIJn98B4/maxresdefault.jpg",
  },
  {
    id: "04",
    title: "Look at the sky text pv",
    type: { en: "Motion graphics / Typography", zh: "動態圖形／文字設計" },
    detail: { en: "YouTube", zh: "YouTube" },
    category: "editing",
    art: "video",
    href: "https://youtu.be/LQowVkvM7FE?si=HVTxP7Jr1Pgktnya",
    thumbnail: "https://i.ytimg.com/vi/LQowVkvM7FE/maxresdefault.jpg",
  },
  {
    id: "05",
    title: "OMEN / MEMORY",
    type: { en: "Earlier 3D artwork", zh: "早期 3D 作品" },
    detail: { en: "2024 / Instagram", zh: "2024／Instagram" },
    category: "3d",
    art: "image",
    href: "https://www.instagram.com/p/C_BseMrz0zq/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA==",
    thumbnail: "/works/overpass-scene.webp",
  },
  {
    id: "06",
    title: "VERY SUS PORTAL",
    type: { en: "Earlier 3D artwork", zh: "早期 3D 作品" },
    detail: { en: "2024.07 / Instagram", zh: "2024.07／Instagram" },
    category: "3d",
    art: "image",
    href: "https://www.instagram.com/p/C9Xr3-8yEup/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA==",
    thumbnail: "/works/very-sus-portal.webp",
  },
  {
    id: "07",
    title: "BULLET COLLISION",
    type: { en: "Earlier 3D motion study", zh: "早期 3D 動態實驗" },
    detail: { en: "2024 / Instagram", zh: "2024／Instagram" },
    category: "3d",
    art: "video",
    href: "https://www.instagram.com/reel/C9IPaARgqkf/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA==",
    thumbnail: "/works/bullet-collision.mp4",
    mediaType: "video",
  },
  {
    id: "08",
    title: "CANNOLI STUDY",
    type: { en: "Earlier drawing", zh: "早期繪畫" },
    detail: { en: "2025 / Instagram", zh: "2025／Instagram" },
    category: "drawing",
    art: "image",
    href: "https://www.instagram.com/p/DFe5KvATedi/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA==",
    thumbnail: "/works/cannoli-illustration.webp",
    fit: "contain",
    frame: "portrait",
  },
  {
    id: "09",
    title: "SWORD / CHARACTER POSTER",
    type: { en: "Earlier drawing", zh: "早期繪畫" },
    detail: { en: "2024.09 / Instagram", zh: "2024.09／Instagram" },
    category: "drawing",
    art: "image",
    href: "https://www.instagram.com/p/DAB2FLRzvFV/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA==",
    thumbnail: "/works/sword-character-poster.webp",
    fit: "contain",
    frame: "portrait",
  },
  {
    id: "10",
    title: "PORTRAIT SKETCH",
    type: { en: "Earlier drawing", zh: "早期繪畫" },
    detail: { en: "2024.09 / Instagram", zh: "2024.09／Instagram" },
    category: "drawing",
    art: "image",
    href: "https://www.instagram.com/p/C_8n1MtzMnD/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA==",
    thumbnail: "/works/portrait-sketch.webp",
    fit: "contain",
    frame: "portrait",
  },
  {
    id: "11",
    title: "GEOMETRIC PORTRAIT",
    type: { en: "Graphic illustration", zh: "平面插畫" },
    detail: { en: "Original artwork", zh: "完整原作" },
    category: "drawing",
    art: "image",
    href: "/works/geometric-portrait.webp",
    thumbnail: "/works/geometric-portrait.webp",
    fit: "contain",
    frame: "portrait",
  },
  {
    id: "12",
    title: "RABBIT CHARACTER DESIGN",
    type: { en: "Character design", zh: "角色設計" },
    detail: { en: "Original artwork", zh: "完整原作" },
    category: "drawing",
    art: "image",
    href: "/works/rabbit-character-design.webp",
    thumbnail: "/works/rabbit-character-design.webp",
    fit: "contain",
    frame: "portrait",
  },
  {
    id: "13",
    title: "ORDINARY / 平凡",
    type: { en: "Narrative illustration", zh: "敘事插畫" },
    detail: { en: "Original artwork", zh: "完整原作" },
    category: "drawing",
    art: "image",
    href: "/works/ordinary-illustration.jpg",
    thumbnail: "/works/ordinary-illustration.jpg",
    fit: "contain",
    frame: "portrait",
  },
];
