import type { Box, BuildTask, Glyph, TaskKind } from "./types";

const excluded = '.sr-only,script,style,noscript,dialog,[hidden],.art-cursor,.grain,.scroll-progress,.site-status,.spring-logo,.spring-logo-controls,.language-menu,.mobile-nav-panel,.mobile-nav-overlay,.board-viewport,.board-tool-group,input,textarea,select,[contenteditable="true"],[data-swarm-ignore]';
const semantics = 'h1,h2,h3,h4,p,a,button,li,label,summary,time,small,strong,figcaption';
const frames = '.site-header,.hero-composition,.work-gateway,.project-files-gateway,.pf-gateway,.lab-entry-link,.project-card,.overview-item,.featured-work-card,.pf-card,.lab-card,.brand-meanings article,.practice-card,.history-item,section.section-block';

export function documentBox(element: Element): Box {
  const box = element.getBoundingClientRect();
  return { x: box.left + scrollX, y: box.top + scrollY, width: box.width, height: box.height };
}

type Saved = { pending: string | null; inert: boolean; reveal: string | null; variable: string; priority: string };

/** Read the live document once; own only temporary attributes, never its text or layout. */
export class DOMAnalyzer {
  private saved = new Map<HTMLElement | SVGElement, Saved>();
  tasks: BuildTask[] = [];

  analyze(root: HTMLElement) {
    const groups = new Map<HTMLElement | SVGElement, Text[]>();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || !node.textContent?.trim() || parent.closest(excluded) || parent.closest('svg')) continue;
      const owner = parent.closest<HTMLElement>(semantics) ?? parent;
      if (!root.contains(owner) || owner.closest(excluded)) continue;
      if (!groups.has(owner)) groups.set(owner, []);
      groups.get(owner)!.push(node as Text);
    }
    const targets = new Map<HTMLElement | SVGElement, TaskKind>();
    for (const element of root.querySelectorAll<HTMLElement>(frames)) {
      if (!element.closest(excluded) && !element.querySelector('canvas,input,textarea,[contenteditable="true"]')) targets.set(element, "frame");
    }
    for (const element of root.querySelectorAll<HTMLElement>('img,video,hr')) {
      if (!element.closest(excluded)) targets.set(element, element.tagName === 'HR' ? 'line' : 'image');
    }
    for (const element of groups.keys()) targets.set(element, 'text');
    const elements = [...targets.keys()].filter(element => {
      if (element.closest(excluded)) return false;
      const style = getComputedStyle(element), box = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1;
    });
    elements.sort((a, b) => a === b ? 0 : a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
    const ids = new Map(elements.map((element, index) => [element, index]));
    const clips = new Map<Element, HTMLElement | null>();
    const clipFor = (element: HTMLElement | null): HTMLElement | null => {
      if (!element || element === root) return null;
      if (clips.has(element)) return clips.get(element)!;
      const style = getComputedStyle(element);
      const clip = /hidden|clip|scroll|auto/.test(`${style.overflowX} ${style.overflowY}`) ? element : clipFor(element.parentElement);
      clips.set(element, clip); return clip;
    };
    this.tasks = elements.map((element, order) => {
      let ancestor = element.parentElement, parent: number | null = null, depth = 0;
      while (ancestor && ancestor !== root) {
        depth++;
        if (parent === null && ids.has(ancestor)) parent = ids.get(ancestor)!;
        ancestor = ancestor.parentElement;
      }
      const nodes = groups.get(element) ?? [], length = nodes.reduce((sum, text) => sum + (text.textContent?.length ?? 0), 0);
      const kind = targets.get(element)!;
      const previous = element.previousElementSibling;
      const source = previous && ids.has(previous as HTMLElement) ? ids.get(previous as HTMLElement)! : null;
      const priority = element.closest('.site-header') ? 0 : kind === 'frame' || element.matches('h1,h2,h3,h4,strong.hero-display') ? 1 : kind === 'image' ? 3 : element.matches('button') ? 4 : kind === 'line' ? 5 : 2;
      const clipElement = clipFor(element.parentElement);
      return { id: order, element, kind, nodes, rect: documentBox(element), clipElement, clip: clipElement ? documentBox(clipElement) : null, parent, source, depth, order, priority, state: 'pending',
        operation: kind === 'text' ? 'type' : kind === 'image' ? 'scan' : source !== null ? 'duplicate' : order % 3 === 0 ? 'align' : 'draw',
        duration: kind === 'text' ? Math.min(3.2, Math.max(.55, length * .018)) : kind === 'image' ? 1.15 : .72 };
    });
    return this.tasks;
  }

  conceal() {
    for (const task of this.tasks) {
      const element = task.element;
      this.saved.set(element, { pending: element.getAttribute('data-swarm-pending'), inert: element.hasAttribute('inert'),
        reveal: element.getAttribute('data-swarm-reveal'), variable: element.style.getPropertyValue('--swarm-reveal'), priority: element.style.getPropertyPriority('--swarm-reveal') });
      element.setAttribute('data-swarm-pending', '');
      element.setAttribute('inert', '');
    }
  }

  measure(tasks = this.tasks) {
    for (const task of tasks) if (task.element.isConnected) {
      task.rect = documentBox(task.element);
      if (task.clipElement) task.clip = documentBox(task.clipElement);
    }
  }

  scan(task: BuildTask, progress: number) {
    task.element.setAttribute('data-swarm-reveal', '');
    task.element.style.setProperty('--swarm-reveal', String(progress));
  }

  reveal(task: BuildTask) {
    const before = this.saved.get(task.element);
    if (!before) return;
    const element = task.element;
    if (before.pending === null) element.removeAttribute('data-swarm-pending'); else element.setAttribute('data-swarm-pending', before.pending);
    if (!before.inert) element.removeAttribute('inert');
    if (before.reveal === null) element.removeAttribute('data-swarm-reveal'); else element.setAttribute('data-swarm-reveal', before.reveal);
    if (before.variable) element.style.setProperty('--swarm-reveal', before.variable, before.priority); else element.style.removeProperty('--swarm-reveal');
  }

  restore() { for (const task of this.tasks) this.reveal(task); this.saved.clear(); }
}

/** Glyph positions are measured in a read-only pass before any overlay writes. */
export function measureGlyphs(task: BuildTask): Glyph[] {
  const glyphs: Glyph[] = [], box = task.element.getBoundingClientRect();
  const segmenter = new Intl.Segmenter(document.documentElement.lang, { granularity: 'grapheme' });
  for (const node of task.nodes) {
    if (!node.isConnected || !node.parentElement) continue;
    const style = getComputedStyle(node.parentElement), text = node.textContent ?? '', range = document.createRange();
    for (const part of segmenter.segment(text)) {
      range.setStart(node, part.index); range.setEnd(node, part.index + part.segment.length);
      const rect = range.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      const value = style.textTransform === 'uppercase' ? part.segment.toLocaleUpperCase() : style.textTransform === 'lowercase' ? part.segment.toLocaleLowerCase() : part.segment;
      glyphs.push({ text: value, x: rect.left - box.left, y: rect.top - box.top, width: rect.width, height: rect.height,
        font: style.font || `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`, color: style.color, spacing: style.letterSpacing });
    }
  }
  return glyphs;
}
