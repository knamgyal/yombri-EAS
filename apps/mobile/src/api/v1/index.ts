import { auth } from "./routes/auth";
import { me } from "./routes/me";
import { blocks } from "./routes/blocks";
import { follows } from "./routes/follows";
import { events } from "./routes/events";
import { profiles } from "./routes/profiles";
import { avatars } from "./routes/avatars";
import { orgs } from "./routes/orgs";
import { needs } from "./routes/needs";
import { pledges } from "./routes/pledges";

export const api = {
  v1: {
    auth,
    me,
    blocks,
    follows,
    events,
    profiles,
    avatars,
    orgs,
    needs,
    pledges,
  },
};
