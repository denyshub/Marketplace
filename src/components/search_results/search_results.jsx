import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import GoodsList from '../goods_list/goods_list'; // Імпортуємо GoodsList для відображення товарів
import './search_result.css'
const SearchResults = () => {
  const [searchParams] = useSearchParams(); // Використовуємо useSearchParams для отримання параметрів запиту
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      const query = searchParams.get('q'); // Отримуємо значення параметра q
      if (!query) {
        setGoods([]); // Очистити результати, якщо запит порожній
        setLoading(false);
        return; // Якщо немає запиту, нічого не робимо
      }

      setLoading(true); // Встановлюємо Loading... в true при новому запиті
      setError(null); // Скидаємо помилку перед новим запитом

      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/v1/good/all/?search=${encodeURIComponent(query)}`);
        setGoods(response.data.results);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false); // Loading... завершено
      }
    };

    fetchSearchResults();
  }, [searchParams]); // Запит виконується при зміні параметрів пошуку

  if (loading) return <div>Loading......</div>;
  if (error) return <div>Помилка: {error}</div>;

  const query = searchParams.get('q'); // Отримуємо значення параметра q
  console.log(query)

  return (
    <div>
      <h2 className='search-title'>Results for: "{query}"</h2>
      <GoodsList  filters={{ search: query }} limit={25} all='1'/>
    </div>
  );
};

export default SearchResults;
