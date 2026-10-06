import { notFound } from "next/navigation";
import { projectFiles } from "../files";
import { ItemPage } from "../../item-page";
import { itemMetadata } from "../../share-data";

export const dynamicParams = false;
export function generateStaticParams() { return projectFiles.map(file => ({ id: file.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) { return itemMetadata("project-files", (await params).id); }
export default async function ProjectFileItem({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const project = projectFiles.find(item => item.id === id);
  if (!project) notFound();
  return <ItemPage kind="project-files" project={project} />;
}
