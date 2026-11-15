import { ResourceFrame } from "../resources/resource-frame";
import { LabContent } from "./lab-content";

export default function LabPage() {
  return <ResourceFrame section="lab"><LabContent showResourceSections /></ResourceFrame>;
}
