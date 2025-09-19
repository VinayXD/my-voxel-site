// src/systems/UIManager.ts
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { SectionId } from './SectionManager';
import type { SectionId as SectionIdT } from './SectionManager';
import {
  createHeroPanelEl,
  createSkillsPanelEl,
  createProjectsPanelEl,
  createHUDNavEl,
  createSocialPanelEl,
} from '../ui/sections';

const PANEL_SCALE = 0.005; // adjust as you like

// ===== Manual calibration knobs you can edit anytime =====
export const UI_CAL = {
  projects: {
    shareXZWithSkills: true,                     // make Projects share Skills X/Z (same framing)
    pos: new THREE.Vector3(-0.4, 0.3,1.5),    // extra offset from its anchor (meters)
    rotDeg: { x:-12, y: 0, z: 0 },                // extra rotation (degrees), applied AFTER billboard
  },
  social: {
    offsetFromHero: new THREE.Vector3(4, 0, -2), // where to place social panel relative to Hero panel
  },
};

export class UIManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private cssRenderer: CSS3DRenderer;
  private root: HTMLElement;

  private panels: Record<SectionIdT, CSS3DObject> = {} as any;
  private hud?: CSS3DObject;

  // HUD anchoring
  private viewport = { w: window.innerWidth, h: window.innerHeight };
  private hudDistance = 1.0;  // meters in front of camera
  private hudMarginPx = 24;   // gap from top in pixels

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.scene = scene;
    this.camera = camera;

    this.cssRenderer = new CSS3DRenderer();
    this.cssRenderer.setSize(this.viewport.w, this.viewport.h);

    this.root = this.cssRenderer.domElement;
    this.root.classList.add('css3d-root');
    this.root.style.pointerEvents = 'none';
    document.body.appendChild(this.root);
  }

  buildPanels(positions: { heroAt: THREE.Vector3; skillsAt: THREE.Vector3; projectsAt: THREE.Vector3; }) {
    // ----- HERO -----
    const heroObj = new CSS3DObject(createHeroPanelEl());
    heroObj.position.copy(positions.heroAt);
  
    heroObj.scale.setScalar(PANEL_SCALE);
    (heroObj as any).__anchor = heroObj.position.clone(); // store stable anchor
    this.scene.add(heroObj);
    this.panels[SectionId.Hero] = heroObj;

    // Social panel (anchored relative to hero)
    const socialObj = new CSS3DObject(createSocialPanelEl());
    const socialAnchor = positions.heroAt.clone().add(UI_CAL.social.offsetFromHero);
    socialObj.position.copy(socialAnchor);
    socialObj.scale.setScalar(PANEL_SCALE);
    (socialObj as any).__anchor = socialAnchor.clone(); // keep its own anchor
    this.scene.add(socialObj);
    (this.panels[SectionId.Hero] as any).social = socialObj;

    // ----- SKILLS -----
    const skillsObj = new CSS3DObject(createSkillsPanelEl());
    skillsObj.position.copy(positions.skillsAt);
    skillsObj.scale.setScalar(PANEL_SCALE);
    (skillsObj as any).__anchor = skillsObj.position.clone();
    this.scene.add(skillsObj);
    this.panels[SectionId.Skills] = skillsObj;

    // ----- PROJECTS -----
    const projectsObj = new CSS3DObject(createProjectsPanelEl());

    // Start from provided Projects anchor
    projectsObj.position.copy(positions.projectsAt);

    // Optionally share X/Z with Skills for identical camera alignment
    if (UI_CAL.projects.shareXZWithSkills) {
      projectsObj.position.x = positions.skillsAt.x;
      projectsObj.position.z = positions.skillsAt.z;
    }

    // Store anchor (baseline). Do NOT bake the manual offset/rotation here;
    // those are applied stably every frame in update().
    (projectsObj as any).__anchor = projectsObj.position.clone();

    projectsObj.scale.setScalar(PANEL_SCALE);
    this.scene.add(projectsObj);
    this.panels[SectionId.Projects] = projectsObj;

    // Initial visibility
    this.setVisible(SectionId.Hero, true);
    this.setVisible(SectionId.Skills, false);
    this.setVisible(SectionId.Projects, false);
  }

  buildHUD(handlers: { onHero: ()=>void; onSkills: ()=>void; onProjects: ()=>void; }) {
    const navObj = new CSS3DObject(createHUDNavEl(handlers));
    this.camera.add(navObj);
    if (!this.camera.parent) this.scene.add(this.camera);
    this.hud = navObj;
    this.updateHUDAnchor();
  }

  /** Called by SectionManager when a section becomes active. */
  showSection(id: SectionIdT) {
    this.setVisible(SectionId.Hero, id === SectionId.Hero);
    this.setVisible(SectionId.Skills, id === SectionId.Skills);
    this.setVisible(SectionId.Projects, id === SectionId.Projects);
  }

  private setVisible(id: SectionIdT, visible: boolean) {
    const p = this.panels[id];
    if (!p) return;
    p.element.style.display = visible ? 'block' : 'none';

    // If it's Hero, also toggle the attached social panel
    if (id === SectionId.Hero && (p as any).social) {
      (p as any).social.element.style.display = visible ? 'block' : 'none';
    }
  }

  private updateHUDAnchor() {
    if (!this.hud) return;
    const d = this.hudDistance;
    const vFov = THREE.MathUtils.degToRad(this.camera.fov);
    const halfH = Math.tan(vFov / 2) * d;

    // convert pixel margin to world units at distance d
    const marginWorld = (this.hudMarginPx / this.viewport.h) * (2 * halfH);
    const y = halfH - marginWorld;

    this.hud.position.set(0, y, -d);

    // scale so 1 DOM px ≈ 1 screen px at distance d
    const scale = (2 * halfH) / this.viewport.h;
    this.hud.scale.setScalar(scale);
  }

  onResize(w: number, h: number) {
    this.viewport = { w, h };
    this.cssRenderer.setSize(w, h);
    this.updateHUDAnchor();
  }

  update(_dt: number) {
    const up = new THREE.Vector3(0, 1, 0);
    const look = new THREE.Vector3();
    const qOffset = new THREE.Quaternion();

    // Panels: position = anchor (+optional calibrated offset), then billboard, then extra rotation
    for (const [keyStr, p] of Object.entries(this.panels)) {
      const key = Number(keyStr) as SectionIdT;
      const anchor: THREE.Vector3 | undefined = (p as any).__anchor;

      if (anchor) {
        p.position.copy(anchor);
      }

      if (key === SectionId.Projects) {
        // Manual position nudge for Projects
        p.position.add(UI_CAL.projects.pos);
      }

      // Billboard toward camera (keep level in world Y)
      look.set(this.camera.position.x, p.position.y, this.camera.position.z);
      p.lookAt(look);
      p.up.copy(up);

      // Extra stable rotation for Projects (applied AFTER lookAt; no accumulation)
      if (key === SectionId.Projects) {
        qOffset.setFromEuler(new THREE.Euler(
          THREE.MathUtils.degToRad(UI_CAL.projects.rotDeg.x),
          THREE.MathUtils.degToRad(UI_CAL.projects.rotDeg.y),
          THREE.MathUtils.degToRad(UI_CAL.projects.rotDeg.z)
        ));
        p.quaternion.multiply(qOffset);
      }
    }

    // Keep the social panel facing camera + positioned off Hero
    const hero = this.panels[SectionId.Hero] as any;
    if (hero?.social) {
      const s = hero.social as CSS3DObject;
      const sAnchor: THREE.Vector3 | undefined = (s as any).__anchor;

      if (sAnchor) {
        s.position.copy(sAnchor);
      } else {
        // fallback: place relative to hero's current anchor
        const hAnchor: THREE.Vector3 | undefined = (hero as any).__anchor;
        if (hAnchor) {
          s.position.copy(hAnchor).add(UI_CAL.social.offsetFromHero);
        }
      }

      look.set(this.camera.position.x, s.position.y, this.camera.position.z);
      s.lookAt(look);
      s.up.copy(up);
    }
  }

  render() {
    this.cssRenderer.render(this.scene, this.camera);
  }
}
