import type { Language } from "../portfolio-data";
import type { Locale } from "../site-language";

export const featuredWorkIds = ["02", "01", "03"];
export const featuredSummaries: Record<string, Record<Language, string> & Partial<Record<Locale, string>>> = {
  "02": { en: "My ACEEC 25 entry: 7th place, and the piece that got me into ATLAS T2.", zh: "ACEEC 25 第 7 名，也是我加入 ATLAS T2 的作品。", ja: "ACEEC 25 で7位。この作品で ATLAS T2 のメンバーにもなりました。", ko: "ACEEC 25에서 7위를 차지하고 ATLAS T2에 합류하게 해 준 작품이에요.", ru: "Моя работа для ACEEC 25: 7-е место и вступление в ATLAS T2.", vi: "Tác phẩm dự thi ACEEC 25 đạt hạng 7 và giúp mình gia nhập ATLAS T2." },
  "01": { en: "A personal edit from 2026, trying a new style and some hard-won bullet-camera shots.", zh: "2026 年的個人剪輯，嘗試新風格與費了不少工夫的子彈運鏡。", ja: "2026年の個人作品。新しいスタイルと、苦労して作った弾丸のカメラワーク。", ko: "새로운 스타일과 어렵게 완성한 총알 카메라 장면을 담은 2026년 개인 작품이에요.", ru: "Личная работа 2026 года: новый стиль и непростые пролёты камеры за пулей.", vi: "Tác phẩm cá nhân năm 2026, thử phong cách mới và những cảnh camera theo viên đạn đầy công sức." },
  "03": { en: "My EPHEC entry: 3rd place, and one of my favorite edits from 2025.", zh: "EPHEC 第三名，也是我 2025 年最滿意的作品之一。", ja: "EPHEC で3位。2025年の作品の中でも特に気に入っています。", ko: "EPHEC에서 3위를 차지한, 2025년 작품 중 특히 만족하는 편집이에요.", ru: "Моя работа для EPHEC: 3-е место и одна из любимых работ за 2025 год.", vi: "Tác phẩm dự thi EPHEC đạt hạng 3, cũng là một trong những bản dựng mình thích nhất năm 2025." },
  "14": { en: "App design system and mobile interface.", zh: "APP 設計系統與手機介面。" },
  "27": { en: "A digitally drawn character design.", zh: "以數位繪畫呈現的角色設計。" },
};
