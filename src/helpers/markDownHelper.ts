import { Marked, Renderer } from "marked";
import DOMPurify from "dompurify";

const renderer = new Renderer();

renderer.link = ({ href, title, text }) => {
  // Customize how you want links to be rendered
  return `<a href="${href}" title="${title || ""}" target="reference">${text}</a>`;
};
const marked = new Marked();
marked.use({ renderer });

export function getMarkDownContent(content: string) {
  //DOMSanitize to avoid some XSS attacks
  const markdown = marked.parse(content) as string;
  // we sanitize but leave the "target" of links in
  return DOMPurify.sanitize(markdown, { ADD_ATTR: ["target"] });
}
