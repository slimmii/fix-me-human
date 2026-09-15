export type CoursePage = {
  id: string;
  title: string;
  markdown: string;
  jokes: { opened: string; read: string };
};
export type CourseTopic = {
  id: string;
  title: string;
  description: string;
  unlockAfter: string[];
  pages: CoursePage[];
};
