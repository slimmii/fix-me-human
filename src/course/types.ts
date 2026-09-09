export type CoursePage = { id: string; title: string; markdown: string };
export type CourseTopic = {
  id: string;
  title: string;
  description: string;
  unlockAfter: string[];
  pages: CoursePage[];
};
