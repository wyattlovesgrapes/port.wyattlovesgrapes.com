const music = document.querySelector('#bg-music');
const menu = document.querySelector('#music-menu');
const dropdown = document.querySelector('#dropdown-btn');
const tracks = {
  html: { title: 'html song', src: 'https://www.grape.wtf/assets/sounds/HTMLSong.mp3' },
  moda: { title: 'moda', src: 'https://www.grape.wtf/assets/sounds/moda-crime-daughter.mp3' }
};
let selectedTrack = tracks.html;
function playMusic() {
  if (!music.src) music.src = selectedTrack.src;
  music.play().then(() => {
    document.querySelectorAll('.now-playing').forEach(label => { label.textContent = selectedTrack.title; });
  }).catch(() => {});
}
document.querySelector('#play-btn').addEventListener('click', playMusic);
document.querySelector('#pause-btn').addEventListener('click', () => {
  music.pause();
  document.querySelectorAll('.now-playing').forEach(label => { label.textContent = 'no music is playing'; });
});
dropdown.addEventListener('click', () => {
  menu.hidden = !menu.hidden;
  dropdown.textContent = menu.hidden ? '\\/' : '/\\';
  dropdown.setAttribute('aria-expanded', String(!menu.hidden));
});
document.querySelectorAll('[data-track]').forEach(button => button.addEventListener('click', () => {
  selectedTrack = tracks[button.dataset.track];
  music.src = selectedTrack.src;
  playMusic();
}));

document.querySelectorAll('.gallery').forEach(gallery => {
  const slides = [...gallery.querySelectorAll('.slide')];
  const count = gallery.querySelector('.gallery-count');
  const frame = gallery.querySelector('.gallery-frame');
  function sizeFrame() {
    const ratios = slides.map(slide => {
      if (slide.dataset.frameHeightRatio) return Number(slide.dataset.frameHeightRatio);
      if (slide instanceof HTMLImageElement && slide.naturalWidth && slide.naturalHeight) return slide.naturalHeight / slide.naturalWidth;
      if (slide instanceof HTMLVideoElement && slide.videoWidth && slide.videoHeight) return slide.videoHeight / slide.videoWidth;
      if (slide.matches('iframe, .placeholder')) return 3 / 4;
      return 0;
    });
    const tallest = Math.max(...ratios);
    if (tallest) frame.style.aspectRatio = `1 / ${tallest}`;
  }
  slides.forEach(slide => {
    if (slide instanceof HTMLImageElement) slide.addEventListener('load', sizeFrame);
    if (slide instanceof HTMLVideoElement) slide.addEventListener('loadedmetadata', sizeFrame);
  });
  sizeFrame();
  let current = 0;
  function show(index) {
    slides[current].hidden = true;
    const video = slides[current].matches('video') ? slides[current] : slides[current].querySelector('video');
    if (video) video.pause();
    const embed = slides[current].matches('iframe') ? slides[current] : slides[current].querySelector('iframe');
    if (embed) embed.src = embed.src;
    current = (index + slides.length) % slides.length;
    slides[current].hidden = false;
    count.textContent = `${current + 1} / ${slides.length}`;
  }
  gallery.querySelector('.previous').addEventListener('click', () => show(current - 1));
  gallery.querySelector('.next').addEventListener('click', () => show(current + 1));
  if (slides.length < 2) gallery.querySelectorAll('.previous, .next').forEach(button => { button.disabled = true; });
});

// Keep the full project markup in one place; the grid previews its first media item.
const projectStore = document.querySelector('.project-details');
const projectGrid = document.querySelector('.project-grid');
const projectWindow = document.querySelector('.project-window');
const windowContent = projectWindow.querySelector('.window-content');
const windowTitle = projectWindow.querySelector('#window-title');
let activeProject = null;
let opener = null;
const projects = [...projectStore.querySelectorAll('.project:not([data-inactive])')];
for (let i = projects.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [projects[i], projects[j]] = [projects[j], projects[i]];
}
projects.forEach(project => {
  const title = project.querySelector('.project-title').textContent;
  const firstSlide = project.querySelector('.slide');
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'project-card';
  if (project.id) card.dataset.project = project.id;
  const media = document.createElement('span');
  media.className = 'card-media';
  if (project.dataset.preview) {
    const image = document.createElement('img');
    image.src = project.dataset.preview;
    image.alt = '';
    media.append(image);
  } else if (firstSlide.matches('iframe') && firstSlide.src.includes('/embed/')) {
    const videoId = new URL(firstSlide.src).pathname.split('/').pop();
    const image = document.createElement('img');
    image.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    image.alt = '';
    media.append(image);
  } else if (firstSlide.matches('.social-embed')) {
    const placeholder = document.createElement('span');
    placeholder.className = 'placeholder';
    placeholder.textContent = 'view post on x';
    media.append(placeholder);
  } else if (firstSlide.matches('img')) {
    const image = firstSlide.cloneNode();
    image.removeAttribute('hidden');
    image.alt = '';
    media.append(image);
  } else if (firstSlide.matches('video') && firstSlide.poster) {
    const image = document.createElement('img');
    image.src = firstSlide.poster;
    image.alt = '';
    media.append(image);
  } else {
    const placeholder = document.createElement('span');
    placeholder.className = 'placeholder';
    placeholder.textContent = 'project media';
    media.append(placeholder);
  }
  for (let i = 0; i < 4; i++) {
    const corner = document.createElement('img');
    corner.className = `preview-corner preview-corner-${i}`;
    corner.src = `https://www.wyattlovesgrapes.com/assets/graphics/corner-${i}.png`;
    corner.alt = '';
    media.append(corner);
    const line = document.createElement('span');
    line.className = `preview-line preview-line-${i}`;
    line.setAttribute('aria-hidden', 'true');
    media.append(line);
  }
  const label = document.createElement('span');
  label.className = 'card-title';
  label.textContent = title;
  card.append(media, label);
  card.addEventListener('click', () => {
    opener = card;
    activeProject = project;
    windowTitle.textContent = title;
    windowContent.append(project);
    projectWindow.showModal();
    document.documentElement.classList.add('project-open');
    projectWindow.querySelector('.window-close').focus();
  });
  projectGrid.append(card);
});
projectWindow.querySelector('.window-close').addEventListener('click', () => projectWindow.close());
projectWindow.addEventListener('click', event => {
  if (event.target === projectWindow) projectWindow.close();
});
projectWindow.addEventListener('close', () => {
  document.documentElement.classList.remove('project-open');
  if (!activeProject) return;
  activeProject.querySelectorAll('video').forEach(video => video.pause());
  activeProject.querySelectorAll('iframe').forEach(frame => { frame.src = frame.src; });
  projectStore.append(activeProject);
  activeProject = null;
  opener?.focus();
});

const cvContent = document.querySelector('#cv');
const skillsContent = document.querySelector('#skills');
const projectsSection = document.querySelector('.projects');
const cvLink = document.querySelector('#cv-link');
const workLink = document.querySelector('#work-link');
const skillsLink = document.querySelector('#skills-link');
function showPage() {
  const isCv = location.hash === '#cv';
  const isSkills = location.hash === '#skills';
  cvContent.hidden = !isCv;
  skillsContent.hidden = !isSkills;
  projectsSection.hidden = isCv || isSkills;
  cvLink.hidden = isCv;
  workLink.hidden = !(isCv || isSkills);
  skillsLink.hidden = isSkills;
  const projectId = location.hash.slice(1);
  if (projectId.startsWith('project-')) {
    const card = [...projectGrid.querySelectorAll('.project-card')].find(item => item.dataset.project === projectId);
    if (card && !projectWindow.open) card.click();
    else if (card && activeProject?.id !== projectId) {
      projectWindow.addEventListener('close', () => card.click(), { once: true });
      projectWindow.close();
    }
  }
}
window.addEventListener('hashchange', showPage);
showPage();

// Load the current README from GitHub; keep the saved copy if the request fails.
async function updateProjectReadme(projectId, repo) {
  const target = document.querySelector(`#${projectId} .readme-content`);
  try {
    const response = await fetch(`https://api.github.com/repos/wyattlovesgrapes/${repo}/readme`, {
      headers: { Accept: 'application/vnd.github.raw+json' }
    });
    if (!response.ok) throw new Error('README unavailable');
    let markdown = await response.text();
    if (!markdown.trim() || markdown.trimStart().startsWith('{')) throw new Error('Unexpected README response');
    // Project media is shown separately; omit README images and linked badges.
    markdown = markdown
      .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, '')
      .replace(/!\[[^\]]*\]\[[^\]]*\]/g, '')
      .replace(/<img\b[^>]*>/gi, '')
      .replace(/<a\b[^>]*>\s*<\/a>/gi, '');
    const result = document.createDocumentFragment();
    let list = null;
    let paragraph = null;
    let codeBlock = null;
    let firstHeading = true;
    function inline(parent, value) {
      const pattern = /(!?\[([^\]]*)\]\(([^)]+)\)|`([^`]+)`)/g;
      let last = 0;
      for (const match of value.matchAll(pattern)) {
        parent.append(document.createTextNode(value.slice(last, match.index)));
        if (match[4] !== undefined) {
          const code = document.createElement('code');
          code.textContent = match[4];
          parent.append(code);
        } else if (!match[1].startsWith('!')) {
          const link = document.createElement('a');
          try {
            const url = new URL(match[3], `https://github.com/wyattlovesgrapes/${repo}/blob/main/`);
            if (url.protocol === 'https:' || url.protocol === 'http:') {
              link.href = url.href;
              link.textContent = match[2];
              parent.append(link);
            } else parent.append(document.createTextNode(match[2]));
          } catch { parent.append(document.createTextNode(match[2])); }
        }
        last = match.index + match[0].length;
      }
      parent.append(document.createTextNode(value.slice(last)));
    }
    for (const line of markdown.replace(/\r\n/g, '\n').split('\n')) {
      if (/^\s*```/.test(line)) {
        if (codeBlock) codeBlock = null;
        else {
          const pre = document.createElement('pre');
          codeBlock = document.createElement('code');
          pre.append(codeBlock);
          result.append(pre);
        }
        paragraph = list = null;
        continue;
      }
      if (codeBlock) { codeBlock.textContent += line + '\n'; continue; }
      if (!line.trim()) { paragraph = list = null; continue; }
      const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (heading) {
        list = paragraph = null;
        if (firstHeading && heading[1].length === 1) { firstHeading = false; continue; }
        firstHeading = false;
        const title = document.createElement('h3');
        inline(title, heading[2]);
        result.append(title);
        continue;
      }
      if (/^\s*!\[[^\]]*\]\([^)]+\)\s*$/.test(line)) { paragraph = list = null; continue; }
      const item = line.match(/^\s*(?:([-*+])\s+|(\d+)\.\s+)(.*)$/);
      if (item) {
        paragraph = null;
        const type = item[2] ? 'OL' : 'UL';
        if (!list || list.tagName !== type) { list = document.createElement(type); result.append(list); }
        const li = document.createElement('li');
        inline(li, item[3]);
        list.append(li);
      } else {
        list = null;
        if (!paragraph) { paragraph = document.createElement('p'); result.append(paragraph); }
        else paragraph.append(document.createTextNode(' '));
        inline(paragraph, line.trim());
      }
    }
    if (result.childNodes.length) target.replaceChildren(result);
  } catch {
    // The bundled README remains available offline or if GitHub rate-limits requests.
  }
}
updateProjectReadme('project-docker-good-boy', 'docker-good-boy');
updateProjectReadme('project-live-server-maintained', 'live-server-maintained');

// A private repository label flashes the window X without navigating away.
document.querySelectorAll('.private-repo').forEach(label => {
  let timer;
  function flash() {
    label.classList.remove('flash');
    void label.offsetWidth;
    label.classList.add('flash');
    clearTimeout(timer);
    timer = setTimeout(() => label.classList.remove('flash'), 1000);
  }
  label.addEventListener('click', flash);
});
windowContent.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#project-"]');
  if (link && link.hash === location.hash) {
    event.preventDefault();
    showPage();
  }
});
