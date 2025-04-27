import axios from "axios";

const projectService = process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL;

const Project = {
  getAllProjects: async () => {
    return await axios.get(
      `${projectService}/api/project/allProjectList`
    );
  },
  
  getProjectById: async (projectId) => {
    return await axios.get(
      `${projectService}/api/project/${projectId}`
    );
  },
  
  createProject: async (projectData) => {
    return await axios.post(
      `${projectService}/api/project/createProject`,
      projectData,
      { 
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
  },
  
  updateProject: async (projectId, projectData) => {
    return await axios.put(
      `${projectService}/api/project/updateProject/${projectId}`,
      projectData,
      { 
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
  },
  
  deleteProject: async (projectId) => {
    return await axios.delete(
      `${projectService}/api/project/projectDelete/${projectId}`
    );
  }
};

export default Project;
