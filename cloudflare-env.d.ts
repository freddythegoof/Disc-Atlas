declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    DISC_PHOTOS: R2Bucket;
  }
}
declare namespace Cloudflare { interface Env { OPENAI_API_KEY?: string; OPENAI_MODEL?: string; } }
