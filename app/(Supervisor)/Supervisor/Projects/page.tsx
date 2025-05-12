"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Project {
  id: number;
  name: string;
  status: string;
  project_type: string;
  progress: number;
}

interface ProjectGroup {
  title: string;
  slug: string;
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  link: string;
  color: string;
  bgColor: string;
  icon: string;
  textColor: string;
  lightBg: string;
}

export default function DubingStatus() {
  const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL}/api/project/allProjectList`);
        const data = await response.json();
        
        if (data.success && data.projects) {
          const projectTypes = [
            { 
              type: "Musalsal", 
              color: "text-[#ff4e00]", 
              bgColor: "bg-[#ff4e00]",
              lightBg: "bg-[#fff4ed]",
              textColor: "text-[#ff4e00]",
              icon: "M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9zM11.25 3v4.5m0-4.5h-4.5m4.5 0h4.5m-4.5 13.5v-9" 
            },
            { 
              type: "Movie", 
              color: "text-[#ff4e00]", 
              bgColor: "bg-[#ff4e00]",
              lightBg: "bg-[#fff4ed]",
              textColor: "text-[#ff4e00]",
              icon: "M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5M7.125 14.25v1.5m0-1.5c0-.621.504-1.125 1.125-1.125M7.125 14.25C7.125 14.871 6.621 15.375 6 15.375m3.375-1.125c-.621 0-1.125.504-1.125 1.125m0 0c0 .621.504 1.125 1.125 1.125M6 15.375h9.75m-9.75 0c-.621 0-1.125.504-1.125 1.125M19.125 15.375H18m1.125 0c.621 0 1.125.504 1.125 1.125M18 15.375c-.621 0-1.125.504-1.125 1.125m0 0v1.5c0 .621.504 1.125 1.125 1.125M18 16.5h-9.75M18 16.5c.621 0 1.125.504 1.125 1.125M18 16.5c0 .621-.504 1.125-1.125 1.125m-12-1.125v1.5c0 .621-.504 1.125-1.125 1.125m0-3.75C6 12.504 6.504 12 7.125 12M6 10.875v1.5c0-.621.504-1.125 1.125-1.125"
            },
            { 
              type: "Documentary", 
              color: "text-[#ff4e00]", 
              bgColor: "bg-[#ff4e00]",
              lightBg: "bg-[#fff4ed]",
              textColor: "text-[#ff4e00]",
              icon: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
            }
          ];
          
          const calculatedGroups = projectTypes.map(typeInfo => {
            const typeProjects = data.projects.filter(
              (project: Project) => project.project_type === typeInfo.type
            );
            
            const pending = typeProjects.filter((p: Project) => p.status === "Pending").length;
            const inProgress = typeProjects.filter((p: Project) => p.status === "In Progress").length;
            const completed = typeProjects.filter((p: Project) => p.status === "Completed").length;
            
            return {
              title: `Astaan ${typeInfo.type}`,
              slug: typeInfo.type,
              total: typeProjects.length,
              pending,
              inProgress,
              completed,
              link: `/Supervisor/Projects/${typeInfo.type}`,
              color: typeInfo.color,
              bgColor: typeInfo.bgColor,
              lightBg: typeInfo.lightBg,
              textColor: typeInfo.textColor,
              icon: typeInfo.icon
            };
          });
          
          setProjectGroups(calculatedGroups);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff4e00] mx-auto mb-4"></div>
          <div className="text-xl font-medium text-[#ff4e00]">Loading project data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold mb-3 text-gray-800">
            <span className="text-[#ff4e00]">Astaan</span> Dubing Overview
          </h1>
          <div className="h-1 w-20 bg-[#ff4e00] mx-auto mb-4"></div>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Track progress across all your dubbing projects with real-time statistics and management tools
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projectGroups.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="px-7 pt-6 pb-6">
                {/* Top accent line */}
                <div className="h-1 w-full bg-[#ff4e00] absolute top-0 left-0 right-0"></div>
                
                {/* Header with title */}
                <div className="mb-7">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {item.title}
                  </h2>
                  <div className="h-0.5 w-12 bg-[#ff4e00] mt-1"></div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-5 mb-8">
                  {/* Total stat */}
                  <div className="bg-[#fff4ed] rounded-xl p-4 text-center">
                    <span className="block text-3xl font-bold mb-1 text-[#ff4e00]">{item.total}</span>
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">TOTAL</span>
                  </div>
                  
                  {/* Pending stat */}
                  <div className="bg-white rounded-xl p-4 text-center">
                    <span className="block text-3xl font-bold mb-1 text-[#ff4e00]">{item.pending}</span>
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">PENDING</span>
                  </div>
                  
                  {/* In Progress stat */}
                  <div className="bg-white rounded-xl p-4 text-center">
                    <span className="block text-3xl font-bold mb-1 text-[#ff4e00]">{item.inProgress}</span>
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">IN PROGRESS</span>
                  </div>
                  
                  {/* Completed stat */}
                  <div className="bg-white rounded-xl p-4 text-center">
                    <span className="block text-3xl font-bold mb-1 text-[#ff4e00]">{item.completed}</span>
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">COMPLETED</span>
                  </div>
                </div>

                {/* Progress section */}
                <div className="mb-7">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-[#ff4e00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                      Overall Progress
                    </div>
                    <div className="text-xl font-bold text-[#ff4e00]">
                      {item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0}%
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-full bg-[#ff4e00] rounded-full"
                      style={{
                        width: `${item.total > 0 ? (item.completed / item.total) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Button */}
                <Link
                  href={item.link}
                  className="w-full inline-flex justify-center items-center text-white font-semibold py-3.5 px-6 rounded-xl bg-[#ff4e00]"
                >
                  <span>Go to {item.slug}</span>
                  <svg className="w-5 h-5 ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
