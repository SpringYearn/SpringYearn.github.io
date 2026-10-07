import { notFound } from "next/navigation";
import { projects, resolveWorkId, workPageIds } from "../../portfolio-data";
import { ItemPage } from "../../item-page";
import { itemMetadata } from "../../share-data";

export const dynamicParams = false;
export function generateStaticParams() { return workPageIds.map(id => ({ id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) { return itemMetadata("work", (await params).id); }
export default async function WorkItem({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const project = projects.find(item => item.id === resolveWorkId(id));
  if (!project) notFound();
  return <ItemPage kind="work" project={project} />;
}
