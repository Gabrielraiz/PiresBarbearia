import { useEffect, useState } from 'react';
import api from '../../api';

export default function useContentPage(pageKey) {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.get(`/pages-content/page/${pageKey}`)
      .then((res) => {
        if (!alive) return;
        setPage(res.data || null);
      })
      .catch(() => {
        if (!alive) return;
        setPage(null);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [pageKey]);

  return { loading, page };
}
