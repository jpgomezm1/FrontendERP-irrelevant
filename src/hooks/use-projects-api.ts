import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectsService, type Project } from "@/api";

const KEY = ["projects"];

export const useProjectsAPI = () =>
  useQuery({ queryKey: KEY, queryFn: () => ProjectsService.getProjectList({}) });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: Project) => ProjectsService.postProjectList(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};
