import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useAxios from '../../../hooks/useAxios';

const Index = () => {
  const { userId, token } = useParams(); // Retrieve userId and token from URL params
  const api = useAxios();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
const verifyToken = async () => {
      try {
        const { data } = await api.get(`user/verify/${userId}/token/${token}`);
        setData(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null; // If no data yet, return null or loading indicator

  return (
    <div>
      <h1>Email Verification</h1>
      <p>{data.message}</p>
    </div>
  );
};

export default Index;
