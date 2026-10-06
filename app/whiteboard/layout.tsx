import type { Metadata } from "next";
export const metadata: Metadata = { title:"Whiteboard — SpringYearn", description:"A shared canvas for everyone passing through. Leave a little mark.", alternates:{canonical:"https://springyearn.github.io/whiteboard/"} };
export default function WhiteboardLayout({children}:{children:React.ReactNode}) { return children; }
