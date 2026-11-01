import { UserProject } from '../types';
import { AuthSession } from './authService';

interface ProjectRow {
  id: string;
  title: string;
  data: UserProject;
  created_at: string;
  updated_at: string;
}

async function request<T>(session: AuthSession, method: string, body?: Record<string, unknown>): Promise<T> {
  const response = await fetch('/api/projects', {
    method,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  if (response.status === 204) return undefined as T;
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof result.error === 'string' ? result.error : 'Operazione sui progetti non riuscita.');
  }
  return result as T;
}

function fromRow(row: ProjectRow): UserProject {
  return { ...row.data, id: row.id, title: row.title };
}

export const userProjectsService = {
  async list(session: AuthSession): Promise<UserProject[]> {
    const result = await request<{ projects: ProjectRow[] }>(session, 'GET');
    return (result.projects || []).map(fromRow);
  },

  async create(session: AuthSession, project: UserProject): Promise<UserProject> {
    const { id: _localId, ...data } = project;
    const result = await request<{ project: ProjectRow }>(session, 'POST', {
      title: project.title,
      data
    });
    return fromRow(result.project);
  },

  async update(session: AuthSession, project: UserProject): Promise<UserProject> {
    const { id, ...data } = project;
    const result = await request<{ project: ProjectRow }>(session, 'PATCH', {
      id,
      title: project.title,
      data
    });
    return fromRow(result.project);
  },

  async remove(session: AuthSession, id: string): Promise<void> {
    await request<void>(session, 'DELETE', { id });
  }
};
