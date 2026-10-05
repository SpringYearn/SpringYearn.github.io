export type ProjectFile = {
  id: string;
  title: string;
  software: "ae" | "davinci";
  filename: string;
  bytes: number;
  sha256: string;
  downloadUrl: string;
  preview: { youtubeId: string } | { video: string; poster: string };
};

export const projectFiles: ProjectFile[] = [
  { id: "500lbs", title: "500lbs", software: "ae", filename: "500lbs.zip", bytes: 771494702, sha256: "5030cfac7189d770ee225c32d915f948c61e091ce131f9100104536aacc20566", downloadUrl: "https://github.com/SpringYearn/SpringYearn.github.io/releases/download/free-project-files/500lbs.zip", preview: { youtubeId: "tlQG91JzduI" } },
  { id: "rain", title: "Rain", software: "ae", filename: "Rain.zip", bytes: 958431525, sha256: "e51b3ec64d625381fb326f51d5cd719debbb1a198bc0845305d6d06a18b9174f", downloadUrl: "https://github.com/SpringYearn/SpringYearn.github.io/releases/download/free-project-files/Rain.zip", preview: { youtubeId: "8_FUuLjfkYQ" } },
  { id: "cant-stop-it", title: "can't stop it", software: "ae", filename: "can't stop it.zip", bytes: 1273190745, sha256: "62e98564f7b2db71a9b2785e6bebfd977ea58fd5026cca502387912952bc32e0", downloadUrl: "https://drive.google.com/file/d/1B21haWrxU65uynFzhilGh_XEiWF8mdyn/view?usp=sharing", preview: { youtubeId: "5QS5HHpqN80" } },
  { id: "ratchet", title: "ratchet", software: "ae", filename: "ratchet.aep", bytes: 2491504, sha256: "b431b5b799ae01b528eef7190ee43229b715bd960fd6db408c42939574529d48", downloadUrl: "/project-files/ratchet.aep", preview: { video: "/project-files/ratchet.mp4", poster: "/project-files/ratchet.webp" } },
  { id: "blisters", title: "blisters", software: "ae", filename: "blisters.zip", bytes: 1300768628, sha256: "66341927f77ef38bfc6392e9bb2827f1d61894164ce4588d350ab85d176660cc", downloadUrl: "https://github.com/SpringYearn/SpringYearn.github.io/releases/download/free-project-files/blisters.zip", preview: { video: "/project-files/blisters.mp4", poster: "/project-files/blisters.webp" } },
  { id: "need-2", title: "Need 2", software: "davinci", filename: "Need 2.zip", bytes: 238500842, sha256: "1482ccdda2e27f1752331a2d9f47da2dae0910540537f10616ee4997c16846df", downloadUrl: "https://github.com/SpringYearn/SpringYearn.github.io/releases/download/free-project-files/Need.2.zip", preview: { youtubeId: "Gg55gN6nvU0" } },
  { id: "awakening", title: "awakening", software: "davinci", filename: "awakening.zip", bytes: 2450859298, sha256: "fd8c6cd27eb83903c4c392aba7b3faa5f1f338051c7672cc5da37fd49b7d4466", downloadUrl: "https://drive.google.com/file/d/13Za5t8_igt0g4YovMO3VaYleavfkiloO/view?usp=sharing", preview: { youtubeId: "-2TTuHF8jic" } },
];
