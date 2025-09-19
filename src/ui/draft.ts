// src/ui/sections.ts
// Creates DOM elements for CSS3D panels & HUD.
// Panels are restyled via /src/styles/ui.css

function q<T extends Element>(root: ParentNode, sel: string) {
  return root.querySelector(sel) as T | null;
}

export function createHeroPanelEl() {
  const el = document.createElement('div');
  el.className = 'panel';
  el.style.width = '420px';

  el.innerHTML = `
    <h1>YOUR NAME</h1>
    <h2>Showcasing — My Voxel Sandbox</h2>
    <p class="small">Fly and explore — inspired to work with the Bloxd.io team, this portfolio showcases the mechanics and
     features I built in a Bloxd.io-style voxel prototype.</p>
    <div class="row mt-10">
      <button class="btn" id="aboutBtn" aria-controls="aboutBox" aria-expanded="false">About this section</button>
      <a class="btn" href="#" id="cta">Contact</a>
    </div>
    <div class="collapsible" id="aboutBox" role="region" aria-label="About this site">
      <p class="small">This site runs on Three.js + TypeScript. UI is true 3D (CSS3D), billboarded panels styled via <code>ui.css</code>.</p>
    </div>
  `;

  const aboutBtn = q<HTMLButtonElement>(el, '#aboutBtn')!;
  const aboutBox = q<HTMLDivElement>(el, '#aboutBox')!;
  const toggleAbout = () => {
    const isOpen = aboutBox.classList.toggle('open');
    aboutBtn.setAttribute('aria-expanded', String(isOpen));
  };
  aboutBtn.addEventListener('click', toggleAbout);
  aboutBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleAbout();
    }
  });

  return el;
}

export function createSocialPanelEl() {
  const el = document.createElement('div');
  el.className = 'social-main';
  el.setAttribute('role', 'group');
  el.setAttribute('aria-label', 'Social links');

  el.innerHTML = `
    <div class="up">
      <a class="card1" href="https://www.linkedin.com/in/vinay-peddireddy-049680330/" target="_blank" rel="noopener" aria-label="LinkedIn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="30" height="30" class="linkedin" aria-hidden="true">
          <path d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"></path>
          <path fill="#FFF" d="M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z"></path>
        </svg>
      </a>

      <a class="card2" href="https://vinayreddypeddireddy.netlify.app/" target="_blank" rel="noopener" aria-label="Portfolio">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="30" height="30" class="portfolio" aria-hidden="true">
          <path d="M24,4C12.972,4,4,12.972,4,24s8.972,20,20,20s20-8.972,20-20S35.028,4,24,4z M24,10c3.866,0,7,3.134,7,7s-3.134,7-7,7
          s-7-3.134-7-7S20.134,10,24,10z M24,38.4c-5.174,0-9.764-2.622-12.476-6.606c1.026-2.747,4.216-4.794,8.476-4.794h8
          c4.26,0,7.45,2.047,8.476,4.794C33.764,35.778,29.174,38.4,24,38.4z"/>
        </svg>
      </a>
    </div>

    <div class="down">
      <a class="card3" href="https://github.com/VinayXD" target="_blank" rel="noopener" aria-label="GitHub">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30" height="30" class="github" aria-hidden="true">
    <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"/>
  </svg>
</a>

 <a class="card4" href="mailto:your.email@example.com" target="_blank" rel="noopener" aria-label="Email">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="30" height="30" class="mail" aria-hidden="true">
    <!-- outer circle -->
    <circle fill="#d32f2f" cx="24" cy="24" r="20"/>
    <!-- mail envelope -->
    <path fill="#FFF" d="M12,16h24c1.1,0,2,0.9,2,2v12c0,1.1-0.9,2-2,2H12c-1.1,0-2-0.9-2-2V18C10,16.9,10.9,16,12,16z"/>
    <!-- mail flap -->
    <path fill="#d32f2f" d="M24,26l12-8v-2l-12,8L12,16v2L24,26z"/>
  </svg>
</a>
    </div>
  `; // unchanged (your social links markup)

  return el;
}

export function createSkillsPanelEl() {
  const el = document.createElement('div');
  el.className = 'panel';
 el.innerHTML = `
    <h1>Tools & Skills</h1>

    <h2 class="subhead">Tools</h2>
    <div class="row mt-6 tools" role="list" aria-label="Tools">
      <span class="badge is-icon" title="Babylon.js" role="listitem">
        <img src="/assets/Icon/babylonjs.png" alt="Babylon.js logo" loading="lazy" decoding="async">
      </span>
      <span class="badge is-icon" title="TypeScript" role="listitem">
        <img src="/assets/Icon/Typescript.png" alt="TypeScript logo" loading="lazy" decoding="async">
      </span>
      <span class="badge is-icon" title="React" role="listitem">
        <img src="/assets/Icon/React.png" alt="React logo" loading="lazy" decoding="async">
      </span>
      <span class="badge is-icon" title="Vite" role="listitem">
        <img src="/assets/Icon/viteicon.png" alt="Vite logo" loading="lazy" decoding="async">
      </span>
      <span class="badge is-icon" title="Blender" role="listitem">
        <img src="/assets/Icon/Blender.png" alt="Blender logo" loading="lazy" decoding="async">
      </span>
      <span class="badge is-icon" title="Blockbench" role="listitem">
        <img src="/assets/Icon/Blockbench.png" alt="Blockbench logo" loading="lazy" decoding="async">
      </span>
      <span class="badge is-icon" title="Figma" role="listitem">
        <img src="/assets/Icon/Figma.png" alt="Figma logo" loading="lazy" decoding="async">
      </span>
    </div>

    <div class="divider mt-8" role="separator" aria-hidden="true"></div>

    <h2 class="subhead mt-6">Skills</h2>
    <div class="row mt-6 skills" role="list" aria-label="Skills">
    <span class="chip" role="listitem">Engine Development</span>
      <span class="chip" role="listitem">Game Designing</span>
      <span class="chip" role="listitem">Custom Physics</span>
      <span class="chip" role="listitem">Voxel Modeling</span>
      <span class="chip" role="listitem">Rigging & Animation</span>
      <span class="chip" role="listitem">Performance Optimization</span>
      
      <span class="chip" role="listitem">UI/UX (CSS3D)</span>
      <span class="chip" role="listitem">Git / Version Control</span>
    </div>

    <p class="small mt-10">Hover & click supported; mobile friendly.</p>
  `; // unchanged (your tools & skills markup)
  return el;
}

type TileData = {
  id: string;
  title: string;
  img: string;
  summary: string;
  detail: string;
  label: string;
  noteTl?: string;
  noteTr?: string;
  noteB?: string;
};

export function createProjectsPanelEl(): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.setAttribute('data-panel', 'projects');

  const h1 = document.createElement('h1');
  h1.textContent = 'Projects';
  panel.appendChild(h1);

  const h2 = document.createElement('h2');
  h2.className = 'small';
  h2.textContent = 'Hover a tab to preview — press Enter on the pill to toggle notes';
  panel.appendChild(h2);

  const rail = document.createElement('div');
  rail.className = 'proj-rail';
  rail.setAttribute('role', 'list');
  rail.setAttribute('aria-label', 'Projects');

   const tiles: TileData[] = [
    {
      id: 'p1',
      title: 'Forest House Render',
      img: 'assets/projects/forest-house.jpg',
      summary: 'Real-time scene with CSS3D overlays.',
      detail: 'Built with Three.js, CSS3DRenderer, compressed textures (KTX2), and camera waypoints.',
      label: 'Forest House',
      noteTl: 'Realtime lighting + HDRI',
      noteTr: 'CSS panels live in 3D',
      noteB:  'Waypoints ease the camera',
    },
    {
      id: 'p2',
      title: 'Particles Playground',
      img: 'assets/projects/particles.jpg',
      summary: 'GPU particles with postFX.',
      detail: 'Instanced particles, GPGPU trails, bloom & film grain.',
      label: 'Particles',
      noteTl: 'GPU instancing + trails',
      noteTr: 'Bloom & film grain',
      noteB:  'Dynamic emitters',
    },
    {
      id: 'p3',
      title: 'Stylized Trees',
      img: 'assets/projects/trees.jpg',
      summary: 'Windy foliage shader.',
      detail: 'Vertex wind, dithered translucency, baked AO & normals.',
      label: 'Trees',
      noteTl: 'Dithered translucency',
      noteTr: 'Baked AO & normals',
      noteB:  'Wind zones',
    },
    {
      id: 'p4',
      title: 'UI in 3D Space',
      img: 'assets/projects/ui3d.jpg',
      summary: 'CSS panels in world space.',
      detail: 'CSS3DObject layout, HUD nav, section waypoints & transitions.',
      label: 'UI 3D',
      noteTl: 'CSS3DObject layout',
      noteTr: 'HUD + waypoints',
      noteB:  'Transitions',
    },
    {
      id: 'p5',
      title: 'Cinematic Camera',
      img: 'assets/projects/camera.jpg',
      summary: 'Eased paths & framing.',
      detail: 'Spline paths, target easing, dynamic bounds-based framing.',
      label: 'Camera',
      noteTl: 'Spline paths',
      noteTr: 'Target easing',
      noteB:  'Auto framing',
    },
      {
    id: 'p6',
    title: 'Voxel World & Block Editing',
    img: 'assets/projects/vox-edit.jpg',
    summary: 'Live placement/removal + fast mesh updates.',
    detail: 'Raycast targeting, dirty-chunk rebuilds, quick block-type path.',
    label: 'Voxel Edit',
    noteTl: 'Face-aware placement',
    noteTr: 'Localized rebuilds',
    noteB:  'New blocks in minutes',
  },
  {
    id: 'p7',
    title: 'Player Controller & Cameras',
    img: 'assets/projects/player-cam.jpg',
    summary: 'Smooth FPV + instant 3rd-person toggle.',
    detail: 'Pointer-lock, stable pitch/yaw, 1-block step-up, modular input.',
    label: 'Controller',
    noteTl: 'Clean look controls',
    noteTr: 'Step-up traversal',
    noteB:  'Extensible actions',
  },
    
  ];

  // Helpers for label auto-fit
  function ensureFitSpan(labelEl: HTMLElement, text: string) {
    let fit = labelEl.querySelector<HTMLElement>('.fit');
    if (!fit) {
      fit = document.createElement('span');
      fit.className = 'fit';
      fit.textContent = text;
      labelEl.replaceChildren(fit);
    } else {
      fit.textContent = text;
    }
    return fit;
  }
  function fitLabels(railEl: HTMLElement) {
    const collapsed = parseFloat(getComputedStyle(railEl).getPropertyValue('--tile-collapsed')) || 84;
    railEl.querySelectorAll<HTMLElement>('.proj-label').forEach(label => {
      const text = label.textContent?.trim() || '';
      const fit = ensureFitSpan(label, text);
      const probe = fit.cloneNode(true) as HTMLElement;
      probe.style.position = 'absolute';
      probe.style.visibility = 'hidden';
      probe.style.whiteSpace = 'nowrap';
      document.body.appendChild(probe);
      const paddingX = 16;
      const maxWidth = Math.max(0, collapsed - paddingX);
      let size = 14;
      for (let i = 0; i < 6; i++) {
        probe.style.fontSize = size + 'px';
        if (probe.scrollWidth <= maxWidth || size <= 9) break;
        size = Math.max(9, Math.floor(size * (maxWidth / probe.scrollWidth) * 0.98));
      }
      document.body.removeChild(probe);
      fit.style.fontSize = size + 'px';
    });
  }

  const makeTile = (t: TileData) => {
    const tile = document.createElement('div');
    tile.className = 'proj-tile';
    tile.setAttribute('role', 'listitem');
    tile.dataset.id = t.id;
    tile.dataset.title = t.title;
    tile.dataset.img = t.img;
    tile.dataset.summary = t.summary;
    tile.dataset.detail = t.detail;

    const item = document.createElement('div');
    item.className = 'proj-item';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'proj-image';
    const img = document.createElement('img');
    img.src = t.img;
    img.alt = `${t.title} cover`;
    img.loading = 'lazy';
    img.decoding = 'async';
    imgWrap.appendChild(img);

    const meta = document.createElement('div');
    meta.className = 'proj-meta';
    const title = document.createElement('h3');
    title.textContent = t.title;
    const p = document.createElement('p');
    p.textContent = t.summary;
    meta.appendChild(title);
    meta.appendChild(p);

    const cta = document.createElement('button');
    cta.type = 'button';
    cta.className = 'proj-cta';
    cta.setAttribute('aria-expanded', 'false');
    cta.setAttribute('aria-label', `Toggle notes for ${t.title}`);
    cta.textContent = 'View details';

    item.appendChild(imgWrap);
    item.appendChild(meta);
    item.appendChild(cta);

    const label = document.createElement('span');
    label.className = 'proj-label';
    ensureFitSpan(label, t.label);

    tile.dataset.noteTl = t.noteTl ?? '';
    tile.dataset.noteTr = t.noteTr ?? '';
    tile.dataset.noteB  = t.noteB  ?? '';

    tile.appendChild(item);
    tile.appendChild(label);
    return tile;
  };

  tiles.forEach(t => rail.appendChild(makeTile(t)));
  panel.appendChild(rail);

  // Tell CSS how many tiles exist
  rail.style.setProperty('--tiles', String(tiles.length));

  const allTiles = Array.from(rail.querySelectorAll<HTMLElement>('.proj-tile'));
  function setHoverState(active?: HTMLElement) {
    if (active) {
      rail.classList.add('is-hovering');
      allTiles.forEach(t => t.classList.toggle('is-active', t === active));
    } else {
      rail.classList.remove('is-hovering');
      allTiles.forEach(t => t.classList.remove('is-active'));
    }
  }
  allTiles.forEach(tile => {
    tile.addEventListener('mouseenter', () => setHoverState(tile));
    tile.addEventListener('focusin',   () => setHoverState(tile));
  });
  rail.addEventListener('mouseleave', () => setHoverState());
  rail.addEventListener('focusout',   e => {
    if (!rail.contains(e.relatedTarget as Node)) setHoverState();
  });

  // Auto-fit labels
  fitLabels(rail);
  window.addEventListener('resize', () => fitLabels(rail));
  window.addEventListener('load', () => fitLabels(rail));

  // ======== Overlay logic (unchanged from your version) ========
  const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  overlay.classList.add('proj-overlay');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);

  // ... keep your existing clearOverlay, pointsToSmoothPath, drawCurvyLine, showNotesForTile, and click/hover handlers here unchanged ...

  return panel;
}

export function createHUDNavEl(handlers: { onHero:()=>void; onSkills:()=>void; onProjects:()=>void; }) {
  const wrap = document.createElement('div');
  wrap.className = 'hud';
  wrap.innerHTML = `
    <button class="btn" id="hero">Hero</button>
    <button class="btn" id="skills">Skills</button>
    <button class="btn" id="projects">Projects</button>
  `;
  q<HTMLButtonElement>(wrap, '#hero')!.addEventListener('click', handlers.onHero);
  q<HTMLButtonElement>(wrap, '#skills')!.addEventListener('click', handlers.onSkills);
  q<HTMLButtonElement>(wrap, '#projects')!.addEventListener('click', handlers.onProjects);
  return wrap;
}
