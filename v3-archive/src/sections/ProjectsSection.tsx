"use client";

"use client";

import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { projectsData } from '@/data/projectsData';

// Project Tile component
interface ProjectTileProps {
  project: any;
  index: number;
  randomIndex: number;
  isInView: boolean;
  onHover: (index: number | null) => void;
}

const ProjectTile: React.FC<ProjectTileProps> = ({ project, index, randomIndex, isInView, onHover }) => {
  const variants = {
    hidden: { y: "100vh", opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 15,
        delay: i * 0.15,
        duration: 1.2,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    }),
    hover: {
      scale: 1.1,
      y: -8,
      boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.2)",
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      custom={randomIndex}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      whileHover="hover"
      variants={variants}
      onClick={() => window.open(project.url, "_blank")}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      style={{
        width: '100%',
        aspectRatio: '1/1',
        backgroundColor: '#ffffff',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <img
        src={project.logoSrc || `/project-logos/placeholder.svg`}
        alt={`${project.name} logo`}
        style={{
          maxWidth: '70%',
          maxHeight: '70%',
          objectFit: 'contain',
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.05 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: project.color || '#000000',
        }}
      />
    </motion.div>
  );
};

// Project Info Panel
interface ProjectInfoPanelProps {
  project: any;
  isInView: boolean;
}

const ProjectInfoPanel: React.FC<ProjectInfoPanelProps> = ({ project, isInView }) => (
  <motion.div
    initial={{ opacity: 0, height: 0, y: 20 }}
    animate={{
      opacity: isInView ? 1 : 0,
      height: isInView ? 'auto' : 0,
      y: isInView ? 0 : 20,
    }}
    transition={{ duration: 0.6, delay: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
    style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '25px',
      boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
      marginTop: '30px',
      overflow: 'hidden',
      minHeight: '120px',
      transform: 'translateZ(0)',
    }}
  >
    {project ? (
      <motion.div
        key={project.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 100, damping: 10 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
          {project.name}
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span style={{ fontWeight: 'bold', opacity: 0.7 }}>Industry:</span> {project.industry}
          </div>
          <div>
            <span style={{ fontWeight: 'bold', opacity: 0.7 }}>Form:</span> {project.form}
          </div>
          <div>
            <span style={{ fontWeight: 'bold', opacity: 0.7 }}>Business Model:</span> {project.businessModel}
          </div>
          <div>
            <span style={{ fontWeight: 'bold', opacity: 0.7 }}>Status:</span> {project.status}
          </div>
        </div>
      </motion.div>
    ) : (
      <motion.div
        key="empty"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        exit={{ opacity: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontStyle: 'italic' }}
      >
        Hover over a project to see details
      </motion.div>
    )}
  </motion.div>
);

// Main section component
export default function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [randomOrder, setRandomOrder] = useState<number[]>([]);
  const sectionRef = React.useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  // Fisher-Yates shuffle for random order
  useEffect(() => {
    const indices = Array.from({ length: projectsData.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setRandomOrder(indices);
  }, []);

  const handleTileHover = (index: number | null) => {
    setSelectedProject(index !== null ? projectsData[index] : null);
  };

  return (
    <section
      ref={sectionRef}
      className="projectsSection"
      style={{
        padding: '10vh 5vw',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'visible',
        perspective: '1000px',
        zIndex: 1,
      }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '5vh',
          textAlign: 'center',
          fontFamily: 'Space Grotesk, sans-serif',
        }}
      >
        Projects
      </motion.h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '30px',
          width: '100%',
          position: 'relative',
          marginBottom: '40px',
          overflowX: 'auto',
          overflowY: 'visible',
          paddingBottom: '20px',
          minHeight: '180px',
          perspective: '1000px',
        }}
      >
        {projectsData.map((project, index) => {
          const animationIndex = randomOrder.indexOf(index);
          return (
            <ProjectTile
              key={project.id}
              project={project}
              index={index}
              randomIndex={animationIndex}
              isInView={isInView}
              onHover={handleTileHover}
            />
          );
        })}
      </div>
      <ProjectInfoPanel project={selectedProject} isInView={isInView} />
    </section>
  );
}
