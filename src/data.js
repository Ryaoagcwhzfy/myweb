// 将简历和作品内容集中在这里维护。null 表示尚未提供，页面不会虚构经历或数字。
export const profile = {
  name: 'ZhaoFeiYu',
  roles: ['Visual', 'AI', 'Brand Designer'],
  philosophy: {
    title: ['不止于形，', '创作不息'],
    lead: '形式是表达的起点，而非终点。',
    description: '在视觉、技术与思考的交汇处，探索更准确的表达。保持观察，持续实践，让创作成为一种不断深入的过程。',
  },
  hero: {
    particleText: '不止于形 ，创作不息',
    title: ['DESIGN', 'BEYOND LIMITS.', 'CREATE IMPACT.'],
    lead: '让想象成为现实，让设计创造价值。',
    description: '探索视觉、AI 与品牌的交汇点，用有想象力的表达，构建有辨识度的体验。',
  },
  chineseName: '赵飞宇',
  education: { institution: '嘉应大学', degree: '本科', major: '视觉传达', years: '2023–2027' },
  introduction: [
    '我以严谨的态度应对挑战——在大胆的构想与精妙的细节之间寻求平衡，并为每个项目注入清晰的思路和细致的关怀。无论与团队还是个人合作，我都专注于发掘机遇、完善解决方案，并交付既充满人文关怀又精益求精的作品。我最感兴趣的是那些致力于塑造人们生活方式的人。',
  ],
  principles: [
    { label: '使命', text: '持续产出有审美、有逻辑、有温度的设计，让每一次视觉表达都有价值、可落地、可迭代。', enLabel: 'mission', enText: 'Consistently create design with aesthetic sensibility, clear thinking, and human warmth, making every visual expression meaningful, practical, and open to continual refinement.' },
    { label: '愿景', text: '通过视觉领域的艺术指导与设计，为提升企业价值与打造强大品牌作出贡献', enLabel: 'vision', enText: 'Through art direction and design in the visual domain, we contribute to enhancing corporate value and building strong brands' },
    { label: '价值观', text: '不止于形，创作不息。', enLabel: 'value', enText: 'Beyond form. Never stop creating.' },
  ],
  services: ['AI创作业务', '平面设计', '视觉识别系统设计', '视频制作业务', '广告策划与设计', '建筑空间设计', '书籍设计', '文创衍生设计', 'UI设计'],
  phone: '18320233269',
  email: '2403199591@qq.com',
  wechat: 'zfy2403199591',
  experience: [{ period: '待补充', role: '你的工作经历', company: '收到简历后，在这里呈现职业轨迹与代表成果。' }],
  stats: [{ value: '—', label: '设计经验 / 待补充' }, { value: '—', label: '项目实践 / 待补充' }, { value: '—', label: '合作品牌 / 待补充' }],
};

// Fill image, name, and description as real work is supplied.
const firstProjectShowcase = [
  '/assets/projects/01/showcase-01.png',
  '/assets/projects/01/showcase-02.png',
  '/assets/projects/01/showcase-03.png',
  '/assets/projects/01/showcase-04.png',
  '/assets/projects/01/showcase-05.png',
  '/assets/projects/01/showcase-06.png',
];

export const portfolioSlots = Array.from({ length: 18 }, (_, index) => ({
  id: String(index + 1).padStart(2, '0'),
  name: '作品 ' + String(index + 1).padStart(2, '0'),
  image: null,
  images: [],
  process: { description: '', images: [] },
  description: '',
  category: '',
  year: '',
  format: ['portrait', 'square', 'landscape', 'square', 'portrait', 'square'][index % 6],
  isPortfolioSlot: true,
  ...(index === 0 ? {
    name: '赵飞宇个人网站建设',
    image: firstProjectShowcase[0],
    images: firstProjectShowcase,
    process: {
      description: '从首页的风格探索，到紫色视觉体系与各模块的设计落地。',
      documents: [
        { title: '01 · 首页构思与风格迭代', pdf: '/assets/projects/01/process-01.pdf', preview: '/assets/projects/01/process-01.jpg' },
        { title: '02 · 配色与模块设计', pdf: '/assets/projects/01/process-02.pdf', preview: '/assets/projects/01/process-02.jpg' },
      ],
    },
    category: 'UI设计',
    year: '2026年',
    description: '赵飞宇本人于2026年创建的个人网站，用于学习，交流分享，应聘和自我展示。',
    format: 'landscape',
  } : {}),
}));

export const projects = [
  { id: '01', name: 'FORM — 重塑品牌的感知', category: '品牌设计', en: 'BRAND EXPERIENCE', type: 'form', subtitle: '从一个形态，延展一种品牌语言。', description: '这是一组用于展示页面效果的品牌概念设计，并非真实客户案例。以柔和的叶绿、极简字体与有机形态，探索品牌识别在数字媒介中的表达。后续可替换为你的品牌策略、标志设计、视觉系统与实际应用。', scope: '品牌视觉 / 视觉识别 / 创意方向' },
  { id: '02', name: 'SYNTH — 想象与现实的边界', category: 'AI 设计', en: 'AI & CREATIVITY', type: 'synth', subtitle: '让技术，成为想象力的延伸。', description: '这是一组自然光影主题的视觉概念示例，用于预览作品集的图像呈现。当前封面采用提供的荷叶参考图，以蓝绿水色、叶脉与透光层次探索视觉表达。这里可替换为你的创作过程、提示词迭代、工作流和最终交付作品。', scope: 'AI 视觉探索 / 艺术指导 / 生成式设计' },
  { id: '03', name: 'VOID — 留白之间', category: '视觉设计', en: 'VISUAL EXPLORATION', type: 'void', subtitle: '在空间与秩序中，发现表达的力量。', description: '这是一组以建筑空间为主题的编辑视觉概念。通过黑白影像、字距与留白，建立克制的视觉节奏。这里可替换为你的海报、专题视觉、版式设计及作品说明。', scope: '编辑设计 / 视觉叙事 / 版式探索' },
];


