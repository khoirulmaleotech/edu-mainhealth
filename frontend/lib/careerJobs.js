export const CAREER_JOB_POSTS = [
  {
    id: "psychologist-partner-education-clinical",
    title: "Psikolog Pendidikan & Klinis",
    type: "Project-based Partner",
    department: "School Wellbeing & Talent Development",
    location: "Project Based sesuai school client di daerah masing-masing",
    summary:
      "Bergabung sebagai partner psikolog untuk asesmen, konseling, wellbeing program, dan talent mapping bersama sekolah.",
    highlights: [
      "Asesmen psikologi dan wellbeing siswa",
      "Pendampingan siswa, guru, dan orang tua",
      "Program intervensi dan edukasi psikologi",
      "Riset dan inovasi berbasis data & AI",
    ],
  },
];

export function getCareerJobById(jobId) {
  return CAREER_JOB_POSTS.find((job) => job.id === jobId) || null;
}
