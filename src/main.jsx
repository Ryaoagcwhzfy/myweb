import React, { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { profile, portfolioSlots } from './data';
import { sitePolicies, siteSections } from './site-information';
import ParticleText from './components/ParticleText';
import LogoLoop from './components/LogoLoop';
import TargetCursor from './components/TargetCursor';
import useDraggableDialog from './components/useDraggableDialog';
import Grainient from './components/Grainient';
import GradientASCII from './components/GradientASCII';
import useBackgroundInk from './components/useBackgroundInk';
import FluidGlass from './components/FluidGlass';
import AboutPhotoStack from './components/AboutPhotoStack';
import CampusView from './components/CampusView';
import ElasticDivider from './components/ElasticDivider';
import useAboutEntrance from './components/useAboutEntrance';
import usePortfolioEntrance from './components/usePortfolioEntrance';
import useContactReveal from './components/useContactReveal';
import SquishSwitch from './components/SquishSwitch';
import WorkTrajectory, { TrajectoryPhrase } from './components/WorkTrajectory';
const AboutScrollPreview = lazy(() => import('./components/AboutScrollPreview'));
const Folder = lazy(() => import('./components/Folder'));
const ProfileCardView = lazy(() => import('./components/ProfileCardView'));
import './styles.css';
import './hero.css';
import './about.css';
import './light-sections.css';
import './experience.css';
import './contact.css';
import './portfolio.css';

function Arrow({ diagonal = false, ...props }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5" /></svg>;
}
function AdaptiveInkText({ children, stagger = 0 }) {
  return (
    <span className="adaptive-ink-text">
      {Array.from(String(children)).map((character, index) => (
        <span data-ink-character key={index} style={stagger ? { '--ink-reveal-delay': `${index * stagger}ms` } : undefined}>
          {character}
        </span>
      ))}
    </span>
  );
}
const WORDMARK_STROKE_WIDTH = 4.6;

function Wordmark() {
  return (
    <a className="logo wordmark" href="#home" aria-label={`${profile.name}，回到首页`}>
      <svg className="wordmark-signature" viewBox="4 0 266 70" fill="none" stroke="currentColor"
        strokeWidth={WORDMARK_STROKE_WIDTH} strokeLinecap="round" strokeLinejoin="round" data-ink-character="" aria-hidden="true">
        <path className="wordmark-main-stroke" pathLength="1" d="
          M7 19 C15 9 32 8 39 13 C34 22 18 32 10 42 C18 38 25 45 34 43 C39 42 44 38 47 34
          C51 27 55 16 57 11 C60 3 67 5 65 12 C62 20 53 27 47 34 L43 44
          C48 37 54 31 59 32 C64 33 59 41 61 44 C64 47 69 42 72 37
          C78 28 89 30 87 36 C84 43 76 48 72 44 C68 40 74 33 79 32 C82 31 86 31 88 33
          C86 38 83 45 88 45 C92 45 95 40 98 36
          C103 29 113 31 112 37 C111 43 106 46 102 45 C96 43 98 36 103 33
          C107 30 111 30 114 34 C116 37 120 36 124 33
          C130 26 138 13 139 8 C141 2 147 3 146 10 C144 17 134 24 127 30
          C123 36 118 49 116 55 C114 62 118 64 124 59 C131 52 136 43 133 37
          C132 35 128 36 130 39 C133 42 139 39 144 35
          C154 35 157 29 151 29 C146 29 141 36 142 41 C143 48 151 47 158 41 L165 33
          C168 32 165 38 164 41 C161 49 169 47 176 41 L183 33
          C180 37 177 45 183 46 C189 47 195 40 198 33 C193 47 188 60 182 64
          C176 68 172 64 175 59 C180 53 195 49 205 41 L211 33
          C207 41 207 47 212 46 C218 46 223 40 227 32 C225 38 220 45 226 46 C232 47 238 41 244 38
        " />
        <path className="wordmark-detail-strokes" pathLength="1" d="M120 30 C125 29 134 28 139 29 M168 25 l .7 -.5" />
      </svg>
    </a>
  );
}
function SectionLabel({ number, children }) { return <div className="section-label"><span>{number}</span>{children}</div>; }

const softwareLoopItems = [
  ['photoshop', 'Photoshop'],
  ['cinema4d', 'Cinema 4D'],
  ['chatgpt', 'ChatGPT'],
  ['jimeng', '即梦 AI'],
  ['codex', 'Codex'],
  ['chrome', 'Chrome'],
  ['wps', 'WPS Office'],
  ['capcut', 'CapCut'],
  ['behance', 'Behance'],
  ['github', 'GitHub'],
  ['comfyui', 'ComfyUI'],
  ['illustrator', 'Illustrator'],
  ['figma', 'Figma'],
  ['unrealengine', 'Unreal Engine'],
  ['apexlegends', 'Apex Legends'],
].map(([id, title]) => ({
  title,
  node: <span className="software-logo" role="img" aria-label={title}>
    <span className={'software-logo-mark software-logo-' + id} style={{ '--software-logo': `url("/assets/software/${id}.svg")` }} aria-hidden="true" />
    <span className="software-logo-label" aria-hidden="true">{title}</span>
  </span>,
}));

const SITE_ENTRANCE_DURATION = 3000;

function alignEntranceTrails(stroke, trails) {
  const transform = stroke.getScreenCTM();
  const bounds = trails.getBoundingClientRect();
  if (!transform || !bounds.width) return;

  const start = stroke.getPointAtLength(0).matrixTransform(transform);
  const end = stroke.getPointAtLength(stroke.getTotalLength()).matrixTransform(transform);
  const left = start.x - bounds.left;
  const entryY = start.y - bounds.top;
  const exitX = end.x - bounds.left;
  const exitY = end.y - bounds.top;
  const travel = bounds.width - exitX;
  const wave = Math.min(36, travel * .12);
  const entryCurve = Math.min(12, left * .3);
  const entryLift = Math.min(21, left * .7);
  const x = fraction => exitX + travel * fraction;

  trails.setAttribute('stroke-width', WORDMARK_STROKE_WIDTH * transform.a);
  trails.querySelector('.site-entrance-lead').setAttribute('d', `
    M 0 ${entryY + entryLift}
    C ${left * .30} ${entryY + entryLift} ${left - entryCurve} ${entryY + entryCurve * 1.25} ${left} ${entryY}
  `);
  trails.querySelector('.site-entrance-exit').setAttribute('d', `
    M ${exitX} ${exitY}
    C ${x(.08)} ${exitY - Math.min(wave, travel * .04)} ${x(.17)} ${exitY - wave} ${x(.25)} ${exitY}
    S ${x(.43)} ${exitY + wave} ${x(.5)} ${exitY}
    S ${x(.68)} ${exitY - wave} ${x(.75)} ${exitY}
    S ${x(.93)} ${exitY + wave} ${bounds.width} ${exitY}
  `);
}

function SiteEntrance({ onStageChange }) {
  const progressRef = useRef(null);
  const trailsRef = useRef(null);

  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const signature = progressRef.current?.closest('.header')?.querySelector('.wordmark-signature');
    const stroke = signature?.querySelector('.wordmark-main-stroke');
    const trails = trailsRef.current;
    const alignTrails = () => {
      if (stroke && trails) alignEntranceTrails(stroke, trails);
    };
    const updateMotion = () => {
      if (motion.matches) onStageChange(null);
    };
    let startedAt;
    let frame;
    let writingAnimations;

    function updateProgress() {
      const indicator = progressRef.current;
      if (!indicator) return;
      writingAnimations ??= [
        ...(signature?.getAnimations({ subtree: true }) ?? []),
        ...(trails?.getAnimations({ subtree: true }) ?? []),
      ];
      const now = performance.now();
      startedAt ??= now;
      const elapsed = Math.min(now - startedAt, SITE_ENTRANCE_DURATION);
      for (const animation of writingAnimations) animation.currentTime = elapsed;
      const percent = Math.floor(elapsed / SITE_ENTRANCE_DURATION * 100);
      const label = `${percent}%`;
      if (indicator.textContent !== label) indicator.textContent = label;
      if (percent < 100) frame = requestAnimationFrame(updateProgress);
      else onStageChange('revealing');
    }

    updateMotion();
    alignTrails();
    motion.addEventListener('change', updateMotion);
    window.addEventListener('resize', alignTrails);
    frame = requestAnimationFrame(updateProgress);
    return () => {
      cancelAnimationFrame(frame);
      motion.removeEventListener('change', updateMotion);
      window.removeEventListener('resize', alignTrails);
    };
  }, [onStageChange]);

  return (
    <div className="site-entrance" aria-hidden="true" onAnimationEnd={event => {
      if (event.target === event.currentTarget) onStageChange(null);
    }}>
      <svg ref={trailsRef} className="site-entrance-trails" fill="none" stroke="currentColor" strokeLinecap="round">
        <path className="site-entrance-lead" pathLength="1" />
        <path className="site-entrance-exit" pathLength="1" />
      </svg>
      <div className="site-entrance-progress wrap"><span ref={progressRef}>0%</span></div>
    </div>
  );
}

function Header({ entranceStage, onEntranceStageChange }) {
  const [open, setOpen] = useState(false);
  const [surface, setSurface] = useState('hero');
  const headerRef = useRef(null);
  useEffect(() => {
    const hero = document.getElementById('home');
    const contact = document.getElementById('contact');
    const updateSurface = () => {
      const sampleY = (headerRef.current?.offsetHeight ?? 80) / 2;
      setSurface(hero.getBoundingClientRect().bottom > sampleY ? 'hero' : contact.getBoundingClientRect().top <= sampleY ? 'violet' : 'light');
    };
    updateSurface();
    window.addEventListener('scroll', updateSurface, { passive: true });
    window.addEventListener('resize', updateSurface);
    const observer = new ResizeObserver(updateSurface);
    observer.observe(document.getElementById('root'));
    return () => {
      window.removeEventListener('scroll', updateSurface);
      window.removeEventListener('resize', updateSurface);
      observer.disconnect();
    };
  }, []);
  return (
    <header
      ref={headerRef}
      className="header"
      data-surface={surface}
      data-entrance-stage={entranceStage}
      style={entranceStage === 'loading' ? { '--entrance-loading-duration': `${SITE_ENTRANCE_DURATION}ms` } : undefined}
    >
      {entranceStage && <SiteEntrance onStageChange={onEntranceStageChange} />}
      <div className="header-inner wrap" inert={Boolean(entranceStage)}>
        <Wordmark />
        <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="切换导航"><AdaptiveInkText>{open ? '关闭 −' : '菜单 +'}</AdaptiveInkText></button>
        <nav className={open ? 'nav is-open' : 'nav'} aria-label="主导航">{[['about', '关于我'], ['experience', '工作经历'], ['projects', '作品展示'], ['contact', '联系我']].map(([id, label]) => <a key={id} href={'#' + id} onClick={() => setOpen(false)}><AdaptiveInkText>{label}</AdaptiveInkText></a>)}</nav>
      </div>
    </header>
  );
}
function HeroParticleIntro() {
  const [compact, setCompact] = useState(() => matchMedia('(max-width: 700px)').matches);
  useEffect(() => {
    const query = matchMedia('(max-width: 700px)');
    const update = () => setCompact(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return (
    <div className="hero-particle-intro">
      <ParticleText
        text={profile.hero.particleText}
        particleSize={compact ? 2 : 3}
        density={compact ? 3 : 5}
        color="currentColor"
        highlightColor="#94a3b8"
        highlightMode="motion"
        shape="square"
        intro="scan"
        scatter={120}
        gatherDuration={1800}
        stagger={240}
        clickBurst
        burstStrength={0.8}
        pointerRepel={24}
        repelRadius={90}
        idleDrift={0}
        trigger="hover"
        fontSize="clamp(3rem, 12vw, 8rem)"
        fontWeight={800}
        fontFamily="inherit"
        align="left"
        overflowPadding={compact ? 160 : 220}
        glow={false}
      />
    </div>
  );
}
function Hero({ entering }) {
  const videoRef = useRef(null);
  const playRequested = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [videoStatus, setVideoStatus] = useState('idle');
  const [waitingForVideo, setWaitingForVideo] = useState(false);
  useEffect(() => {
    const video = videoRef.current;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const sync = () => {
      if (visible && !document.hidden && playRequested.current) video.play().catch(() => {});
      else video.pause();
    };
    const updateMotion = () => {
      const unavailable = video.error || (video.readyState >= video.HAVE_METADATA && !video.videoWidth);
      playRequested.current = !entering && !reduced.matches && !unavailable;
      sync();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.05 });
    updateMotion();
    observer.observe(video.closest('.hero'));
    reduced.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      reduced.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [entering]);
  function setVideoPlaying(next) {
    const video = videoRef.current;
    if (!video) return;
    playRequested.current = next;
    if (next) video.play().catch(() => {});
    else video.pause();
  }
  function showPoster(video) {
    playRequested.current = false;
    video.pause();
    setPlaying(false);
    setWaitingForVideo(false);
    setVideoStatus('unavailable');
  }
  return (
    <section className="hero" id="home">
      <div className="hero-media">
        <img src="/assets/hero-poster.jpg?v=a7e0a22c6c34" alt="" fetchPriority="high" />
        <video ref={videoRef} src="/assets/hero-original.mp4?v=a7e0a22c6c34" muted loop playsInline preload={entering ? 'auto' : 'none'} data-ready={videoStatus === 'ready'}
          onLoadedMetadata={({ currentTarget }) => { if (!currentTarget.videoWidth) showPoster(currentTarget); }}
          onPlay={({ currentTarget }) => setWaitingForVideo(currentTarget.readyState < currentTarget.HAVE_FUTURE_DATA)}
          onWaiting={({ currentTarget }) => setWaitingForVideo(playRequested.current && !currentTarget.paused)}
          onPlaying={({ currentTarget }) => {
            if (currentTarget.videoWidth) setVideoStatus('ready');
            setWaitingForVideo(false);
            setPlaying(currentTarget.videoWidth > 0);
          }}
          onPause={() => {
            setWaitingForVideo(false);
            setPlaying(false);
          }}
          onError={({ currentTarget }) => showPoster(currentTarget)} aria-label="首页背景视频" />
      </div>
      <div className="hero-content wrap">
        <div className="hero-copy">
          <h1 aria-label={profile.hero.title.join(' ')}>
            {profile.hero.title.map((line, index) => <span key={line} className={index === 1 ? 'hero-outline' : undefined}>{index === 2 ? <>{line.slice(0, -1)}<span className="hero-period">.</span></> : line}</span>)}
          </h1>
          <HeroParticleIntro />
          <dl className="hero-disciplines" aria-label="创作关键词">
            {[
              ['FORM', '形式'],
              ['THOUGHT', '思考'],
              ['EXPLORE', '探索'],
              ['CREATE', '创造'],
              ['PERCEPTION', '感知'],
              ['IMAGINATION', '想象'],
            ].map(([english, chinese]) => <div key={english}><dt>{english}</dt><dd>{chinese}</dd></div>)}
          </dl>
        </div>
        <div className="hero-bottom">
          <span className="hero-video-status" role="status">{waitingForVideo ? 'Thinking…' : ''}</span>
          <SquishSwitch checked={playing} onChange={setVideoPlaying} disabled={videoStatus === 'unavailable'} ariaLabel="播放背景视频" trackColor="#27272a" trackOnColor="#f5f5f5" width={76} height={38} radius={19} />
        </div>
      </div>
    </section>
  );
}
function About({ onOpenProfile, onOpenCampus, entering }) {
  const aboutRef = useRef(null);
  const visit = useAboutEntrance(aboutRef);

  useLayoutEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const lines = aboutRef.current.querySelectorAll(
      '.about-principles-title, .about-principle-row, .about-services h3, .about-services li, .software-loop-thanks',
    );
    for (const line of lines) line.dataset.aboutText = 'waiting';
    if (entering) return;

    const entranceObserver = new IntersectionObserver(entries => {
      let lineIndex = 0;
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting || target.dataset.aboutText === 'entered') continue;
        target.style.setProperty('--about-text-delay', `${lineIndex * 85}ms`);
        target.dataset.aboutText = 'entered';
        lineIndex += 1;
      }
    }, { rootMargin: '0px 0px -64px' });

    const exitObserver = new IntersectionObserver(entries => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) target.dataset.aboutText = 'waiting';
      }
    });

    for (const line of lines) {
      entranceObserver.observe(line);
      exitObserver.observe(line);
    }

    return () => {
      entranceObserver.disconnect();
      exitObserver.disconnect();
      for (const line of lines) {
        delete line.dataset.aboutText;
        line.style.removeProperty('--about-text-delay');
      }
    };
  }, [entering]);

  return (
    <section ref={aboutRef} className="about about--entrance" id="about" aria-labelledby="about-title" data-entrance="waiting">
      <Suspense fallback={null}><AboutScrollPreview /></Suspense>
      <p className="chapter-caption about-caption wrap">（关于）</p>
      <div className="about-editorial wrap">
        <h2 className="about-accessible-title" id="about-title">关于我 · {profile.chineseName}</h2>
        <div className="about-reveal-zone about-reveal-zone--above" aria-hidden="true"><span className="about-character about-character-zhao">赵</span></div>
        <div className="about-identity">
          <div className="about-signature"><span>{profile.chineseName}</span></div>
          <dl className="about-education">
            <div><dt className="about-accessible-title">{profile.education.degree}院校</dt><dd><button type="button" className="about-institution-button" onClick={onOpenCampus} aria-haspopup="dialog">{profile.education.institution}</button></dd></div>
            <div><dt className="about-accessible-title">专业</dt><dd>{profile.education.major}</dd></div>
            <div><dt className="about-accessible-title">学年</dt><dd>{profile.education.years}</dd></div>
          </dl>
        </div>
        <ElasticDivider />
        <div className="about-image-slot">
          <svg className="about-character-f" viewBox="0 0 350 790" fill="currentColor" aria-hidden="true"><path d="M0 0H350V158H205V308H334V458H205V790H0Z" /></svg>
          <svg className="about-character-e" viewBox="0 0 120 180" preserveAspectRatio="none" fill="currentColor" aria-hidden="true"><path d="M0 0H120V34H40V72H112V106H40V146H120V180H0Z" /></svg>
          <svg className="about-character-i" viewBox="0 0 70 790" preserveAspectRatio="none" fill="currentColor" aria-hidden="true"><path d="M0 0H70V158H0ZM0 236H70V790H0Z" /></svg>
          <AboutPhotoStack {...visit} onOpenProfile={onOpenProfile} />
        </div>
        <div className="about-reveal-zone about-reveal-zone--below"><div className="about-biography">{profile.introduction.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div></div>
        <div className="about-reveal-zone about-reveal-zone--below" aria-hidden="true"><span className="about-character about-character-yu">宇</span></div>
      </div>
      <section className="about-continuation wrap" aria-labelledby="about-principles-title">
        <h3 className="about-principles-title" id="about-principles-title">（使命、愿景、价值观）</h3>
        <dl className="about-principles">
          {profile.principles.map(item => <div className="about-principle-row" key={item.enLabel}>
            <dt>{item.label}</dt><dd>{item.text}</dd>
            <dt className="about-principle-en-label" lang="en">{item.enLabel}</dt><dd className="about-principle-en-text" lang="en">{item.enText}</dd>
          </div>)}
        </dl>
        <section className="about-services" aria-labelledby="about-services-title">
          <h3 id="about-services-title">（服务）</h3>
          <ul>{profile.services.map(service => <li key={service}>{service}</li>)}</ul>
        </section>
      </section>
      <div className="about-software-loop">
        <p className="software-loop-thanks wrap">（感谢它们 ↓）</p>
        <LogoLoop logos={softwareLoopItems} speed={48} direction="left" logoHeight={64} gap={76} hoverSpeed={0} fadeOut={false} intro={false} ariaLabel="软件与创作平台 Logo 滚动展示" />
      </div>
    </section>
  );
}
function moveExperiencePhotos(event) {
  if (event.pointerType !== 'mouse') return;

  const photos = Array.from(event.currentTarget.children, photo => ({
    photo,
    bounds: photo.getBoundingClientRect(),
  }));
  const nearbyDistance = 56;

  for (const { photo, bounds } of photos) {
    const halfWidth = bounds.width / 2;
    const halfHeight = bounds.height / 2;
    const dx = bounds.left + halfWidth - event.clientX;
    const dy = bounds.top + halfHeight - event.clientY;
    const edgeDistance = Math.hypot(Math.max(0, Math.abs(dx) - halfWidth), Math.max(0, Math.abs(dy) - halfHeight));
    const strength = Math.max(0, 1 - edgeDistance / nearbyDistance);
    const distance = Math.max(Math.hypot(dx, dy), nearbyDistance);
    const horizontal = dx / distance * strength;
    const vertical = dy / distance * strength;

    photo.style.setProperty('--photo-shift-x', `${horizontal * 10}px`);
    photo.style.setProperty('--photo-shift-y', `${vertical * 8}px`);
    photo.style.setProperty('--photo-turn', `${horizontal * 2.5}deg`);
  }
}

function resetExperiencePhotos(event) {
  for (const photo of event.currentTarget.children) {
    photo.style.removeProperty('--photo-shift-x');
    photo.style.removeProperty('--photo-shift-y');
    photo.style.removeProperty('--photo-turn');
  }
}

const EXPERIENCE_TEXT_SELECTOR = '.experience-heading, .experience-caption, .experience-detail h3, .experience-meta, .experience-stage-heading, .experience-stage-description';

function ExperienceChapter({ entering }) {
  const chapterRef = useRef(null);
  const backgroundRef = useRef(null);
  const updateBackgroundInk = useBackgroundInk(chapterRef, `.work-trajectory h2, ${EXPERIENCE_TEXT_SELECTOR}`, '.experience-background');
  return (
    <div ref={chapterRef} className="experience-chapter" id="experience-chapter">
      <div ref={backgroundRef} className="experience-background" aria-hidden="true">
        <Grainient
          colors={['#6d6eab', '#9278ad', '#c8bbd6', '#ffffff']}
          angle={100} flow={1.1} silk={0.6} grainAmount={0.08} bands={3} dpr={1}
          onLuminanceMap={updateBackgroundInk}
        />
      </div>
      <WorkTrajectory entering={entering} backgroundRef={backgroundRef}>
        <AdaptiveInkText>从</AdaptiveInkText>
        <TrajectoryPhrase><AdaptiveInkText>不会到会</AdaptiveInkText></TrajectoryPhrase>
        <AdaptiveInkText>，从</AdaptiveInkText>
        <TrajectoryPhrase><AdaptiveInkText>会到稳</AdaptiveInkText></TrajectoryPhrase>
        <AdaptiveInkText>，</AdaptiveInkText><br />
        <AdaptiveInkText>就这么过来的</AdaptiveInkText>
      </WorkTrajectory>
      <Experience entering={entering} />
    </div>
  );
}

function Experience({ entering }) {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const texts = sectionRef.current.querySelectorAll(EXPERIENCE_TEXT_SELECTOR);
    for (const text of texts) text.dataset.experienceText = 'waiting';
    if (entering) return;

    const observer = new IntersectionObserver(entries => {
      for (const { target, isIntersecting, intersectionRatio } of entries) {
        const revealThreshold = target.matches('h2, h3') ? .55 : .15;
        if (!isIntersecting) target.dataset.experienceText = 'waiting';
        else if (intersectionRatio >= revealThreshold) target.dataset.experienceText = 'entered';
      }
    }, { threshold: [0, .15, .55] });

    for (const text of texts) observer.observe(text);

    return () => {
      observer.disconnect();
      for (const text of texts) delete text.dataset.experienceText;
    };
  }, [entering]);

  useEffect(() => {
    const entrances = Array.from(sectionRef.current.querySelectorAll('.experience-photos'), group => ({
      group,
      result: group.parentElement.querySelector('.experience-stage-result'),
    }));
    let frame = 0;

    function update() {
      frame = 0;
      const viewportBottom = window.innerHeight;
      for (const { group, result } of entrances) {
        const { top, height } = (result ?? group).getBoundingClientRect();
        const entered = group.dataset.photoEntrance === 'entered';
        const entranceOffset = result ? 20 : Math.min(height, viewportBottom) * .23;
        if (entered && top >= viewportBottom + 32) {
          group.dataset.photoEntrance = 'waiting';
        } else if (!entered && top <= viewportBottom - entranceOffset) {
          const gallery = group.getBoundingClientRect();
          if (gallery.top > viewportBottom - 72 || gallery.bottom <= 0) continue;
          group.dataset.photoEntrance = 'entered';
        }
      }
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <section ref={sectionRef} className="experience-section section" id="experience" aria-labelledby="experience-title">
      <h2 className="experience-heading wrap" id="experience-title"><AdaptiveInkText stagger={46}>职业轨迹</AdaptiveInkText></h2>
      <p className="chapter-caption experience-caption wrap"><AdaptiveInkText>（工作）</AdaptiveInkText></p>
      {profile.experience.map(item => (
        <article className="experience-layout wrap" data-photo-style={item.photoStyle} key={item.company + item.period}>
          {item.images?.length ? (
            <div className="experience-photos" data-photo-entrance="waiting" role="group" aria-label={`${item.role}工作照片`}
              onPointerMove={moveExperiencePhotos} onPointerLeave={resetExperiencePhotos}>
              {item.images.map((image, imageIndex) => (
                <figure className="experience-photo" key={imageIndex}>
                  {image ? (
                    <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
                  ) : (
                    <div className="experience-photo-placeholder"><span>照片待补充</span></div>
                  )}
                </figure>
              ))}
            </div>
          ) : null}
          <div className="experience-detail">
            <h3><AdaptiveInkText stagger={46}>{item.role}</AdaptiveInkText></h3>
            <div className="experience-meta">
              <p><AdaptiveInkText>{item.company}</AdaptiveInkText></p>
              <p className="experience-period"><AdaptiveInkText>{item.period}</AdaptiveInkText></p>
            </div>
            <ul className="experience-stages">
              {item.stages.map(stage => (
                <li className="experience-stage" key={stage.period ?? stage.description}>
                  {stage.title ? (
                    <h4 className="experience-stage-heading">
                      <span className="experience-stage-period"><AdaptiveInkText>{stage.period}</AdaptiveInkText></span>
                      <span><AdaptiveInkText>{stage.title}</AdaptiveInkText></span>
                    </h4>
                  ) : null}
                  <p className="experience-stage-description"><AdaptiveInkText>{stage.description}</AdaptiveInkText></p>
                  {stage.result ? <p className="experience-stage-description experience-stage-result"><AdaptiveInkText>{stage.result}</AdaptiveInkText></p> : null}
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </section>
  );
}
function ProjectArt({ type }) {
  return <div className={'project-art art-' + type}>{type === 'synth' ? <img src="/assets/lotus.webp" alt="透光荷叶与蓝绿水色交织的自然视觉" loading="lazy" /> : type === 'void' ? <img src="/assets/architecture.webp" alt="黑白极简建筑空间与光影" loading="lazy" /> : <div className="form-shape" />}<div className="art-top"><span>CONCEPT<br />PROJECT</span><span>{type === 'form' ? 'A NEW VISUAL LANGUAGE' : type === 'synth' ? 'EXPLORING NEW POSSIBILITIES' : 'SPACE. PEOPLE. POSSIBILITIES.'}</span></div><div className="art-title">{type.toUpperCase()}</div><div className="art-bottom"><span>{type === 'form' ? 'SHAPE THE NEXT.' : type === 'synth' ? 'BETWEEN REAL AND IMAGINED.' : 'THE ART OF LESS.'}</span><span>概念视觉 · 非客户案例</span></div></div>;
}
function PortfolioThumbnail({ project }) {
  return <span className={'portfolio-thumbnail portfolio-thumbnail--' + project.format}>
    {project.image ? <img src={project.image} alt={project.name} loading="lazy" /> : <span className="portfolio-placeholder" aria-hidden="true">{project.id}</span>}
  </span>;
}
function Projects({ onSelect, cursorEnabled }) {
  const projectsRef = useRef(null);
  const backgroundRevealRef = usePortfolioEntrance(projectsRef);
  const updateBackgroundInk = useBackgroundInk(
    projectsRef,
    '.portfolio-icon-label, .portfolio-caption, .portfolio-statement > p',
    '.portfolio-background-effect',
    '.target-cursor > span',
  );
  return <section ref={projectsRef} className="projects section portfolio-section" id="projects" aria-labelledby="portfolio-title">
    <div className="portfolio-background" aria-hidden="true">
      <div className="portfolio-background-effect">
        <GradientASCII
          colors={['#6d6eab', '#9278ad', '#c8bbd6', '#ffffff']}
          shape="horizon"
          characters=" =+xX0S8#@"
          characterVariants={[' .:;|/\\[]{}<>!?02468%#@', ' .:+17F2345ACDE069B8%#@']}
          cellSize={18}
          density={0.8}
          glyphOpacity={1}
          glow={0}
          lightMode
          intro={false}
          revealRef={backgroundRevealRef}
          onLuminanceMap={updateBackgroundInk}
        />
      </div>
    </div>
    {cursorEnabled && <TargetCursor container={projectsRef} targetSelector="#projects .portfolio-icon" cursorColor="#9278ad" cursorColorOnTarget="#6c5088" blendMode="normal" spinDuration={0} hoverDuration={0.35} size={30} cornerSize={10} thickness={1.5} padding={8} parallaxOn hideDefaultCursor />}
    <div className="portfolio-content wrap">
    <div className="portfolio-heading">
      <p className="chapter-caption portfolio-caption"><AdaptiveInkText>（作品）</AdaptiveInkText></p>
      <h2 className="about-accessible-title" id="portfolio-title">作品展示</h2>
    </div>
    <div className="portfolio-stage">
      <div className="portfolio-statement">
        <p className="portfolio-statement-motto" lang="en">Beyond form.<br />Never stop creating.</p>
        <p className="portfolio-statement-note">用心设计的作品经得起时间的考验，无论它诞生于何时，又因何而作。</p>
      </div>
      <ul className="portfolio-desktop" aria-label={`${portfolioSlots.length}个作品位置`}>
        {portfolioSlots.map(project => <li className={'portfolio-item' + (project.coverSize === 'large' ? ' portfolio-item--large-cover' : '')} key={project.id}>
          <button className="portfolio-icon" data-cursor-label={'查看' + project.name} onClick={() => onSelect(project)} aria-label={'查看' + project.name + (project.image || project.images.length ? '' : '，图片待添加')}>
            <PortfolioThumbnail project={project} />
            <span className="portfolio-icon-label" aria-hidden="true">
              {Array.from(project.name).map((character, index) => (
                <span className="portfolio-label-character" data-ink-character key={index} style={{ '--flip-delay': `${Math.min(index, 10) * 17}ms` }}>
                  <span className="portfolio-label-turn">
                    <span>{character}</span><span>{character}</span>
                  </span>
                </span>
              ))}
            </span>
          </button>
        </li>)}
      </ul>
    </div>
    </div>
    <div className="portfolio-closing wrap">
      <figure className="closing-nessie closing-nessie--christmas">
        <img src="/assets/nessie/nessie-christmas.png" alt="戴圣诞帽的 Apex 小水怪" width="96" height="112" loading="lazy" />
        <figcaption className="closing-nessie-speech" lang="ja">ご覧いただき<br />ありがとうございました</figcaption>
      </figure>
      <p>THANKS FOR WATCHING / 感谢观看</p>
      <figure className="closing-nessie closing-nessie--backpack">
        <img src="/assets/nessie/nessie-backpack.png" alt="背着背包的 Apex 小水怪" width="96" height="112" loading="lazy" />
        <figcaption className="closing-nessie-speech" lang="en">END</figcaption>
      </figure>
    </div>
  </section>;
}
function PortfolioFolderPicker({ project, onChoose, onClose }) {
  const items = [{ title: '作品展示', description: '最终成果与作品细节' }, { title: '想法到落地', description: '构思、探索与迭代' }];
  return <div className="portfolio-folder-picker">
    <button className="portfolio-folder-close" onClick={onClose} aria-label="关闭作品文件夹">×</button>
    <p className="portfolio-folder-eyebrow">PROJECT / {project.id}</p>
    <h2 id="dialog-title">{project.name}</h2>
    <p className="portfolio-folder-hint">选择你想查看的内容</p>
    <div className="portfolio-folder-stage">
      <Suspense fallback={<p className="portfolio-folder-loading" role="status">正在打开作品文件夹…</p>}>
        <Folder color="#9278ad" label={project.name} items={items} theme="light" layout="row" size={1.2} defaultOpen intro speed={1.4 / 2.5} draggable={false} zoomOnClick={false} closeOnOutsideClick={false} onItemClick={(_, index) => onChoose(index === 0 ? 'showcase' : 'process')} />
      </Suspense>
    </div>
  </div>;
}
function PortfolioPreview({ project, onClose, onBack }) {
  const isProcess = project.view === 'process';
  const viewTitle = isProcess ? '想法到落地' : '作品展示';
  const description = isProcess ? project.process?.description : project.description;
  const images = isProcess ? (project.process?.images ?? []) : (project.images ?? (project.image ? [project.image] : []));
  const documents = isProcess ? project.process?.documents || [] : [];
  return <article className="portfolio-preview">
    <header className="portfolio-window-bar" title="拖动标题栏移动窗口">
      <div className="portfolio-window-controls">
        <button className="portfolio-window-close" onClick={onClose} aria-label="关闭作品窗口"><span aria-hidden="true">×</span></button>
        <span className="portfolio-window-dot is-yellow" aria-hidden="true" />
        <span className="portfolio-window-dot is-green" aria-hidden="true" />
      </div>
      <span className="portfolio-window-title">{viewTitle}：{project.name}</span>
      <button className="portfolio-window-dismiss" onClick={onClose} aria-label="关闭作品预览">×</button>
    </header>
    <div className="portfolio-window-content">
      {onBack && <button className="portfolio-window-back" onClick={onBack}>← 返回文件夹</button>}
      <div className="portfolio-window-identity">
        <PortfolioThumbnail project={project} />
        <div><h2 id="dialog-title">{project.name}{isProcess ? ' · 想法到落地' : ''}</h2><p>{isProcess ? documents.length ? `${documents.length} 份设计过程文档` : '想法到落地待补充' : project.subtitle || '作品内容待补充'}</p></div>
        <span className="portfolio-window-index">{project.id} / {portfolioSlots.length}</span>
      </div>
      <div className={'portfolio-window-description' + (description ? '' : ' is-empty')}>
        <p>{description || (isProcess ? '想法到落地说明待补充' : '作品简介待补充')}</p>
      </div>
      <details className="portfolio-window-details" open>
        <summary>详情 <span lang="en">/ Details</span></summary>
        <dl><div><dt>类型</dt><dd>{project.category || '待补充'}</dd></div><div><dt>年份</dt><dd>{project.year || '待补充'}</dd></div></dl>
      </details>
      <details className="portfolio-window-gallery" open>
        <summary>预览 <span lang="en">/ Preview</span></summary>
        <div className="portfolio-window-images">
          {images.map((image, index) => <img key={image + index} src={image} alt={project.name + ' · ' + viewTitle + ' · ' + (index + 1)} loading="lazy" />)}
          {documents.map(({ title, pdf, preview }) => <figure className="portfolio-window-document" key={pdf}>
            <figcaption>{title} <a href={pdf} target="_blank" rel="noopener" aria-label={`打开原版 PDF · ${title}`}>打开原版 PDF ↗</a></figcaption>
            <img src={preview} alt={`${title}的设计稿预览`} width="2000" height="1051" loading="lazy" />
          </figure>)}
          {!images.length && !documents.length && <div className="portfolio-window-empty"><span aria-hidden="true">{project.id}</span><p>{isProcess ? '想法到落地图片待添加' : '作品图片待添加'}</p></div>}
        </div>
      </details>
    </div>
  </article>;
}
function ContactEmailIcon() {
  return <svg className="contact-method-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>;
}
async function copyContactEmail(email) {
  try {
    await navigator.clipboard.writeText(email);
    return true;
  } catch {
    return false;
  }
}
function FooterContactAddresses() {
  const listRef = useRef(null);
  const hoverTimeout = useRef(0);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [hoveredEmail, setHoveredEmail] = useState('');
  const [copyResult, setCopyResult] = useState(null);

  useEffect(() => {
    const list = listRef.current;
    const links = [...list.querySelectorAll('a')];
    if (CSS.supports('top: anchor(bottom)')) {
      for (const area of list.querySelectorAll('.contact-email-popover-area')) {
        if (!area.showPopover) continue;
        area.setAttribute('popover', 'manual');
        if (!area.matches(':popover-open')) area.showPopover();
      }
    }
    function updateSelection() {
      const selection = document.getSelection();
      const range = selection?.rangeCount && !selection.isCollapsed ? selection.getRangeAt(0) : null;
      const matches = range ? links.filter(link => range.intersectsNode(link)) : [];
      const email = matches.length === 1 ? matches[0].textContent : '';
      setSelectedEmail(email);
      setCopyResult(current => current?.email === email ? current : null);
    }
    document.addEventListener('selectionchange', updateSelection);
    return () => {
      document.removeEventListener('selectionchange', updateSelection);
      clearTimeout(hoverTimeout.current);
    };
  }, []);

  function showCopyHint(event, email) {
    if (event.pointerType === 'touch') return;
    clearTimeout(hoverTimeout.current);
    setHoveredEmail(email);
  }

  function scheduleHideCopyHint() {
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setHoveredEmail(''), 240);
  }

  async function copyEmail(email) {
    const copied = await copyContactEmail(email);
    setCopyResult({ email, copied });
  }

  return (
    <>
      <dl className="contact-addresses" ref={listRef}>
        {profile.emails.map((email, index) => (
          <div key={email}>
            <dt><ContactEmailIcon /><span className="about-accessible-title">邮箱</span></dt>
            <dd className="contact-email-item" data-selected={selectedEmail === email} data-hovered={hoveredEmail === email}
              style={{ anchorName: `--footer-email-${index}` }}
              onPointerEnter={event => showCopyHint(event, email)} onPointerLeave={scheduleHideCopyHint}>
              <a href={`mailto:${email}`} draggable={false} onClick={event => {
                const selection = document.getSelection();
                if (selection && !selection.isCollapsed && selection.containsNode(event.currentTarget, true)) event.preventDefault();
              }}>{email}</a>
              <span className="contact-email-popover-area" style={{ positionAnchor: `--footer-email-${index}` }}
                onPointerEnter={event => showCopyHint(event, email)} onPointerLeave={scheduleHideCopyHint}>
                <button className="contact-email-popover" type="button" aria-label={`复制邮箱 ${email}`}
                  onPointerDown={event => event.preventDefault()} onClick={() => copyEmail(email)}>
                  {copyResult?.email === email && copyResult.copied ? '已复制 ✓' : '复制邮箱'}
                </button>
              </span>
            </dd>
          </div>
        ))}
      </dl>
      <span className="about-accessible-title" role="status">
        {copyResult && (copyResult.copied ? `已复制 ${copyResult.email}` : '复制失败，请手动复制邮箱。')}
      </span>
    </>
  );
}
const CONTACT_STATEMENT_LINES = ['优秀的设计不仅仅', '在于你创造了什么，', '更在于你和谁一起', '创造了它。'];

function ContactStatement({ entering, revealRef }) {
  const effectRef = useRef(null);
  const textRef = useRef(null);

  useLayoutEffect(() => {
    const effect = effectRef.current;
    effect.dataset.statementReveal = 'waiting';
    if (entering) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    function update() {
      frame = 0;
      if (reduced.matches) {
        effect.dataset.statementReveal = 'settled';
        return;
      }
      // The previous section covers the translated footer until the boundary scrolls past it.
      const exposedTop = Math.max(0, revealRef.current.getBoundingClientRect().top);
      const state = effect.dataset.statementReveal;
      if (exposedTop >= innerHeight && state === 'waiting') return;
      const { top, bottom, height } = textRef.current.getBoundingClientRect();
      const visibleHeight = Math.min(bottom, innerHeight) - Math.max(top, exposedTop);
      if (visibleHeight <= 0 && state !== 'waiting') effect.dataset.statementReveal = 'waiting';
      else if (state === 'waiting' &&
        visibleHeight >= Math.min(height * .55, innerHeight * .4)) {
        effect.dataset.statementReveal = 'playing';
      }
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reduced.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', schedule);
      delete effect.dataset.statementReveal;
    };
  }, [entering, revealRef]);

  function finishReveal(event) {
    if (event.animationName === 'heading-reveal' &&
      event.target.parentElement === event.currentTarget.lastElementChild &&
      effectRef.current.dataset.statementReveal === 'playing') {
      effectRef.current.dataset.statementReveal = 'settled';
    }
  }

  return <div ref={effectRef} className="contact-statement-effect">
    <h2 ref={textRef} className="contact-statement" id="contact-title" onAnimationEnd={finishReveal}>
      {CONTACT_STATEMENT_LINES.map((line, index) => (
        <span key={line} style={{ '--contact-line-delay': `${index * 95}ms` }}>
          <AdaptiveInkText stagger={46}>{line}</AdaptiveInkText>
        </span>
      ))}
    </h2>
    <div className="contact-glass-layer" aria-hidden="true">
      <FluidGlass text="" textSource={textRef} shape="diamond" shapes={['diamond']} morphOnClick={false} color="#ffffff" tint={0.55} frost={0.65} size={260} refraction={1} dispersion={0.1} interaction="follow" constrainToBounds background="#9278ad" maxDevicePixelRatio={1.5} />
    </div>
  </div>;
}
function Contact({ onContact, onInformation, entering }) {
  const revealRef = useRef(null);
  useContactReveal(revealRef);
  return (
    <div className="contact-reveal" id="contact" ref={revealRef}>
    <footer className="contact" aria-labelledby="contact-title">
      <div className="contact-shell wrap">
        <div className="contact-topline">
          <a className="contact-small-name" href="#home">ZhaoFeiYu</a>
          <p>不止于形，创作不息</p>
          <div className="contact-legal">
            <p>版权所有 © {new Date().getFullYear()} 赵飞宇。保留所有权利。</p>
            <div className="contact-legal-links" aria-label="网站信息">
              <button onClick={() => onInformation('terms')}>条款</button>
              <button onClick={() => onInformation('privacy')}>隐私</button>
              <button onClick={() => onInformation('sitemap')}>网站地图</button>
              <span>网站由赵飞宇制作</span>
            </div>
          </div>
        </div>
        <div className="contact-body">
          <div className="contact-invitation">
            <button className="contact-conversation" onClick={onContact}>让我们开始对话吧。<Arrow diagonal /></button>
            <ContactStatement entering={entering} revealRef={revealRef} />
          </div>
          <div className="contact-columns">
            <div className="contact-column contact-methods">
              <h3>联系方式</h3>
              <FooterContactAddresses />
              <div className="contact-availability" lang="en">
                <p>
                  Based in China{' '}
                  <svg className="contact-country-flag" viewBox="0 0 30 20" aria-hidden="true">
                    <defs>
                      <path id="contact-flag-star" d="M0 -1 .2245 -.309 .9511 -.309 .3633 .118 .5878 .809 0 .382 -.5878 .809 -.3633 .118 -.9511 -.309 -.2245 -.309Z" />
                    </defs>
                    <path fill="#de2910" d="M0 0h30v20H0z" />
                    <g fill="#ffde00">
                      <use href="#contact-flag-star" transform="translate(5 5) scale(3)" />
                      <use href="#contact-flag-star" transform="translate(10 2) rotate(-121)" />
                      <use href="#contact-flag-star" transform="translate(12 4) rotate(-98)" />
                      <use href="#contact-flag-star" transform="translate(12 7) rotate(-74)" />
                      <use href="#contact-flag-star" transform="translate(10 9) rotate(-51)" />
                    </g>
                  </svg>{' '}
                  (GMT+8)
                </p>
                <p>Replies within 24–48h</p>
              </div>
              <a className="contact-return" href="#home" aria-label="保持探索，回到顶部">
                <span>保持探索</span>
                <span className="contact-back-top" aria-hidden="true">↑</span>
              </a>
            </div>
          </div>
        </div>
        <a className="contact-large-wordmark" href="#home" aria-label="ZhaoFeiYu，回到首页">
          <svg viewBox="13 -693.125 3828.35 708.75" aria-hidden="true" focusable="false">
            <text x="0" y="0" fill="currentColor">ZhaoFeiYu</text>
          </svg>
        </a>
      </div>

    </footer>
    </div>
  );
}
function SiteInformation({ type, onClose }) {
  if (type === 'sitemap') return <div className="site-information">
    <h2 id="dialog-title">网站地图</h2>
    <p className="site-information-intro">从这里前往各个章节。</p>
    <nav className="site-map" aria-label="网站地图">{siteSections.map(section => <a key={section.id} href={'#' + section.id} onClick={event => {
      event.preventDefault();
      onClose();
      requestAnimationFrame(() => {
        window.location.hash = section.id;
        document.getElementById(section.id)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      });
    }}><span>{section.title}</span><small>{section.description}</small><Arrow diagonal /></a>)}</nav>
  </div>;
  const policy = sitePolicies[type];
  if (!policy) return null;
  return <article className="site-information">
    <h2 id="dialog-title">{policy.title}</h2>
    <p className="site-information-date">更新日期：{policy.updated}</p>
    <p className="site-information-intro">{policy.introduction}</p>
    {policy.sections.map(section => <section className="site-policy-section" key={section.title}><h3>{section.title}</h3><p>{section.text}</p></section>)}
    <p className="site-policy-reference">参考法律：<a href={policy.reference.url} target="_blank" rel="noopener noreferrer">{policy.reference.label} ↗</a></p>
  </article>;
}
function ContactDialog() {
  const [copiedEmail, setCopiedEmail] = useState('');

  async function copyEmail(email) {
    setCopiedEmail(await copyContactEmail(email) ? email : '');
  }

  return (
    <div className="contact-dialog">
      <SectionLabel number="↗">开始一次对话</SectionLabel>
      <h2 id="dialog-title">好想法，<br />从联系开始。</h2>
      <p>欢迎通过邮件联系我。</p>
      {profile.emails.map(email => (
        <div className="contact-row" key={email}>
          <strong><a href={`mailto:${email}`}>{email}</a></strong>
          <button className="contact-copy" type="button" onClick={() => copyEmail(email)} aria-label={`复制邮箱 ${email}`}>
            {copiedEmail === email ? '已复制 ✓' : '复制邮箱'}
          </button>
        </div>
      ))}
      <span className="copy-status" aria-live="polite">{copiedEmail ? `已复制 ${copiedEmail}` : ''}</span>
    </div>
  );
}

function DetailDialog({ selection, onClose, onNavigate }) {
  const ref = useRef(null);
  useEffect(() => {
    if (selection) { ref.current.showModal(); ref.current.scrollTop = 0; ref.current.querySelector('.portfolio-folder-close, .portfolio-window-dismiss')?.focus({ preventScroll: true }); document.body.style.overflow = 'hidden'; } else { ref.current.close(); document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [selection]);
  useDraggableDialog(ref, selection);
  return <dialog ref={ref} className={selection === 'campus' ? "detail-dialog campus-detail-dialog" : selection === 'profile' ? "detail-dialog profile-detail-dialog" : selection?.folderStage ? "detail-dialog portfolio-folder-dialog" : selection?.isPortfolioSlot ? "detail-dialog portfolio-window" : "detail-dialog"} onCancel={onClose} onClick={e => { if (e.target === ref.current) onClose(); }} aria-labelledby="dialog-title"><div className="dialog-inner"><button className="dialog-close" onClick={onClose} aria-label="关闭弹窗">✕</button>{selection === 'profile' ? <Suspense fallback={<p className="profile-loading">正在打开个人卡片…</p>}><ProfileCardView /></Suspense> : selection === 'campus' ? <CampusView /> : selection === 'contact' ? <ContactDialog /> : typeof selection === 'string' ? <SiteInformation type={selection} onClose={onClose} /> : selection?.folderStage ? <PortfolioFolderPicker project={selection} onClose={onClose} onChoose={view => onNavigate({ ...selection, folderStage: false, view })} /> : selection?.isPortfolioSlot ? <PortfolioPreview key={selection.id + (selection.view || "")} project={selection} onClose={onClose} onBack={() => onNavigate({ ...selection, folderStage: true })} /> : selection ? <><ProjectArt type={selection.type} /><div className="project-description"><span className="subtle">{selection.en} / 概念项目</span><h2 id="dialog-title">{selection.name}</h2><h3>{selection.subtitle}</h3><p>{selection.description}</p><div className="scope">{selection.scope}</div><button className="text-button" onClick={onClose}>返回作品列表 <Arrow /></button></div></> : null}</div></dialog>;
}
function App() {
  const [selection, setSelection] = useState(null);
  const [entranceStage, setEntranceStage] = useState(() => (
    matchMedia('(prefers-reduced-motion: reduce)').matches ? null : 'loading'
  ));
  const entering = Boolean(entranceStage);
  useLayoutEffect(() => {
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
  }, []);
  const contact = () => setSelection('contact');
  return (
    <>
      <a className="skip-link" href="#about" inert={entering}>跳转至内容</a>
      <Header entranceStage={entranceStage} onEntranceStageChange={setEntranceStage} />
      <div inert={entering}>
        <main>
          <Hero entering={entering} />
          <About entering={entering} onOpenProfile={() => setSelection('profile')} onOpenCampus={() => setSelection('campus')} />
          <ExperienceChapter entering={entering} />
          <Projects onSelect={project => setSelection({ ...project, folderStage: true })} cursorEnabled={!selection && !entering} />
        </main>
        <Contact entering={entering} onContact={contact} onInformation={setSelection} />
        <DetailDialog selection={selection} onClose={() => setSelection(null)} onNavigate={setSelection} />
      </div>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);





