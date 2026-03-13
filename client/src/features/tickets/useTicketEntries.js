import { useEffect, useState } from 'react';
import api from '../../api';

export default function useTicketEntries() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.get('/tickets-content')
      .then((res) => {
        if (!alive) return;
        setItems(res.data || []);
      })
      .catch(() => {
        if (!alive) return;
        setItems([]);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { loading, items };
}
