export type Profile = {
  id: string;
  email: string;
  name: string;
  major: string | null;
  year: string | null;
  created_at: string;
};

export type Lobby = {
  id: string;
  host_id: string;
  course_id: string;       // e.g. "CS 3114"
  location: string;        // e.g. "Torgersen Hall"
  description: string | null;
  max_size: number;
  expires_at: string;
  created_at: string;
  // joined from members count
  member_count?: number;
  host?: Pick<Profile, "name">;
};

export type LobbyMember = {
  lobby_id: string;
  user_id: string;
  joined_at: string;
};

export const VT_LOCATIONS = [
  "Torgersen Hall",
  "Newman Library",
  "D2 (Dietrick)",
  "Perry Street Cafe",
  "Surge Space",
  "McBryde Hall",
  "Goodwin Hall",
  "Other",
] as const;

export type VTLocation = (typeof VT_LOCATIONS)[number];
