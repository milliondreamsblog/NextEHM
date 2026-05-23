import fs from 'fs';
import path from 'path';

const pagesToCreate = [
  { url: '(public)', componentPath: '@/pages-old/HomePage' },
  { url: '(public)/about', componentPath: '@/pages-old/About' },
  { url: '(public)/contact', componentPath: '@/pages-old/ContactPage' },
  { url: '(public)/contact/starc', componentPath: '@/pages-old/StarcContactPage' },
  { url: '(public)/projects', componentPath: '@/pages-old/ProjectsPage' },
  { url: '(public)/offerings/products', componentPath: '@/pages-old/Products' },
  { url: '(public)/offerings', componentPath: '@/pages-old/Services' },
  { url: '(public)/resources/gallery', componentPath: '@/pages-old/GalleryPage' },
  { url: '(public)/resources/webinar', componentPath: '@/pages-old/WebinarPage' },
  { url: '(public)/resources/webinar/[id]', componentPath: '@/components/Webinar/WebinarDetails' },
  { url: '(public)/resources/blogs', componentPath: '@/pages-old/BlogsPage' },
  { url: '(public)/resources/casestudies', componentPath: '@/pages-old/CaseStudyPage' },
  { url: '(public)/resources/WaterbodyRestoration', componentPath: '@/pages-old/WaterbodyRestoration' },
  { url: '(public)/resources/dnts', componentPath: '@/pages-old/DNTS' },
  { url: '(public)/offerings/sustainability-assessment-reporting', componentPath: '@/pages-old/SustainabilityAssessment&Reporting' },
  { url: '(public)/offerings/geophysical-investigation', componentPath: '@/pages-old/GeophysicalInvestigation' },
  { url: 'admin/login', componentPath: '@/components/Admin/AdminLoginModal' },
  { url: 'admin/dashboard', componentPath: '@/pages-old/AdminDashboard' },
];

pagesToCreate.forEach(page => {
  const dirPath = path.join('src', 'app', page.url);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const content = `"use client";
import PageComponent from "${page.componentPath}";

export default function Page() {
  return <PageComponent />;
}
`;
  
  fs.writeFileSync(path.join(dirPath, 'page.tsx'), content);
});

// Dynamic content pages
const dynamicPages = [
  { url: '(public)/blogs/[id]', componentPath: '@/common/Content/SingleContentPage', props: 'basePath="blogs" contentName="Blog"' },
  { url: '(public)/casestudies/[id]', componentPath: '@/common/Content/SingleContentPage', props: 'basePath="casestudies" contentName="Case Study"' },
  { url: '(public)/blogs/author/[authorName]', componentPath: '@/common/Content/AuthorContentPage', props: 'basePath="blogs" contentNamePlural="Blogs"' },
  { url: '(public)/casestudies/author/[authorName]', componentPath: '@/common/Content/AuthorContentPage', props: 'basePath="casestudies" contentNamePlural="Case Studies"' },
];

dynamicPages.forEach(page => {
  const dirPath = path.join('src', 'app', page.url);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const content = `"use client";
import PageComponent from "${page.componentPath}";

export default function Page() {
  return <PageComponent ${page.props} />;
}
`;
  
  fs.writeFileSync(path.join(dirPath, 'page.tsx'), content);
});

console.log("Pages generated successfully.");
