import { Box3, Color, DirectionalLight, Group, HemisphereLight, Mesh, MeshStandardMaterial, OrthographicCamera, Scene, Vector3, WebGLRenderer } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export async function mountSpringLogo(host: HTMLElement): Promise<() => void> {
  const renderer = new WebGLRenderer({ alpha: true, antialias: true });
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
      if (object instanceof Mesh && object.material instanceof MeshStandardMaterial) {
        object.material.color = new Color("#718c79");
        object.material.metalness = .38;
        object.material.roughness = .3;
      }
    });
    const scene = new Scene();
    const turn = new Group();
    turn.add(model);
    scene.add(turn, new HemisphereLight(0xf4f3e9, 0x536358, 3));
    const key = new DirectionalLight(0xfff5e4, 4);
    key.position.set(-3, 5, 6);
    const rim = new DirectionalLight(0xb7d4c6, 3);
    rim.position.set(4, -1, 2);
    scene.add(key, rim);
    const camera = new OrthographicCamera(-2, 2, 2, -2, .1, 30);
    camera.position.z = 8;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);
    host.classList.add("is-rendered");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let targetX = -.09, targetY = -.2, frame = 0, visible = true;
    turn.rotation.set(targetX, targetY, -.04);
    const render = () => renderer.render(scene, camera);
    const animate = () => {
      frame = 0;
      if (!visible || document.hidden) return;
      turn.rotation.x += (targetX - turn.rotation.x) * .12;
      turn.rotation.y += (targetY - turn.rotation.y) * .12;
      render();
      if (Math.abs(targetX - turn.rotation.x) + Math.abs(targetY - turn.rotation.y) > .001) frame = requestAnimationFrame(animate);
    };
    const schedule = () => { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(animate); };
    const reset = () => {
      targetX = -.09; targetY = -.2;
      if (reduced.matches) { cancelAnimationFrame(frame); frame = 0; turn.rotation.set(targetX, targetY, -.04); render(); }
      else schedule();
    };
    const move = (event: PointerEvent) => {
      if (reduced.matches || event.pointerType !== "mouse") return;
      const rect = host.getBoundingClientRect();
      targetY = -.2 + ((event.clientX - rect.left) / rect.width - .5) * .36;
      targetX = -.09 + ((event.clientY - rect.top) / rect.height - .5) * .24;
      schedule();
    };
    const resize = new ResizeObserver(() => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      const aspect = width / height;
      camera.left = -1.65 * aspect; camera.right = 1.65 * aspect;
      camera.top = 1.65; camera.bottom = -1.65;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      render();
    });
    resize.observe(host);
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); });
    visibility.observe(host);
    const onVisibility = () => { if (!document.hidden) schedule(); };
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", reset);
    reduced.addEventListener("change", reset);
    document.addEventListener("visibilitychange", onVisibility);
    const lost = (event: Event) => { event.preventDefault(); host.classList.remove("is-rendered"); };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect(); visibility.disconnect();
      host.removeEventListener("pointermove", move); host.removeEventListener("pointerleave", reset);
      reduced.removeEventListener("change", reset); document.removeEventListener("visibilitychange", onVisibility);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      host.classList.remove("is-rendered"); renderer.domElement.remove();
      releaseModel(); renderer.dispose();
    };
  } catch (error) {
    releaseModel(); renderer.dispose();
    throw error;
  }
}
