// src/ui/sections.ts
// Creates DOM elements for CSS3D panels & HUD.
// Panels are restyled via /src/styles/ui.css

// note: no leading slash, no ?url
// src/ui/sections.ts

const RESUME_URL = `${import.meta.env.BASE_URL}assets/HopeTownCV.pdf`;





// src/ui/sections.ts
// src/ui/sections.ts

export function createHeroPanelEl() {
  const el = document.createElement('div');
  el.className = 'panel';
  
  // Compact container style
  el.style.width = '450px'; 
  el.style.maxWidth = '90vw';
  el.style.padding = '20px';
  el.style.color = '#1a1a1a';

  // --- 1. CSS FOR EXPAND ANIMATION ---
  const styleId = 'hero-styles-v3';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .summary-container {
        font-size: 0.85rem;
        line-height: 1.5;
        color: #333;
        overflow: hidden;
        transition: max-height 0.3s ease-in-out;
      }
      
      /* COLLAPSED: Only shows the first ~3 lines */
      .summary-container.collapsed {
        max-height: 55px; 
      }

      /* EXPANDED: Shows everything */
      .summary-container.expanded {
        max-height: 600px; /* Big enough to fit all text */
      }

      /* BUTTON STYLE */
      .read-more-btn {
        background: none;
        border: none;
        color: #000; /* Black Color */
        font-size: 0.85rem;
        font-weight: bold;
        cursor: pointer;
        padding: 0;
        margin-top: 8px;
        margin-bottom: 15px;
        text-decoration: underline;
        font-family: inherit;
      }
      .read-more-btn:hover {
        opacity: 0.7;
      }
    `;
    document.head.appendChild(style);
  }

  // --- 2. HTML CONTENT ---
  el.innerHTML = `
    <h1 style="color: #000; margin: 0 0 4px 0; font-size: 1.6rem;">Vinay Peddireddy</h1>
    <h2 style="color: #646cff; margin: 0 0 15px 0; font-size: 0.95rem; font-weight: 600;">Game Designer & Developer</h2>
    
    <div id="summary-text" class="summary-container collapsed">
      <p style="margin-top: 0; margin-bottom: 10px;">
        I design and ship player-focused experiences that translate abstract ideas into clear, engaging gameplay with strong pacing, tone, and meaningful agency.
      </p>
      
      <p style="margin-bottom: 10px;">
        I’ve delivered multiple shipped titles in a cross-disciplinary studio environment and contributed to an indie narrative project remotely, with a focus on UX clarity, visual storytelling, and structured playtest-led iteration.
      </p>
      
      <p style="margin-bottom: 0;">
        My work is informed by player psychology—particularly flow and emotion modelling—to improve comprehension, motivation, and moment-to-moment feel. I’m strongest at defining experience goals, building mechanics that support them, and refining systems through feedback until the experience is coherent and polished.
      </p>
    </div>

    <button id="toggle-btn" class="read-more-btn">Read More</button>

    <div class="row">
      <a class="btn" id="cta" href="${RESUME_URL}" download="HopeTownCV.pdf" rel="noopener" style="
        width: 100%; 
        justify-content: center; 
        font-weight: bold;
        background: #333; 
        color: #fff;
        padding: 8px;
        font-size: 0.85rem;
      ">
        Download Résumé
      </a>
    </div>
  `;

  // --- 3. JAVASCRIPT LOGIC ---
  // We need to wait for the element to be inserted or just attach listener now
  // Since we are creating the element in memory, we can attach listeners immediately.
  
  const textContainer = el.querySelector('#summary-text') as HTMLElement;
  const btn = el.querySelector('#toggle-btn') as HTMLElement;

  btn.addEventListener('click', () => {
    const isCollapsed = textContainer.classList.contains('collapsed');

    if (isCollapsed) {
      // EXPAND
      textContainer.classList.remove('collapsed');
      textContainer.classList.add('expanded');
      btn.textContent = 'Show Less';
    } else {
      // COLLAPSE
      textContainer.classList.remove('expanded');
      textContainer.classList.add('collapsed');
      btn.textContent = 'Read More';
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

      <a class="card2" href="" 
         target="_blank" rel="noopener" aria-label="Portfolio" title="My Portfolio Website">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="30" height="30" class="portfolio" aria-hidden="true">
          <path d="M24,4C12.972,4,4,12.972,4,24s8.972,20,20,20s20-8.972,20-20S35.028,4,24,4z M24,10c3.866,0,7,3.134,7,7s-3.134,7-7,7
          s-7-3.134-7-7S20.134,10,24,10z M24,38.4c-5.174,0-9.764-2.622-12.476-6.606c1.026-2.747,4.216-4.794,8.476-4.794h8
          c4.26,0,7.45,2.047,8.476,4.794C33.764,35.778,29.174,38.4,24,38.4z"/>
        </svg>
      </a>
    </div>

    <div class="down">
      <a class="card3" href="https://github.com/VinayXD" 
         target="_blank" rel="noopener" aria-label="GitHub" title="GitHub link for project code">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30" height="30" class="github" aria-hidden="true">
          <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"/>
        </svg>
      </a>

      <a class="card4" href="mailto:v.r.peddireddy@se23.qmul.ac.uk" 
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



// src/ui/sections.ts

export function createSkillsPanelEl(): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'panel';
  
  // 1. CONTAINER STYLE (Matches Projects Panel)
  panel.style.width = '800px';
  panel.style.maxWidth = '90vw';
  panel.style.height = '680px'; 
  panel.style.position = 'relative';
  panel.style.overflow = 'hidden'; 
  panel.style.userSelect = 'none'; 
  panel.style.color = '#1a1a1a'; // Dark Text Global

  // --- 2. CSS STYLES ---
  const styleId = 'skills-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      /* Scrollbar */
      .custom-scroll::-webkit-scrollbar { width: 6px; }
      .custom-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); }
      .custom-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.3); border-radius: 4px; }
      .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.5); }
      
      .grab-scroll { cursor: grab; }
      .grab-scroll:active { cursor: grabbing; }

      /* Timeline Styles */
      .timeline-container {
        position: relative;
        padding-left: 20px;
        border-left: 2px solid rgba(0,0,0,0.1);
        margin-left: 10px;
      }
      .timeline-item {
        position: relative;
        margin-bottom: 30px;
      }
      .timeline-dot {
        position: absolute;
        left: -27px;
        top: 5px;
        width: 12px;
        height: 12px;
        background: #333;
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
      }
      .timeline-date {
        font-size: 0.85rem;
        font-weight: 600;
        color: #646cff;
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .timeline-role {
        font-size: 1.2rem;
        font-weight: 700;
        color: #000;
        margin: 0;
      }
      .timeline-company {
        font-size: 1rem;
        font-weight: 500;
        color: #444;
        margin-bottom: 8px;
      }
      .timeline-desc {
        font-size: 0.95rem;
        line-height: 1.5;
        color: #333;
      }
      .timeline-desc ul {
        margin: 5px 0;
        padding-left: 20px;
      }
      
      /* Skill Chips */
      .skill-category {
        margin-bottom: 15px;
      }
      .skill-cat-title {
        font-size: 0.9rem;
        font-weight: 700;
        text-transform: uppercase;
        color: #666;
        margin-bottom: 5px;
        border-bottom: 1px solid rgba(0,0,0,0.1);
        padding-bottom: 2px;
      }
      .light-chip {
        display: inline-block;
        background: rgba(0,0,0,0.06);
        border: 1px solid rgba(0,0,0,0.1);
        color: #222;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 500;
        margin-right: 6px;
        margin-bottom: 6px;
      }
    `;
    document.head.appendChild(style);
  }

  // --- 3. HTML STRUCTURE ---
  panel.innerHTML = `
    <div id="skills-wrapper" class="custom-scroll grab-scroll" style="
      height: 100%;
      overflow-y: auto; 
      padding: 30px 40px;
      display: flex; flex-direction: column;
    ">
      
      <h1 style="margin: 0 0 30px 0; font-size: 2.2rem; color: #000; text-align: center;">Experience & Skills</h1>

      <div class="timeline-container">
        
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-date">Jan 2025 – Sep 2025</div>
          <h3 class="timeline-role">Associate Game Designer</h3>
          <div class="timeline-company">Okinawa Journal (Indie, Remote)</div>
          <div class="timeline-desc">
            <ul>
              <li>Partnered with the lead designer to define vision and tone, creating concrete iteration plans.</li>
              <li>Owned UX & Playtest strategy: Synthesized feedback to improve emotional readability using cognitive load research.</li>
              <li>Strengthened Ludo-narrative harmony by aligning mechanics/UI with narrative intent.</li>
            </ul>
          </div>
        </div>

        <div class="timeline-item">
          <div class="timeline-dot" style="background: #646cff;"></div>
          <div class="timeline-date">Sep 2023 – May 2025</div>
          <h3 class="timeline-role">MSc in Computer Games Design</h3>
          <div class="timeline-company">Queen Mary University of London</div>
          <div class="timeline-desc">
            Focused on Computational Creativity, Interactive Agents, Procedural Generation, and RPG Level Design.
          </div>
        </div>

        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-date">Jan 2022 – May 2023</div>
          <h3 class="timeline-role">Game Designer / Developer</h3>
          <div class="timeline-company">Creative Monkey Games (India)</div>
          <div class="timeline-desc">
            <ul>
              <li>Owned feature design to polish across 8 shipped projects in a 20-person team.</li>
              <li>Implemented state-driven logic in Unity to keep features stable and testable.</li>
              <li>Ran 30+ playtests and balanced difficulty progression using player-archetype analysis.</li>
            </ul>
          </div>
        </div>

        <div class="timeline-item">
          <div class="timeline-dot" style="background: #646cff;"></div>
          <div class="timeline-date">Aug 2018 – 2022</div>
          <h3 class="timeline-role">Founder & President (Game Dev Society)</h3>
          <div class="timeline-company">Sathyabama University (Bachelors in CS)</div>
          <div class="timeline-desc">
            <ul>
              <li>Founded the society, delivering 30+ events (Game Jams, Workshops) over 3 years.</li>
              <li>Top 1% of 2022 computer graduate students.</li>
            </ul>
          </div>
        </div>

      </div>

      <div style="margin-top: 20px; background: rgba(0,0,0,0.03); padding: 20px; border-radius: 12px;">
        <h2 style="margin-top: 0; font-size: 1.5rem; color: #000; margin-bottom: 20px;">Technical Proficiency</h2>
        
        <div class="skill-category">
          <div class="skill-cat-title">Game Engines</div>
          <div>
            <span class="light-chip">Unity (C#)</span>
            <span class="light-chip">Unreal Engine</span>
            <span class="light-chip">Godot</span>
            <span class="light-chip">Custom C++ Engines</span>
          </div>
        </div>

        <div class="skill-category">
          <div class="skill-cat-title">Programming & Web</div>
          <div>
            <span class="light-chip">C#</span>
            <span class="light-chip">C++</span>
            <span class="light-chip">Python</span>
            <span class="light-chip">TypeScript/JS</span>
            <span class="light-chip">React</span>
            <span class="light-chip">Three.js / WebGL</span>
            <span class="light-chip">Node.js</span>
          </div>
        </div>

        <div class="skill-category">
          <div class="skill-cat-title">Design & Methods</div>
          <div>
            <span class="light-chip">Data-Driven Design</span>
            <span class="light-chip">Procedural Generation</span>
            <span class="light-chip">AI Systems</span>
            <span class="light-chip">ECS Architecture</span>
            <span class="light-chip">Player Psychology</span>
            <span class="light-chip">Narrative Design</span>
          </div>
        </div>

        <div class="skill-category">
          <div class="skill-cat-title">Tools</div>
          <div>
            <span class="light-chip">Blender</span>
            <span class="light-chip">Articy</span>
            <span class="light-chip">GitHub / Git</span>
            <span class="light-chip">Jira</span>
            <span class="light-chip">Google Colab</span>
          </div>
        </div>

      </div>

      <div style="height: 40px;"></div>
    </div>
  `;

  // --- 4. DRAG SCROLL LOGIC ---
  const wrapper = panel.querySelector('#skills-wrapper') as HTMLElement;
  let isDown = false;
  let startY = 0;
  let scrollTop = 0;

  wrapper.addEventListener('mousedown', (e) => {
    isDown = true;
    startY = e.pageY - wrapper.offsetTop;
    scrollTop = wrapper.scrollTop;
    wrapper.style.cursor = 'grabbing';
  });

  const stopDrag = () => {
    isDown = false;
    wrapper.style.cursor = 'grab';
  };
  wrapper.addEventListener('mouseleave', stopDrag);
  wrapper.addEventListener('mouseup', stopDrag);

  wrapper.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const y = e.pageY - wrapper.offsetTop;
    const walk = (y - startY) * 1.5;
    wrapper.scrollTop = scrollTop - walk;
  });

  return panel;
}


// src/ui/sections.ts

export function createProjectsPanelEl(): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'panel feature-project';
  
  // 1. CONTAINER STYLE
  panel.style.width = '800px';
  panel.style.maxWidth = '90vw';
  panel.style.height = '680px'; // Slightly taller to fit the dots above
  panel.style.position = 'relative';
  panel.style.overflow = 'hidden'; 
  panel.style.userSelect = 'none'; 
  panel.style.color = '#1a1a1a'; // Global Dark Text

  // --- 2. CSS STYLES ---
  const styleId = 'proj-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .side-nav-btn {
        background: transparent;
        transition: background 0.2s, transform 0.2s;
        opacity: 0.6;
        color: #333; /* Dark Arrow Color */
      }
      .side-nav-btn:hover {
        background: rgba(0, 0, 0, 0.05);
        opacity: 1;
      }
      
      .custom-scroll::-webkit-scrollbar { width: 6px; }
      .custom-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); }
      .custom-scroll::-webkit-scrollbar-thumb { 
        background: rgba(0,0,0,0.3); 
        border-radius: 4px; 
      }
      .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.5); }
      
      .grab-scroll { cursor: grab; }
      .grab-scroll:active { cursor: grabbing; }

      .fade-wrap { transition: opacity 0.25s ease-in-out; opacity: 1; }
      .fade-wrap.fading { opacity: 0; }

      .light-chip {
        background: rgba(0,0,0,0.08);
        border: 1px solid rgba(0,0,0,0.1);
        color: #333;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 500;
      }

      /* Dot Animations */
      .proj-dot { transition: transform 0.2s, background 0.2s; }
      .media-dot { transition: transform 0.2s, background 0.2s; }
    `;
    document.head.appendChild(style);
  }

  // --- 3. DATA ---
  const projects = [
    {
      title: 'Okinawa Journal',
      media: [
        //{ type: 'youtube', url: 'https://www.youtube.com/watch?v=qAz_saChKdA' },
        { type: 'image', url: 'assets/projects/OJ.jpg' },
        { type: 'image', url: 'assets/projects/OJ1.jpg' },
        { type: 'image', url: 'assets/projects/OJ2.jpg' },
        { type: 'image', url: 'assets/projects/OJ3.jpg' }

      ],
      summary: 'A point-and-click mystery where you play as a guardian angel guiding a journalist.',
      description: `
        <strong>Role: Associate Game Designer</strong><br>
        I partnered with the lead designer to define the game’s vision and tone, translating abstract experience goals into concrete design tasks and iteration plans.
        <br><br>
        <strong>UX & Player Psychology</strong><br>
        I owned the playtest strategy, synthesizing feedback to improve emotional readability. I applied psychology research (motivation, cognitive load) to refine choice presentation and reduce friction.
        <br><br>
        <strong>Narrative Harmony</strong><br>
        Strengthened ludo-narrative harmony by aligning mechanics and UI with the story. I developed visual storytelling concepts (staging, environmental cues) to reduce reliance on exposition.
      `,
      tech: ['Game Design', 'UX Strategy', 'Narrative Design', 'Player Psychology']
    },
    {
      title: 'PUBG Data Visualization',
      media: [
        { type: 'image', url: 'assets/projects/p4.2.png' },
        { type: 'image', url: 'assets/projects/p4.3.png' },
        { type: 'image', url: 'assets/projects/p4.4.png' },
        { type: 'image', url: 'assets/projects/p4.5.png' },
        { type: 'image', url: 'assets/projects/p4.6.png' },
        { type: 'image', url: 'assets/projects/p4.7.png' }
      ],
      summary: 'Analyzing player behavior and death patterns using Google Colab and Python.',
      description: `
        <strong>Overview</strong><br>
        Leveraged Google Colab to visualize player death data from PUBG. I created scatter plots and heatmaps to reveal intensity zones, adjusting map visibility and cell precision for clarity.
        <br><br>
        <strong>Weapon & Combat Analysis</strong><br>
        Generated specific heatmaps for different weapon types.
        <ul>
          <li><strong>Rifles:</strong> Mirrored overall trends (versatile range).</li>
          <li><strong>Shotguns/SMGs:</strong> Concentrated in urban hotspots like Pochinki.</li>
          <li><strong>Snipers:</strong> Dominated open spaces and bridges.</li>
        </ul>
        <br>
        <strong>Balance & Insights</strong><br>
        Comparative heatmaps (Deaths vs. Kills) identified advantageous high ground near Georgopool and dangerous chokepoints like bridges, providing actionable data for map balancing.
      `,
      tech: ['Python', 'Google Colab', 'Data Visualization', 'Pandas']
    },
    {
      title: 'Procedural Sword Animation',
      media: [
        { type: 'youtube', url: 'https://www.youtube.com/embed/BmgdVZUbqSQ?autoplay=1' },
        { type: 'youtube', url: 'https://www.youtube.com/embed/LJncXo-SsuE?autoplay=1' },
        { type: 'youtube', url: 'https://www.youtube.com/embed/LJncXo-SsuE?autoplay=1' }
        

      ],
      summary: 'Real-time procedural sword movement using second-order dynamics for physics-based inertia.',
      description: `
        <strong>Overview</strong><br>
        A procedural animation system for sword mechanics that eliminates predefined keyframes. It uses a mass-spring-damper model to simulate realistic inertia, velocity, and fluid responsiveness based on player input.
        <br><br>
        <strong>Technical Implementation</strong><br>
        Implemented in Unity (C#) using the semi-implicit Euler method to solve differential equations.
        <ul>
            <li><strong>Second-Order Dynamics:</strong> Achieved natural overshoot, anticipation, and stabilization.</li>
            <li><strong>Adaptive Response:</strong> Motion adjusts dynamically to input frequency and damping coefficients.</li>
        </ul>
        <br>
        <strong>Stability & Optimization</strong><br>
        Addressed numerical instability from high-frequency updates by deriving constraints based on eigenvalues, ensuring the system remains stable even during frame-rate dips or lag spikes.
      `,
      tech: ['Unity', 'C#', 'Procedural Animation', 'Physics Math']
    },
    {
      title: "Farmers' Market",
      media: [
        { type: 'image', url: 'assets/projects/Capture.PNG' },
        { type: 'image', url: 'assets/projects/cardformat.PNG' },
        { type: 'image', url: 'assets/projects/Rules.jpeg'}
      ],
      summary: 'A strategic card game of bluffing and deception where players compete to sell their animals first.',
      description: `
        <strong>Overview</strong><br>
        A fast-paced tabletop game where players take on the role of savvy farmers. The goal is to be the first to discard all cards by creating valid sequences or successfully bluffing opponents.
        <br><br>
        <strong>Core Mechanics</strong><br>
        The game alternates between two distinct phases:
        <ul>
          <li><strong>Auction Phase:</strong> The active player nominates a card type. Rivals must match it, bluff, or pass.</li>
          <li><strong>Action Phase:</strong> Players can call out potential bluffs. High-risk calls determine who takes the penalty cards.</li>
        </ul>
        <br>
        <strong>Design Process</strong><br>
        Developed from concept to final prototype, focusing on physical game balance, rule clarity, and playtesting to refine the "high-risk, high-reward" social dynamics.
      `,
      tech: ['Game Design', 'Tabletop', 'Prototyping', 'Playtesting']
    },
    {
      title: 'Voxel World Engine',
      media: [
        { type: 'video', url: 'assets/projects/P1.mp4' }, 
        { type: 'video', url: 'assets/projects/p3.mp4' },
        { type: 'video', url: 'assets/projects/Fp2.mp4'},
        { type: 'video', url: 'assets/projects/fp4.mp4'},
        { type: 'video', url: 'assets/projects/fp5.mp4'},
        { type: 'video', url: 'assets/projects/Fp6.mp4'},
        { type: 'video', url: 'assets/projects/fp7.mp4'},
        { type: 'video', url: 'assets/projects/fp8.mp4'}
      ],
      summary: 'A high-performance voxel engine built from scratch in the browser using Three.js and TypeScript.',
      description: `
        <strong>Overview</strong><br>
        A web-based voxel sandbox designed to showcase advanced game engineering mechanics. The engine features live block placement, custom physics, and a low-latency render loop.
        <br><br>
        <strong>Core Engineering & Optimization</strong><br>
        To ensure 60FPS in the browser, I implemented:
        <ul>
          <li><strong>Greedy Meshing:</strong> Reduced draw calls by merging adjacent faces.</li>
          <li><strong>Dirty-Chunk System:</strong> Only rebuilds modified chunks for instant updates.</li>
          <li><strong>Low-GC Architecture:</strong> Reused math objects and cached lookups to prevent frame drops.</li>
        </ul>
        <br>
        <strong>Physics & Gameplay Systems</strong><br>
        I wrote a custom physics layer using AABB collision detection, handling gravity, wall-sliding, and step-up mechanics. The game also features a Finite State Machine (FSM) driving NPC behavior and an FPS view-model system that prevents geometry clipping.
      `,
      tech: ['TypeScript', 'Three.js', 'Vite', 'GLSL', 'Game Physics']
    },
    {
      title: 'RL on Frozen Lake',
      media: [
        { type: 'youtube', url: 'https://www.youtube.com/embed/w-9YKuaY6IE?autoplay=1' },
      ],
      summary: 'Solving the Frozen Lake environment using a progression of RL techniques from Tabular methods to Deep Q-Networks.',
      description: `
        <strong>Overview</strong><br>
        A comprehensive implementation of Reinforcement Learning methodologies. The goal was to train an agent to navigate a slippery grid-world from start to finish while avoiding holes.
        <br><br>
        <strong>Classical Algorithms</strong><br>
        I implemented foundational model-based and model-free techniques to understand the core math of RL:
        <ul>
            <li><strong>Tabular Methods:</strong> Policy Iteration, Value Iteration, SARSA, and Q-Learning.</li>
            <li><strong>Linear Approximation:</strong> Extended Q-Learning to handle larger state spaces using feature encoding.</li>
        </ul>
        <br>
        <strong>Deep Q-Network (DQN)</strong><br>
        Built a Deep RL agent using PyTorch. I implemented a Convolutional Neural Network (CNN) to process visual state representations and utilized an Experience Replay Buffer to stabilize training in complex environments.
      `,
      tech: ['Python', 'PyTorch', 'NumPy', 'Reinforcement Learning', 'DQN']
    },
    {
      title: 'NoCasuals (MMA App)',
      media: [
        { type: 'image', url: 'assets/projects/Nocasuals.JPG' },
        { type: 'image', url: 'assets/projects/Nocasuals1.JPG' }
      ],
      summary: 'A full-stack web application for MMA fans to track, share, and compete in fight predictions.',
      description: `
        <strong>Product & Market Strategy</strong><br>
        I identified a gap in the market for a dedicated, social prediction platform for MMA fans. I managed the entire product lifecycle, from finding product-market fit to executing the go-to-market strategy.
        <br><br>
        <strong>Full-Stack Development</strong><br>
        Built the entire application from scratch (Frontend & Backend). I designed a responsive UI for mobile users and implemented a robust backend to handle user authentication, prediction tracking, and global leaderboards.
        <br><br>
        <strong>Social Features</strong><br>
        Engineered features allowing users to generate shareable prediction cards, fostering a community where fans can build credibility based on their pick history.
      `,
      tech: ['React', 'Full Stack', 'Product Management', 'Web Dev']
    },
    {
      title: 'Advanced Game Engine (C++)',
      media: [
        { 
          type: 'youtube', 
          url: 'https://www.youtube.com/embed/gIPhnpwC5Wo?autoplay=1' 
        },
        { type: 'image', url: 'assets/projects/AGD1.PNG' }
      ],
      summary: 'A high-performance C++ game engine utilizing advanced design patterns and ECS architecture.',
      description: `
        <strong>Core Architecture (ECS)</strong><br>
        Implemented a <strong>Big Array ECS</strong> architecture to resolve performance bottlenecks. This reduced memory fragmentation and achieved a <strong>30% increase</strong> in component lookup speed.
        <br><br>
        <strong>Design Patterns & Optimization</strong><br>
        <ul>
          <li><strong>Flyweight:</strong> Shared intrinsic states for massive object counts, cutting memory use by <strong>40%</strong>.</li>
          <li><strong>Command:</strong> Decoupled input handling, enabling undo/redo and queueing actions.</li>
          <li><strong>Service Locator:</strong> Streamlined access to audio/rendering, speeding up retrieval by 25%.</li>
        </ul>
        <br>
        <strong>Outcome</strong><br>
        Built a scalable, modular engine capable of handling complex game worlds with a <strong>20% overall reduction</strong> in memory usage.
      `,
      tech: ['C++', 'ECS Architecture', 'Design Patterns', 'Memory Optimization']
    }
  ];

  let currentProjIndex = 0;
  let currentMediaIndex = 0;

  // --- 4. HTML STRUCTURE ---
  panel.innerHTML = `
    <button id="prev-proj-btn" class="side-nav-btn" style="
      position: absolute; left: 0; top: 0; bottom: 0; width: 60px; z-index: 20;
      border: none; cursor: pointer; font-size: 2rem;
      display: flex; align-items: center; justify-content: center;
    ">&#10094;</button>

    <button id="next-proj-btn" class="side-nav-btn" style="
      position: absolute; right: 0; top: 0; bottom: 0; width: 60px; z-index: 20;
      border: none; cursor: pointer; font-size: 2rem;
      display: flex; align-items: center; justify-content: center;
    ">&#10095;</button>

    <div id="content-wrapper" class="fade-wrap custom-scroll grab-scroll" style="
      margin: 0 60px; /* Space for buttons */
      height: 100%;
      overflow-y: auto; 
      padding: 20px 10px;
      display: flex; flex-direction: column; gap: 15px;
    ">
      
      <div style="text-align: center;">
        <h1 id="proj-title" style="margin: 0; font-size: 2rem; color: #000; font-weight: bold;">
          ${projects[0].title}
        </h1>
        <div id="proj-tech" class="row" style="justify-content: center; margin-top: 10px; gap: 8px;"></div>
      </div>

      <div id="proj-dots-container" style="
        display: flex; justify-content: center; gap: 8px; margin-bottom: 5px;
      ">
        ${projects.map((_, i) => `
          <div class="proj-dot" data-index="${i}" style="
            width: 10px; height: 10px; border-radius: 50%; 
            background: ${i === 0 ? '#000' : 'rgba(0,0,0,0.2)'}; 
            cursor: pointer;
          "></div>
        `).join('')}
      </div>

      <div id="media-container" style="
        position: relative; width: 100%; height: 350px; 
        background: #000; border-radius: 12px; overflow: hidden; flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      ">
        <div id="media-content" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"></div>

        <div id="media-dots-container" style="
          position: absolute; bottom: 15px; left: 0; right: 0; 
          display: flex; justify-content: center; gap: 8px; z-index: 25; pointer-events: none;
        ">
          </div>

        <button id="prev-media" style="position:absolute; left:0; top:0; bottom:0; width:40px; border:none; background:rgba(0,0,0,0.2); color:white; cursor:pointer; font-size:1.5rem;">&#8249;</button>
        <button id="next-media" style="position:absolute; right:0; top:0; bottom:0; width:40px; border:none; background:rgba(0,0,0,0.2); color:white; cursor:pointer; font-size:1.5rem;">&#8250;</button>
        <div id="media-counter" style="position:absolute; bottom:10px; right:10px; background:rgba(0,0,0,0.7); color:white; padding:2px 8px; border-radius:4px; font-size:0.8rem; display:none;">1/1</div>
      </div>

      <div style="background: rgba(0,0,0,0.05); padding: 15px; border-radius: 8px;">
        <h3 id="proj-summary" style="color: #333; margin-bottom: 10px; border-left: 4px solid #646cff; padding-left: 10px;">
          ${projects[0].summary}
        </h3>
        <div id="proj-desc" style="line-height: 1.6; opacity: 1; font-size: 1rem; color: #444;">
          ${projects[0].description}
        </div>
      </div>

      <div style="height: 20px;"></div> 
    </div>
  `;

  // --- 5. SELECTORS ---
  const els = {
    wrapper: panel.querySelector('#content-wrapper') as HTMLElement,
    title: panel.querySelector('#proj-title') as HTMLElement,
    tech: panel.querySelector('#proj-tech') as HTMLElement,
    mediaContent: panel.querySelector('#media-content') as HTMLElement,
    projDots: panel.querySelector('#proj-dots-container') as HTMLElement, // Outer Dots
    mediaDots: panel.querySelector('#media-dots-container') as HTMLElement, // Inner Dots
    mediaCounter: panel.querySelector('#media-counter') as HTMLElement,
    summary: panel.querySelector('#proj-summary') as HTMLElement,
    desc: panel.querySelector('#proj-desc') as HTMLElement,
    btnPrevProj: panel.querySelector('#prev-proj-btn') as HTMLButtonElement,
    btnNextProj: panel.querySelector('#next-proj-btn') as HTMLButtonElement,
    mediaContainer: panel.querySelector('#media-container') as HTMLElement,
    btnPrevMedia: panel.querySelector('#prev-media') as HTMLButtonElement,
    btnNextMedia: panel.querySelector('#next-media') as HTMLButtonElement,
  };

  // --- 6. DRAG-TO-SCROLL LOGIC ---
  let isDown = false;
  let startY = 0;
  let scrollTop = 0;

  els.wrapper.addEventListener('mousedown', (e) => {
    isDown = true;
    startY = e.pageY - els.wrapper.offsetTop;
    scrollTop = els.wrapper.scrollTop;
    els.wrapper.style.cursor = 'grabbing';
  });

  const stopDrag = () => {
    isDown = false;
    els.wrapper.style.cursor = 'grab';
  };
  els.wrapper.addEventListener('mouseleave', stopDrag);
  els.wrapper.addEventListener('mouseup', stopDrag);

  els.wrapper.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault(); 
    const y = e.pageY - els.wrapper.offsetTop;
    const walk = (y - startY) * 1.5; 
    els.wrapper.scrollTop = scrollTop - walk;
  });

  // --- 7. RENDER LOGIC ---
  const renderMedia = () => {
    const mediaList = projects[currentProjIndex].media;
    const media = mediaList[currentMediaIndex];
    
    // 1. Render Media Content
    const showArrows = mediaList.length > 1;
    els.btnPrevMedia.style.display = showArrows ? 'block' : 'none';
    els.btnNextMedia.style.display = showArrows ? 'block' : 'none';

    els.mediaContent.innerHTML = '';
    if (media.type === 'video' || media.type === 'youtube') {
      if (media.type === 'video') {
         const vid = document.createElement('video');
         vid.src = media.url;
         vid.autoplay = true;
         vid.loop = true;
         vid.muted = true;
         vid.playsInline = true;
         vid.style.width = '100%';
         vid.style.height = '100%';
         vid.style.objectFit = 'contain';
         vid.style.pointerEvents = 'auto'; 
         els.mediaContent.appendChild(vid);
      } else {
         const iframe = document.createElement('iframe');
         iframe.src = media.url;
         iframe.style.width = '100%';
         iframe.style.height = '100%';
         iframe.style.border = 'none';
         iframe.style.pointerEvents = 'auto'; 
         els.mediaContent.appendChild(iframe);
      }
    } else {
      const img = document.createElement('img');
      img.src = media.url;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      img.ondragstart = () => false; 
      els.mediaContent.appendChild(img);
    }

    // 2. Render Media Dots (Inside Image, White)
    if (mediaList.length > 1) {
      els.mediaDots.innerHTML = mediaList.map((_, i) => `
        <div class="media-dot" data-index="${i}" style="
          width: 8px; height: 8px; border-radius: 50%; 
          background: ${i === currentMediaIndex ? 'white' : 'rgba(255,255,255,0.4)'}; 
          cursor: pointer; pointer-events: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.8);
          transition: transform 0.2s, background 0.2s;
          transform: ${i === currentMediaIndex ? 'scale(1.2)' : 'scale(1)'};
        "></div>
      `).join('');
    } else {
      els.mediaDots.innerHTML = ''; // Hide if only 1 item
    }
  };

  const renderProject = () => {
    const p = projects[currentProjIndex];
    els.wrapper.classList.add('fading');

    setTimeout(() => {
      els.title.textContent = p.title;
      els.summary.textContent = p.summary;
      els.desc.innerHTML = p.description;
      els.tech.innerHTML = p.tech.map(t => `<span class="light-chip">${t}</span>`).join('');

      // UPDATE PROJECT DOTS (Above Image, Black/Dark)
      Array.from(els.projDots.children).forEach((dot, i) => {
        const d = dot as HTMLElement;
        d.style.background = i === currentProjIndex ? '#000' : 'rgba(0,0,0,0.2)';
        d.style.transform = i === currentProjIndex ? 'scale(1.3)' : 'scale(1)';
      });

      currentMediaIndex = 0;
      renderMedia();
      els.wrapper.scrollTop = 0;
      els.wrapper.classList.remove('fading');
    }, 250);
  };

  // --- 8. EVENTS ---
  els.btnNextProj.addEventListener('click', () => {
    currentProjIndex = (currentProjIndex + 1) % projects.length;
    renderProject();
  });
  els.btnPrevProj.addEventListener('click', () => {
    currentProjIndex = (currentProjIndex - 1 + projects.length) % projects.length;
    renderProject();
  });

  const nextMedia = (e: Event) => {
    e.stopPropagation();
    const len = projects[currentProjIndex].media.length;
    currentMediaIndex = (currentMediaIndex + 1) % len;
    renderMedia();
  };
  const prevMedia = (e: Event) => {
    e.stopPropagation();
    const len = projects[currentProjIndex].media.length;
    currentMediaIndex = (currentMediaIndex - 1 + len) % len;
    renderMedia();
  };
  els.btnNextMedia.addEventListener('click', nextMedia);
  els.btnPrevMedia.addEventListener('click', prevMedia);

  els.mediaContainer.addEventListener('mouseenter', () => {
    els.btnPrevMedia.style.opacity = '1';
    els.btnNextMedia.style.opacity = '1';
  });
  els.mediaContainer.addEventListener('mouseleave', () => {
    els.btnPrevMedia.style.opacity = '0';
    els.btnNextMedia.style.opacity = '0';
  });

  // Listeners for dots
  els.projDots.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.dataset.index) {
      const idx = parseInt(target.dataset.index);
      if (idx !== currentProjIndex) {
        currentProjIndex = idx;
        renderProject();
      }
    }
  });

  els.mediaDots.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.dataset.index) {
      currentMediaIndex = parseInt(target.dataset.index);
      renderMedia();
    }
  });

  renderProject();
  return panel;
}

// src/ui/sections.ts

export function createHUDNavEl(handlers: { onHero:()=>void; onSkills:()=>void; onProjects:()=>void; }) {
  // 1. Create the REAL HUD element
  const nav = document.createElement('nav');
  
  // 2. Apply "Overlay" Styles (Force it to stay on screen)
  Object.assign(nav.style, {
    position: 'fixed',           // Locks it to the screen (2D)
    bottom: '40px',              // 40px from the bottom
    left: '50%',                 // Center horizontally
    transform: 'translateX(-50%)', // Centers the element perfectly
    zIndex: '10000',             // Ensures it is ON TOP of the 3D Canvas
    
    // Visual Styling (Pill shape)
    display: 'flex',
    gap: '8px',
    padding: '6px',
    background: 'rgba(20, 20, 20, 0.85)', // Dark background so text pops
    backdropFilter: 'blur(10px)',         // Modern blur effect
    borderRadius: '100px',                // Rounded edges
    border: '1px solid rgba(255,255,255,0.15)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    pointerEvents: 'auto',       // ENSURES CLICKS REGISTER
  });

  // 3. Button Styles
  const btnStyle = `
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.8);
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    padding: 10px 20px;
    border-radius: 100px;
    transition: all 0.2s ease;
  `;

  // 4. HTML Content with Hover CSS
  nav.innerHTML = `
    <style>
      .hud-btn:hover { background: rgba(255,255,255,0.2) !important; color: #fff !important; }
      .hud-btn:active { transform: scale(0.95); }
    </style>
    <button id="hero-btn" class="hud-btn" style="${btnStyle}">Hero</button>
    <button id="skills-btn" class="hud-btn" style="${btnStyle}">Skills</button>
    <button id="projects-btn" class="hud-btn" style="${btnStyle}">Projects</button>
  `;

  // 5. Attach Click Listeners
  nav.querySelector('#hero-btn')!.addEventListener('click', handlers.onHero);
  nav.querySelector('#skills-btn')!.addEventListener('click', handlers.onSkills);
  nav.querySelector('#projects-btn')!.addEventListener('click', handlers.onProjects);

  // --- TRICK TO FIX 3D ISSUE ---
  // We append the NAV directly to the body so it sits on top of the screen.
  document.body.appendChild(nav);

  // We return a dummy empty div. If your main script tries to put this 
  // into a CSS3DObject, it will just put this invisible empty div there, 
  // while the real buttons stay fixed on your screen.
  return document.createElement('div');
}