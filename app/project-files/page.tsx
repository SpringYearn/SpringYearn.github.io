import { ResourceFrame } from "../resources/resource-frame";
import { ProjectFilesContent } from "./project-files-content";

export default function ProjectFilesPage() {
  return <ResourceFrame section="project-files"><ProjectFilesContent showResourceSections /></ResourceFrame>;
}
