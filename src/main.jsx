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
const AboutScrollPreview = lazy(() => import('./components/AboutScrollPreview'));
const Folder = lazy(() => import('./components/Folder'));
const ProfileCardView = lazy(() => import('./components/ProfileCardView'));
import './styles.css';
import './hero.css';
import './about.css';
import './light-sections.css';
import './contact.css';
import './portfolio.css';

function Arrow({ diagonal = false, ...props }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5" /></svg>;
}
function AdaptiveInkText({ children }) {
  return <span className="adaptive-ink-text">{Array.from(String(children)).map((character, index) => <span data-ink-character key={index}>{character}</span>)}</span>;
}
function Wordmark() { return <a className="logo wordmark" href="#home" aria-label="回到首页"><AdaptiveInkText>{profile.name}</AdaptiveInkText></a>; }
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

function Header() {
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
  return <header ref={headerRef} className="header" data-surface={surface}><div className="header-inner wrap"><Wordmark /><button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="切换导航"><AdaptiveInkText>{open ? '关闭 −' : '菜单 +'}</AdaptiveInkText></button><nav className={open ? 'nav is-open' : 'nav'} aria-label="主导航">{[['about', '关于我'], ['experience', '工作经历'], ['projects', '作品展示'], ['contact', '联系我']].map(([id, label]) => <a key={id} href={'#' + id} onClick={() => setOpen(false)}><AdaptiveInkText>{label}</AdaptiveInkText></a>)}</nav></div></header>;
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
function Hero() {
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
    const updateMotion = () => { playRequested.current = !reduced.matches; sync(); };
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
  }, []);
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
        <img src="/assets/hero-poster.jpg?v=20261103" alt="" fetchPriority="high" />
        <video ref={videoRef} src="/assets/hero-original.mp4?v=20261103" muted loop playsInline preload="none" data-ready={videoStatus === 'ready'}
          onLoadedMetadata={({ currentTarget }) => { if (!currentTarget.videoWidth) showPoster(currentTarget); }}
          onLoadedData={({ currentTarget }) => { if (currentTarget.videoWidth) setVideoStatus('ready'); }}
          onWaiting={({ currentTarget }) => setWaitingForVideo(playRequested.current && !currentTarget.paused)}
          onPlaying={({ currentTarget }) => {
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
function About({ onOpenProfile, onOpenCampus }) {
  const aboutRef = useRef(null);
  const visit = useAboutEntrance(aboutRef);
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
function Experience() {
  const experienceRef = useRef(null);
  const updateBackgroundInk = useBackgroundInk(experienceRef, '.experience-caption, #experience-title, .experience-period, .experience-detail h3, .experience-detail p', '.experience-background');
  return (
    <section ref={experienceRef} className="experience-section section" id="experience" aria-labelledby="experience-title">
      <div className="experience-background" aria-hidden="true">
        <Grainient colors={['#6d6eab', '#9278ad', '#c8bbd6', '#ffffff']} angle={100} flow={1.1} silk={0.6} grainAmount={0.08} bands={3} dpr={1} onLuminanceMap={updateBackgroundInk} />
      </div>
      <p className="chapter-caption experience-caption wrap"><AdaptiveInkText>（工作）</AdaptiveInkText></p>
      <div className="experience-layout wrap">
        <h2 id="experience-title"><AdaptiveInkText>职业轨迹</AdaptiveInkText><span className="accent"><AdaptiveInkText>。</AdaptiveInkText></span></h2>
        <ol className="experience-list">
          {profile.experience.map((item, index) => (
            <li className="experience-item" key={index}>
              <span className="experience-period"><AdaptiveInkText>{item.period}</AdaptiveInkText></span>
              <div className="experience-detail">
                <h3><AdaptiveInkText>{item.role}</AdaptiveInkText></h3>
                <p><AdaptiveInkText>{item.company}</AdaptiveInkText></p>
              </div>
            </li>
          ))}
        </ol>
      </div>
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
        {portfolioSlots.map(project => <li className="portfolio-item" key={project.id}>
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
  const images = isProcess ? project.process?.images || [] : project.images?.length ? project.images : project.image ? [project.image] : [];
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
function ContactMethodIcon({ type }) {
  if (type === 'wechat') return <span className="contact-method-icon contact-wechat-icon" aria-hidden="true" />;
  return <svg className="contact-method-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {type === 'phone' ? <path d="M7.5 3H4.8C3.8 3 3 3.8 3 4.8 3 13.7 10.3 21 19.2 21c1 0 1.8-.8 1.8-1.8v-2.7l-4.5-1.8-1.8 2.1a14.1 14.1 0 0 1-7.5-7.5l2.1-1.8L7.5 3Z" /> : <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>}
  </svg>;
}
function ContactStatement() {
  const textRef = useRef(null);
  return <div className="contact-statement-effect">
    <h2 ref={textRef} className="contact-statement" id="contact-title">
      <span>优秀的设计不仅仅</span>
      <span>在于你创造了什么，</span>
      <span>更在于你和谁一起</span>
      <span>创造了它。</span>
    </h2>
    <div className="contact-glass-layer" aria-hidden="true">
      <FluidGlass text="" textSource={textRef} shape="diamond" shapes={['diamond']} morphOnClick={false} color="#ffffff" tint={0.55} frost={0.65} size={260} refraction={1} dispersion={0.1} interaction="follow" constrainToBounds background="#9278ad" maxDevicePixelRatio={1.5} />
    </div>
  </div>;
}
function Contact({ onContact, onInformation }) {
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
            <ContactStatement />
          </div>
          <div className="contact-columns">
          <div className="contact-column contact-methods">
            <h3>联系方式</h3>
            <dl className="contact-addresses">
              <div><dt><ContactMethodIcon type="phone" /><span className="about-accessible-title">电话</span></dt><dd><a href={'tel:' + profile.phone}>{profile.phone}</a></dd></div>
              <div><dt><ContactMethodIcon type="email" /><span className="about-accessible-title">邮箱</span></dt><dd><a href={'mailto:' + profile.email}>{profile.email}</a></dd></div>
              <div><dt><ContactMethodIcon type="wechat" /><span className="about-accessible-title">微信</span></dt><dd>{profile.wechat}</dd></div>
            </dl>
          </div>
          <div className="contact-column contact-return">
            <h3>保持探索</h3>
            <a className="contact-back-top" href="#home" aria-label="回到顶部"><span aria-hidden="true">↑</span></a>
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
function DetailDialog({ selection, onClose, onNavigate }) {
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (selection) { ref.current.showModal(); ref.current.scrollTop = 0; ref.current.querySelector('.portfolio-folder-close, .portfolio-window-dismiss')?.focus({ preventScroll: true }); setCopied(false); document.body.style.overflow = 'hidden'; } else { ref.current.close(); document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [selection]);
  useDraggableDialog(ref, selection);
  async function copyEmail() { try { await navigator.clipboard.writeText(profile.email); setCopied(true); } catch { setCopied(false); } }
  return <dialog ref={ref} className={selection === 'campus' ? "detail-dialog campus-detail-dialog" : selection === 'profile' ? "detail-dialog profile-detail-dialog" : selection?.folderStage ? "detail-dialog portfolio-folder-dialog" : selection?.isPortfolioSlot ? "detail-dialog portfolio-window" : "detail-dialog"} onCancel={onClose} onClick={e => { if (e.target === ref.current) onClose(); }} aria-labelledby="dialog-title"><div className="dialog-inner"><button className="dialog-close" onClick={onClose} aria-label="关闭弹窗">✕</button>{selection === 'profile' ? <Suspense fallback={<p className="profile-loading">正在打开个人卡片…</p>}><ProfileCardView /></Suspense> : selection === 'campus' ? <CampusView /> : selection === 'contact' ? <div className="contact-dialog"><SectionLabel number="↗">开始一次对话</SectionLabel><h2 id="dialog-title">好想法，<br />从联系开始。</h2><p>{profile.email ? '欢迎通过以下方式联系我。' : '联系方式待补充。收到你的简历后，这里将展示真实邮箱和微信。'}</p><div className="contact-row"><span>PHONE</span><strong><a href={'tel:' + profile.phone}>{profile.phone}</a></strong></div><div className="contact-row"><span>EMAIL</span><strong>{profile.email || '待补充'}</strong></div><div className="contact-row"><span>WECHAT</span><strong>{profile.wechat || '待补充'}</strong></div>{profile.email && <div className="contact-actions"><a className="primary-button" href={'mailto:' + profile.email}>发送邮件 <Arrow diagonal /></a><button onClick={copyEmail}>{copied ? '已复制 ✓' : '复制邮箱'}</button></div>}<span className="copy-status" aria-live="polite">{copied ? '邮箱已复制到剪贴板' : ''}</span></div> : typeof selection === 'string' ? <SiteInformation type={selection} onClose={onClose} /> : selection?.folderStage ? <PortfolioFolderPicker project={selection} onClose={onClose} onChoose={view => onNavigate({ ...selection, folderStage: false, view })} /> : selection?.isPortfolioSlot ? <PortfolioPreview key={selection.id + (selection.view || "")} project={selection} onClose={onClose} onBack={() => onNavigate({ ...selection, folderStage: true })} /> : selection ? <><ProjectArt type={selection.type} /><div className="project-description"><span className="subtle">{selection.en} / 概念项目</span><h2 id="dialog-title">{selection.name}</h2><h3>{selection.subtitle}</h3><p>{selection.description}</p><div className="scope">{selection.scope}</div><button className="text-button" onClick={onClose}>返回作品列表 <Arrow /></button></div></> : null}</div></dialog>;
}
function App() {
  const [selection, setSelection] = useState(null);
  useLayoutEffect(() => {
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
  }, []);
  const contact = () => setSelection('contact');
  return <><a className="skip-link" href="#about">跳转至内容</a><Header /><main><Hero /><About onOpenProfile={() => setSelection('profile')} onOpenCampus={() => setSelection('campus')} /><Experience /><Projects onSelect={project => setSelection({ ...project, folderStage: true })} cursorEnabled={!selection} /></main><Contact onContact={contact} onInformation={setSelection} /><DetailDialog selection={selection} onClose={() => setSelection(null)} onNavigate={setSelection} /></>;
}

createRoot(document.getElementById('root')).render(<App />);





