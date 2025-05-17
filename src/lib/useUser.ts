import useSWR from 'swr';

export type SessionUser = {
  name: string;
  email: string;
  picture: string;
};

export function useUser() {
  const { data, error, isLoading } = useSWR<SessionUser>(
    '/api/auth/me',
    (url: string) => fetch(url).then((r) => (r.ok ? r.json() : null)),
  );
  return { user: data, error, isLoading };
}
