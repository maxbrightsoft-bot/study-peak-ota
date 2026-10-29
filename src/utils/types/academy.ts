import { ParentLinkResponse } from "@/containers/AccountLinking/apiClients";

export type AcademyResponse = {
  id: number;
  name: string;
  image: string;
  coverImage?: string;
  domain: string;
  createdAt?: string;
  isOwned?: boolean | null;
  roles?: string[];
  children?: ParentLinkResponse[];
};