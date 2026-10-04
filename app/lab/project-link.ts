export function labProjectUrl(origin: string, projectId: string) {
  if (!/^LAB-\d{2}$/.test(projectId)) throw new Error("Invalid LAB project");
  const url = new URL("/lab/", origin);
  const id = projectId.toLowerCase();
  url.searchParams.set("project", id);
  url.hash = id;
  return url.href;
}
