export interface LabNote {
  id: string;
  title: string;
  summary: string;
  date: string;
  status: "draft" | "published";
}

// Reserved for future writing / case-study content. No entries yet.
export const notes: LabNote[] = [];
