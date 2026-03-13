import { useEffect, useState } from 'react';
import api from '../../api';

export default function useBlogPosts() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.get('/blog/posts')
      .then((res) => {
        if (!alive) return;
        setPosts(res.data || []);
      })
      .catch(() => {
        if (!alive) return;
        setPosts([]);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { loading, posts };
}
