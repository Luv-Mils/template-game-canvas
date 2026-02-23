export interface TeamSocial {
  platform: string;
  url: string;
}

export interface TeamMember {
  name: string;
  title: string;
  bio?: string;
  photo?: string;
  socials?: TeamSocial[];
}

export interface TeamGridConfig {
  headline?: string;
  subheadline?: string;
  members: TeamMember[];
  columns?: 2 | 3 | 4;
  variant?: 'card' | 'minimal' | 'overlay';
}
