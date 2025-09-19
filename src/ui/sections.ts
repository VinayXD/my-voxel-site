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
    <h1> Vinay Peddireddy</h1>
    <h2>Showcasing my Voxel Game</h2>
    <p class="small">Fly and explore — This website is meant to showcase work built using a tech stack similar to Bloxd.io. Inspired to work with the Bloxd.io team, I created this site to highlight the mechanics and features I developed in a voxel prototype.</p>
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
      <a class="card1" href="https://www.linkedin.com/in/vinay-peddireddy-049680330/" 
         target="_blank" rel="noopener" aria-label="LinkedIn" title="LinkedIn Profile">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="30" height="30" class="linkedin" aria-hidden="true">
          <path d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"></path>
          <path fill="#FFF" d="M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z"></path>
        </svg>
      </a>

      <a class="card2" href="https://vinayreddypeddireddy.netlify.app/" 
         target="_blank" rel="noopener" aria-label="Portfolio" title="Portfolio Website">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="30" height="30" class="portfolio" aria-hidden="true">
          <path d="M24,4C12.972,4,4,12.972,4,24s8.972,20,20,20s20-8.972,20-20S35.028,4,24,4z M24,10c3.866,0,7,3.134,7,7s-3.134,7-7,7
          s-7-3.134-7-7S20.134,10,24,10z M24,38.4c-5.174,0-9.764-2.622-12.476-6.606c1.026-2.747,4.216-4.794,8.476-4.794h8
          c4.26,0,7.45,2.047,8.476,4.794C33.764,35.778,29.174,38.4,24,38.4z"/>
        </svg>
      </a>
    </div>

    <div class="down">
      <a class="card3" href="https://github.com/VinayXD" 
         target="_blank" rel="noopener" aria-label="GitHub" title="GitHub Profile">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30" height="30" class="github" aria-hidden="true">
          <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"/>
        </svg>
      </a>

      <a class="card4" href="mailto:your.email@example.com" 
         target="_blank" rel="noopener" aria-label="Email" title="Send me an Email">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="30" height="30" class="mail" aria-hidden="true">
          <circle fill="#d32f2f" cx="24" cy="24" r="20"/>
          <path fill="#FFF" d="M12,16h24c1.1,0,2,0.9,2,2v12c0,1.1-0.9,2-2,2H12c-1.1,0-2-0.9-2-2V18C10,16.9,10.9,16,12,16z"/>
          <path fill="#d32f2f" d="M24,26l12-8v-2l-12,8L12,16v2L24,26z"/>
        </svg>
      </a>
    </div>
  `;

  return el;
}



export function createSkillsPanelEl() {
  const el = document.createElement('div');
  el.className = 'panel';
 el.innerHTML = `
    <h1>Tools & Skills</h1>

    <h2 class="subhead">Tools used</h2>
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
      <span class="chip" role="listitem">Custom Game Physics</span>
      <span class="chip" role="listitem">3D Modeling</span>
      <span class="chip" role="listitem">Rigging & Animation</span>
      <span class="chip" role="listitem">Performance Optimization</span>
      <span class="chip" role="listitem">Design Pattern</span>
      <span class="chip" role="listitem">UI/UX </span>
      <span class="chip" role="listitem">Git / Version Control</span>
    </div>

    <p class="small mt-10"></p>
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

// src/ui/sections.ts

export function createProjectsPanelEl(): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.setAttribute('data-panel', 'projects');

  const h1 = document.createElement('h1');
  h1.textContent = 'Things I did';
  panel.appendChild(h1);

  const h2 = document.createElement('h2');
  h2.className = 'small';
  h2.textContent = 'Hover a tab to preview — press “View details” to pin notes';
  panel.appendChild(h2);

  const rail = document.createElement('div');
  rail.className = 'proj-rail';
  rail.setAttribute('role', 'list');
  rail.setAttribute('aria-label', 'Projects');

  type TileData = {
  id: string;
  title: string;
  img: string;        // fallback/legacy image (kept for backward compatibility)
  summary: string;
  detail: string;
  label: string;
  noteTl?: string;
  noteTr?: string;
  noteB?: string;

  // NEW (optional)
  video?: string;     // e.g. 'assets/projects/vox-edit.mp4'
  poster?: string;    // optional poster frame for the video
};

const tiles: TileData[] = [
 { id:'p1', title:'Voxel World & Block Editing',
  img:'assets/projects/vox-edit.jpg',           // optional fallback
  video:'assets/projects/P1.mp4',   
  poster:'assets/projects/vox-edit.jpg',        // <— optional
  summary:'I built a chunked voxel world with live block placement/removal and fast mesh updates.',
  detail:'Raycast targeting with face-aware placement/removal. Dirty-chunk rebuilds keep edits localized and fast. Lightweight path to add new block types quickly.',
  label:'Voxel Edit',
  noteTl:'Raycast targeting with face-aware placement/removal.',
  noteTr:'Dirty-chunk rebuilds keep edits localized and fast.',
  noteB:'Lightweight path to add new block types quickly.'
},

  { id:'p2', title:'Player Controller & Cameras',
  img:'assets/projects/player-cam.jpg',
  video:'assets/projects/Fp2.mp4',   // <— add your video here
  poster:'assets/projects/player-cam.jpg',  // optional
  summary:'I implemented a smooth first-person controller with an instant third-person toggle and clean look controls.',
  detail:'Pointer-lock camera with stable pitch/yaw handling. 1-block step-up for uninterrupted traversal across terrain. Modular input/action mapping designed for easy extension.',
  label:'Controller', 
  noteTl:'Pointer-lock camera with stable pitch/yaw handling.', 
  noteTr:'1-block step-up for uninterrupted traversal across terrain.', 
  noteB:'Modular input/action mapping designed for easy extension.'
},

{ id:'p3', title:'Game Physics',
  img:'assets/projects/physics.jpg',
  video:'assets/projects/fp4.mp4',
  poster:'assets/projects/physics.jpg',
  summary:'I wrote a physics layer around an AABB collider with tuned gravity/jump for responsive movement.',
  detail:'Reliable grounded checks, slope handling, step height. Basic wall/ceiling slide and velocity damping hooks. Parameters exposed for quick feel tuning.',
  label:'Physics', 
  noteTl:'Reliable grounded checks, slope handling, step height.', 
  noteTr:'Basic wall/ceiling slide and velocity damping hooks.', 
  noteB:'Parameters exposed for quick feel tuning.'
},

{ id:'p4', title:'FPS Hands, Weapons & Animation',
  img:'assets/projects/fps-hands.jpg',
  video:'assets/projects/p3.mp4',
  poster:'assets/projects/fps-hands.jpg',
  summary:'I created an FPS view-model system that renders hands/weapons on a separate layer and drives them with a state machine.',
  detail:'Prevents world clipping and z-fighting by isolating the view model. Behaviour states (idle/attack/interact) with clean transitions. Bone-based attachment (e.g., sword to right-hand bone) on the same layer for proper intersection.',
  label:'FPS System', 
  noteTl:'Prevents world clipping and z-fighting by isolating the view model.', 
  noteTr:'Behaviour states (idle/attack/interact) with clean transitions.', 
  noteB:'Bone-based attachment (e.g., sword to right-hand bone) on the same layer for proper intersection.'
},

{ id:'p5', title:'NPC Prototype',
  img:'assets/projects/npc.jpg',
  video:'assets/projects/fp5.mp4',
  poster:'assets/projects/npc.jpg',
  summary:'I modelled and rigged an NPC and drove its behaviour with a clear finite-state machine.',
  detail:'Finite State Machine for play suitable animation with custom physics. States like idle/wander/seek/attack with simple target logic. Block-aware vertical stepping and synced motion/animation.',
  label:'NPC AI', 
  noteTl:'Finite State Machine for play suitable animation with custom physics.', 
  noteTr:'States like idle/wander/seek/attack with simple target logic.', 
  noteB:'Block-aware vertical stepping and synced motion/animation.'
},

{ id:'p6', title:'Textures & Block VFX',
  img:'assets/projects/textures.jpg',
  video:'assets/projects/Fp6.mp4',
  poster:'assets/projects/textures.jpg',
  summary:'I hand-painted block textures in Blockbench and added a flipbook effect for breaking blocks.',
  detail:'Consistent atlas/UVs; crisp filtering for readable pixel art. Flipbook animation for breaking the block. Seamless continues textures for blocks.',
  label:'Textures', 
  noteTl:'Consistent atlas/UVs; crisp filtering for readable pixel art.', 
  noteTr:'Flipbook animation for breaking the block.', 
  noteB:'Seamless continues textures for blocks.'
},

{ id:'p7', title:'Modelling & Rigging/Animation',
  img:'assets/projects/models.jpg',
  video:'assets/projects/fp7.mp4',
  poster:'assets/projects/models.jpg',
  summary:'I modelled every game asset myself in Blockbench and rigged/animated them in Blender.',
  detail:'Player, moose, sword, and fireball modelled to spec. Clean bone naming and pivots for easy attachments. Layered animation for on top of other animation.',
  label:'Assets', 
  noteTl:'Player, moose, sword, and fireball modelled to spec.', 
  noteTr:'Clean bone naming and pivots for easy attachments.', 
  noteB:'Layered animation for on top of other animation.'
},

{ id:'p8', title:'Performance & Debug',
  img:'assets/projects/performance.jpg',
  video:'assets/projects/fp8.mp4',
  poster:'assets/projects/performance.jpg',
  summary:'I focused on practical wins to keep frame times low and edits snappy, with strict TypeScript types throughout.',
  detail:'Chunk-batched geometry + greedy meshing to reduce faces/draw calls. Low-GC frame loop: reuse math objects, cache lookups, cap raycasts to once per frame. Strong TypeScript typing across systems for safety and inlining. Input decoupling with debug tools and toggleable diagnostics.',
  label:'Performance', 
  noteTl:'Chunk-batched geometry + greedy meshing to reduce faces/draw calls.', 
  noteTr:'Low-GC frame loop: reuse math objects, cache lookups, cap raycasts to once per frame.', 
  noteB:'Strong TypeScript typing across systems for safety and inlining. Input decoupling with debug tools and toggleable diagnostics.'
},

{ id:'p9', title:'Game Design, Roles & Balance',
  img:'assets/projects/koh.png',
  video:'assets/projects/design.mp4',
  poster:'assets/projects/koh.png',
  summary:'Beyond implementation, my core is game designer — coming up with fun game mechanics, mini-games, testing, and balance to make it fair for all.',
  detail:'Take an Idea, I create and balance mini-games. Following core design loop. One of the examples for mini game is King of the Hill.',
  label:'Design', 
  noteTl:'Take an Idea, I create and balance mini-games.', 
  noteTr:'Following core design loop.', 
  noteB:'One of the examples for mini game is King of the Hill.'
},

];


  // --- helpers for the vertical label auto-fit (unchanged) ---
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

  // --- tile factory ---
  function makeTile(t: TileData) {
    const tile = document.createElement('div');
    tile.className = 'proj-tile';
    tile.setAttribute('role', 'listitem');
    tile.dataset.id = t.id;
    tile.dataset.title = t.title;
    tile.dataset.img = t.img;
    tile.dataset.summary = t.summary;
    tile.dataset.detail = t.detail;
    tile.dataset.noteTl = t.noteTl ?? '';
    tile.dataset.noteTr = t.noteTr ?? '';
    tile.dataset.noteB  = t.noteB  ?? '';

    const item = document.createElement('div');
    item.className = 'proj-item';

   const imgWrap = document.createElement('div');
imgWrap.className = 'proj-image';

if (t.video) {
  const vid = document.createElement('video');
  vid.setAttribute('playsinline', 'true');
  vid.setAttribute('muted', 'true');     // required for autoplay on most browsers
  vid.setAttribute('autoplay', 'true');
  vid.setAttribute('loop', 'true');
  vid.setAttribute('preload', 'metadata');
  vid.setAttribute('aria-label', `${t.title} preview video`);
  vid.disablePictureInPicture = true;

  if (t.poster) vid.poster = t.poster;

  const src = document.createElement('source');
  src.src = t.video;
  src.type = 'video/mp4';
  vid.appendChild(src);

  // Try to play when allowed (if autoplay was initially blocked)
  const tryPlay = () => vid.play().catch(() => {});
  vid.addEventListener('canplay', tryPlay);
  imgWrap.addEventListener('mouseenter', tryPlay);
  imgWrap.addEventListener('focusin', tryPlay);

  imgWrap.appendChild(vid);
} else {
  const img = document.createElement('img');
  img.src = t.img;
  img.alt = `${t.title} cover`;
  img.loading = 'lazy';
  img.decoding = 'async';
  imgWrap.appendChild(img);
}


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

    tile.appendChild(item);
    tile.appendChild(label);
    return tile;
  }

  tiles.forEach(t => rail.appendChild(makeTile(t)));
  panel.appendChild(rail);

  // tell CSS how many tiles exist
  rail.style.setProperty('--tiles', String(tiles.length));

  // smooth hover fallback class (already styled in CSS)
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

  // fit labels initially + on resize
  fitLabels(rail);
  window.addEventListener('resize', () => fitLabels(rail));
  window.addEventListener('load',   () => fitLabels(rail));

  // ---------- NEW: details/callouts logic ----------
  // ---------- replace the old ensureCallouts(...) with this ----------
function ensureNote(tile: HTMLElement) {
  // If built already, reuse it
  let note = tile.querySelector<HTMLElement>('.proj-note');
  if (note) return note;

  // Gather up to 3 points
  const p1 = (tile.dataset.noteTl || '').trim();
  const p2 = (tile.dataset.noteTr || '').trim();
  const p3 = (tile.dataset.noteB  || tile.dataset.detail || '').trim();

  // Build a single hanging note with bullets
  note = document.createElement('div');
  note.className = 'proj-note rope-drop sketchy';
  const ul = document.createElement('ul');

  [p1, p2, p3].filter(Boolean).forEach(text => {
    const li = document.createElement('li');
    li.textContent = text;
    ul.appendChild(li);
  });

  // Fallback so it never looks empty
  if (!ul.children.length) {
    const li = document.createElement('li');
    li.textContent = 'No details provided yet.';
    ul.appendChild(li);
  }

  note.appendChild(ul);
  tile.appendChild(note);
  return note;
}


  function closeAll(except?: HTMLElement) {
    allTiles.forEach(t => {
      if (t !== except) {
        t.classList.remove('open');
        const btn = t.querySelector<HTMLButtonElement>('.proj-cta');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Delegate clicks from the rail
  // Delegate clicks from the rail
rail.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.proj-cta');
  if (!btn) return;

  const tile = btn.closest<HTMLElement>('.proj-tile')!;
  const isOpen = tile.classList.contains('open');

  if (isOpen) {
    tile.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  } else {
    closeAll(tile);
    ensureNote(tile);              // <— build the single hanging note
    tile.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
});
// Retract when the pointer leaves the tile
allTiles.forEach(t => {
  t.addEventListener('mouseleave', () => {
    t.classList.remove('open');
    const btn = t.querySelector<HTMLButtonElement>('.proj-cta');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });
});

  // Close when clicking outside the rail
  document.addEventListener('click', (e) => {
    if (!rail.contains(e.target as Node)) closeAll();
  });

  // Close with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });

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
