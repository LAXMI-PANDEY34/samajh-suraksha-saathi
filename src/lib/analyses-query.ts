import { queryOptions } from "@tanstack/react-query";
import { listAnalyses } from "./analyses.functions";

export const analysesQueryOptions = queryOptions({
  queryKey: ["analyses"],
  queryFn: () => listAnalyses(),
  staleTime: 30000,
});