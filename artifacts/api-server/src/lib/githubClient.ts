export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  private: boolean;
  language: string | null;
  default_branch: string;
  pushed_at: string | null;
  stargazers_count: number;
}

export interface GithubUser {
  login: string;
  name: string | null;
  avatar_url: string;
}

interface GithubFileContent {
  content: string;
  encoding: string;
}

export class GithubClient {
  private token: string;
  private baseUrl = "https://api.github.com";

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as any;
      throw new Error(body.message ?? `GitHub API error: HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  async getUser(): Promise<GithubUser> {
    return this.request<GithubUser>("/user");
  }

  async listRepos(): Promise<GithubRepo[]> {
    const repos: GithubRepo[] = [];
    let page = 1;
    while (repos.length < 300) {
      const batch = await this.request<GithubRepo[]>(
        `/user/repos?sort=pushed&per_page=100&page=${page}&visibility=all`
      );
      if (!batch.length) break;
      repos.push(...batch);
      if (batch.length < 100) break;
      page++;
    }
    return repos;
  }

  async getFileContent(owner: string, repo: string, filePath: string): Promise<string | null> {
    try {
      const data = await this.request<GithubFileContent>(`/repos/${owner}/${repo}/contents/${filePath}`);
      if (data.encoding === "base64") {
        return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8");
      }
      return data.content;
    } catch {
      return null;
    }
  }

  async fetchRepoFiles(fullName: string): Promise<Record<string, string>> {
    const [owner, repo] = fullName.split("/");
    const filesToFetch = [
      "package.json", "requirements.txt", "Dockerfile", "docker-compose.yml",
      ".env.example", "README.md", "pyproject.toml", "go.mod", "Cargo.toml",
      "next.config.js", "next.config.ts", "vite.config.ts", "app.py",
      "main.py", "server.js", "index.js", "src/index.ts", "src/main.ts",
    ];
    const results: Record<string, string> = {};
    await Promise.allSettled(
      filesToFetch.map(async (file) => {
        const content = await this.getFileContent(owner, repo, file);
        if (content) results[file] = content.slice(0, 3000);
      })
    );
    return results;
  }
}

export async function validateGithubToken(token: string): Promise<{ ok: boolean; username?: string; name?: string; error?: string }> {
  try {
    const client = new GithubClient(token);
    const user = await client.getUser();
    return { ok: true, username: user.login, name: user.name ?? undefined };
  } catch (err: any) {
    return { ok: false, error: err.message ?? "Invalid GitHub token" };
  }
}
