import { Box3, Color, DataTexture, DirectionalLight, Group, HemisphereLight, Mesh, MeshToonMaterial, NearestFilter, OrthographicCamera, RedFormat, Scene, Vector3, WebGLRenderer } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OutlineEffect } from "three/addons/effects/OutlineEffect.js";

export async function mountSpringLogo(host: HTMLElement): Promise<() => void> {
  const theme = getComputedStyle(host);
  const springColor = new Color(theme.getPropertyValue("--spring-leaf").trim());
  const springInk = new Color(theme.getPropertyValue("--spring").trim());
  const renderer = new WebGLRenderer({ alpha: true, antialias: true });
  const gradient = new DataTexture(new Uint8Array([75, 155, 255]), 3, 1, RedFormat);
  gradient.minFilter = gradient.magFilter = NearestFilter;
  gradient.generateMipmaps = false;
  gradient.needsUpdate = true;
  let model: Group | undefined;
  const releaseModel = () => model?.traverse(object => {
    if (object instanceof Mesh) {
      object.geometry.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach(material => material.dispose());
    }
  });
  try {
    const result = await new GLTFLoader().loadAsync("/springyearn-logo.glb");
    model = result.scene;
    model.rotation.x = Math.PI / 2;
    model.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(model);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());
    model.position.sub(center);
    const scale = 2.5 / Math.max(size.x, size.y, size.z);
    model.scale.setScalar(scale);
    model.position.multiplyScalar(scale);
    model.traverse(object => {
      if (object instanceof Mesh) {
        const previous = Array.isArray(object.material) ? object.material : [object.material];
        previous.forEach(material => material.dispose());
        object.material = new MeshToonMaterial({ color: springColor, gradientMap: gradient });
      }
    });
    const scene = new Scene();
    const turn = new Group();
    turn.add(model);
    turn.rotation.order = "YXZ";
    scene.add(turn, new HemisphereLight(0xffffff, springInk, .75));
    const key = new DirectionalLight(0xffffff, 1.7);
    key.position.set(-3, 5, 6);
    const rim = new DirectionalLight(springColor, .4);
    rim.position.set(4, -1, 2);
    scene.add(key, rim);
    const camera = new OrthographicCamera(-2, 2, 2, -2, .1, 30);
    camera.position.z = 8;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);
    host.classList.add("is-rendered");
    host.tabIndex = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const outline = new OutlineEffect(renderer, { defaultThickness: .0025, defaultColor: [.006, .008, .005] });
    let targetX = -.09, targetY = -.2, frame = 0, visible = true;
    let drag: { id: number; x: number; y: number; pitch: number; yaw: number } | undefined;
    turn.rotation.set(targetX, targetY, -.04);
    const render = () => outline.render(scene, camera);
    const animate = () => {
      frame = 0;
      if (!visible || document.hidden) return;
      turn.rotation.x += (targetX - turn.rotation.x) * .12;
      turn.rotation.y += (targetY - turn.rotation.y) * .12;
      const unsettled = Math.abs(targetX - turn.rotation.x) + Math.abs(targetY - turn.rotation.y) > .001;
      if (!unsettled) { turn.rotation.x = targetX; turn.rotation.y = targetY; }
      render();
      if (unsettled) frame = requestAnimationFrame(animate);
    };
    const schedule = () => {
      if (reduced.matches) { turn.rotation.set(targetX, targetY, -.04); render(); }
      else if (!frame && visible && !document.hidden) frame = requestAnimationFrame(animate);
    };
    const finish = (event?: PointerEvent) => {
      if (!drag || (event && event.pointerId !== drag.id)) return;
      const id = drag.id;
      drag = undefined;
      host.classList.remove("is-dragging");
      if (host.hasPointerCapture(id)) host.releasePointerCapture(id);
    };
    const reset = () => {
      finish();
      targetX = -.09; targetY = -.2;
      cancelAnimationFrame(frame); frame = 0; schedule();
    };
    const down = (event: PointerEvent) => {
      if (drag || !event.isPrimary || event.button !== 0) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, pitch: targetX, yaw: targetY };
      host.setPointerCapture(event.pointerId);
      host.classList.add("is-dragging");
      host.focus({ preventScroll: true });
      event.preventDefault();
    };
    const move = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const sensitivity = Math.PI * 2 / Math.max(host.clientWidth, 250);
      targetY = drag.yaw + (event.clientX - drag.x) * sensitivity;
      targetX = Math.max(-1.4, Math.min(1.4, drag.pitch + (event.clientY - drag.y) * sensitivity));
      schedule();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Home") { event.preventDefault(); reset(); return; }
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "ArrowLeft") targetY -= .16;
      if (event.key === "ArrowRight") targetY += .16;
      if (event.key === "ArrowUp") targetX = Math.max(-1.4, targetX - .16);
      if (event.key === "ArrowDown") targetX = Math.min(1.4, targetX + .16);
      schedule();
    };
    const resize = new ResizeObserver(() => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      const aspect = width / height;
      // Fit the rotated silhouette even in a narrow portrait viewer.
      camera.left = -1.8 * Math.max(1, aspect); camera.right = -camera.left;
      camera.top = 1.8 * Math.max(1, 1 / aspect); camera.bottom = -camera.top;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      render();
    });
    resize.observe(host);
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); });
    visibility.observe(host);
    const onVisibility = () => { if (document.hidden) finish(); else schedule(); };
    const blur = () => finish();
    host.addEventListener("pointerdown", down);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerup", finish);
    host.addEventListener("pointercancel", finish);
    host.addEventListener("lostpointercapture", finish);
    host.addEventListener("keydown", keyboard);
    host.addEventListener("spring-logo-reset", reset);
    reduced.addEventListener("change", schedule);
    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", onVisibility);
    const lost = (event: Event) => { event.preventDefault(); finish(); host.classList.remove("is-rendered"); host.tabIndex = -1; };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    return () => {
      cancelAnimationFrame(frame);
      finish();
      resize.disconnect(); visibility.disconnect();
      host.removeEventListener("pointerdown", down); host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerup", finish); host.removeEventListener("pointercancel", finish);
      host.removeEventListener("lostpointercapture", finish); host.removeEventListener("keydown", keyboard);
      host.removeEventListener("spring-logo-reset", reset);
      reduced.removeEventListener("change", schedule); window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      host.classList.remove("is-rendered"); host.tabIndex = -1; renderer.domElement.remove();
      releaseModel(); gradient.dispose(); renderer.dispose();
    };
  } catch (error) {
    releaseModel(); gradient.dispose(); renderer.dispose();
    throw error;
  }
}
