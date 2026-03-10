"use client";

import { useState } from "react";
import { projects } from "@/data/projects";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModal";
import GoToTop from "../GoToTop";

export default function Page() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <main className="font-inter min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto rounded-2xl p-6 md:p-8 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onViewDetails={setSelectedProject}
            />
          ))}
        </div>
      </div>
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      <GoToTop />
    </main>
  );
}
